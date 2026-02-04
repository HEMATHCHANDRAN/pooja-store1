const Bill = require('../models/Bill');
const Item = require('../models/Item');
const QRCode = require('../models/QRCode');
const DailySummary = require('../models/DailySummary');

// Create bill with stock update
exports.createBill = async (req, res) => {
  const session = await Bill.startSession();
  session.startTransaction();
  
  try {
    const { items, paymentMethod, status = 'paid', totalAmount, totalItems } = req.body;
    const today = new Date();
    const date = today.toISOString().split('T')[0];
    const time = today.toLocaleTimeString('en-IN', { hour12: false });
    
    // Calculate totals if not provided
    let subtotal = 0;
    const billItems = [];
    
    // Validate and process items
    for (const item of items) {
      // Find item and check stock
      const dbItem = await Item.findById(item.itemId).session(session);
      if (!dbItem) {
        throw new Error(`Item not found: ${item.itemId}`);
      }
      
      if (dbItem.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for ${dbItem.name}. Available: ${dbItem.currentStock}`);
      }
      
      // Update stock
      dbItem.currentStock -= item.quantity;
      await dbItem.save({ session });
      
      // Calculate item total
      const itemTotal = item.quantity * item.price;
      subtotal += itemTotal;
      
      // Add to bill items
      billItems.push({
        itemId: item.itemId,
        itemCode: item.itemCode || dbItem.itemCode,
        name: item.name || dbItem.name,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal
      });
    }
    
    // Use provided totalAmount or calculated subtotal
    const finalAmount = totalAmount || subtotal;
    const finalTotalItems = totalItems || billItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update QR code daily count if not cash
    let qrUsed = null;
    if (paymentMethod !== 'Cash') {
      const qrCode = await QRCode.findOne({ name: paymentMethod }).session(session);
      if (qrCode) {
        qrCode.dailyCount += 1;
        qrCode.transactionCount += 1;
        qrCode.totalAmount += finalAmount;
        await qrCode.save({ session });
        qrUsed = qrCode.name;
      }
    }
    
    // Create bill WITHOUT billNumber (it will be auto-generated)
    const bill = new Bill({
      date: date,
      time: time,
      items: billItems,
      totalAmount: finalAmount,
      totalItems: finalTotalItems,
      paymentMethod,
      qrUsed,
      status
    });
    
    // Save bill - pre-save middleware will generate billNumber
    await bill.save({ session });
    
    console.log('Bill created with number:', bill.billNumber);
    
    // Update daily summary
    await updateDailySummary(date, finalAmount, paymentMethod, billItems, session);
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      success: true,
      data: {
        _id: bill._id,
        billNumber: bill.billNumber,
        date: bill.date,
        time: bill.time,
        totalAmount: bill.totalAmount,
        totalItems: bill.totalItems,
        items: bill.items,
        paymentMethod: bill.paymentMethod,
        status: bill.status,
        createdAt: bill.createdAt
      },
      message: 'Bill created successfully'
    });
    
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error creating bill:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update bill status
exports.updateBill = async (req, res) => {
  try {
    const { status } = req.body;
    
    console.log('Updating bill:', req.params.id, 'Status:', status);
    
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!bill) {
      return res.status(404).json({ 
        success: false, 
        error: 'Bill not found' 
      });
    }
    
    res.json({
      success: true,
      data: bill,
      message: 'Bill updated successfully'
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Helper function to update daily summary
async function updateDailySummary(date, amount, paymentMethod, items, session) {
  try {
    const summary = await DailySummary.findOneAndUpdate(
      { date },
      {
        $inc: {
          totalSales: amount,
          totalBills: 1,
          [`paymentSummary.${paymentMethod}.amount`]: amount,
          [`paymentSummary.${paymentMethod}.count`]: 1
        },
        $setOnInsert: {
          date: date,
          topItems: []
        }
      },
      { upsert: true, session, new: true }
    );
    
    // Update top items
    for (const item of items) {
      const existingItemIndex = summary.topItems.findIndex(
        i => i.itemId.toString() === item.itemId.toString()
      );
      
      if (existingItemIndex >= 0) {
        summary.topItems[existingItemIndex].quantity += item.quantity;
        summary.topItems[existingItemIndex].revenue += item.total;
      } else {
        summary.topItems.push({
          itemId: item.itemId,
          name: item.name,
          quantity: item.quantity,
          revenue: item.total
        });
      }
    }
    
    // Keep only top 10 items by revenue
    summary.topItems.sort((a, b) => b.revenue - a.revenue);
    if (summary.topItems.length > 10) {
      summary.topItems = summary.topItems.slice(0, 10);
    }
    
    await summary.save({ session });
  } catch (error) {
    console.error('Error updating daily summary:', error);
    throw error;
  }
}

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const { date, page = 1, limit = 50, paymentMethod } = req.query;
    
    let query = {};
    if (date) query.date = date;
    if (paymentMethod && paymentMethod !== 'All') query.paymentMethod = paymentMethod;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Bill.countDocuments(query);
    
    res.json({
      success: true,
      data: bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting bills:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get today's bills
exports.getTodayBills = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const bills = await Bill.find({ date: today }).sort({ createdAt: -1 });
    
    res.json({ success: true, data: bills });
  } catch (error) {
    console.error('Error getting today\'s bills:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get bill by number
exports.getBillByNumber = async (req, res) => {
  try {
    const bill = await Bill.findOne({ billNumber: req.params.billNumber });
    
    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }
    
    res.json({ success: true, data: bill });
  } catch (error) {
    console.error('Error getting bill by number:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get bills by date range
exports.getBillsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Start date and end date are required' });
    }
    
    const bills = await Bill.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1, createdAt: -1 });
    
    res.json({ success: true, data: bills });
  } catch (error) {
    console.error('Error getting bills by date range:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reprint bill
exports.reprintBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ billNumber: req.params.billNumber });
    
    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }
    
    res.json({ success: true, data: bill });
  } catch (error) {
    console.error('Error reprinting bill:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};