const Bill = require('../models/Bill');
const QRCode = require('../models/QRCode');
const DailySummary = require('../models/DailySummary');
const moment = require('moment');

// Get daily closing data
exports.getDailyClosing = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || moment().format('YYYY-MM-DD');

    // Get all bills for the date
    const bills = await Bill.find({ 
      date: targetDate,
      status: 'paid'
    }).sort({ createdAt: -1 });

    // Calculate totals
    let totalSales = 0;
    let totalBills = bills.length;
    const paymentSummary = {
      'Mohan Kumar': { amount: 0, count: 0 },
      'Nalini': { amount: 0, count: 0 },
      'Lalitha': { amount: 0, count: 0 },
      'Hemath': { amount: 0, count: 0 },
      'Cash': { amount: 0, count: 0 }
    };

    // Calculate payment method totals
    bills.forEach(bill => {
      totalSales += bill.totalAmount;
      if (paymentSummary[bill.paymentMethod]) {
        paymentSummary[bill.paymentMethod].amount += bill.totalAmount;
        paymentSummary[bill.paymentMethod].count += 1;
      }
    });

    // Get QR code usage
    const qrCodes = await QRCode.find({});
    const qrUsage = {};
    
    qrCodes.forEach(qr => {
      qrUsage[qr.name] = {
        dailyCount: qr.dailyCount || 0,
        transactionCount: qr.transactionCount || 0,
        totalAmount: qr.totalAmount || 0,
        dailyLimit: 20,
        remainingTransactions: 20 - (qr.dailyCount || 0)
      };
    });

    // Check if day is already closed
    const existingSummary = await DailySummary.findOne({ date: targetDate });
    const isDayClosed = !!existingSummary;

    // Get top selling items
    const itemSales = {};
    bills.forEach(bill => {
      bill.items.forEach(item => {
        const itemId = item.itemId.toString();
        if (!itemSales[itemId]) {
          itemSales[itemId] = {
            itemId: item.itemId,
            name: item.name,
            quantity: 0,
            amount: 0
          };
        }
        itemSales[itemId].quantity += item.quantity;
        itemSales[itemId].amount += item.total;
      });
    });

    const topItems = Object.values(itemSales)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Prepare response
    const closingData = {
      date: targetDate,
      summary: {
        totalSales,
        totalBills,
        averageBillValue: totalBills > 0 ? totalSales / totalBills : 0
      },
      paymentSummary,
      qrUsage,
      bills: bills.map(bill => ({
        billNumber: bill.billNumber,
        time: bill.time,
        amount: bill.totalAmount,
        paymentMethod: bill.paymentMethod,
        items: bill.items.length
      })),
      topItems,
      isDayClosed,
      closingTime: existingSummary ? existingSummary.closingTime : null,
      closedBy: existingSummary ? existingSummary.closedBy : null
    };

    res.json({
      success: true,
      data: closingData
    });

  } catch (error) {
    console.error('Error getting daily closing data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Close the day
exports.closeDay = async (req, res) => {
  const session = await Bill.startSession();
  session.startTransaction();

  try {
    const { date, cashVerified, notes } = req.body;
    const targetDate = date || moment().format('YYYY-MM-DD');
    const closedBy = 'owner'; // In real app, get from auth

    // Check if day is already closed
    const existingSummary = await DailySummary.findOne({ date: targetDate });
    if (existingSummary) {
      return res.status(400).json({
        success: false,
        error: 'Day is already closed'
      });
    }

    // Get all bills for the date
    const bills = await Bill.find({ 
      date: targetDate,
      status: 'paid'
    }).session(session);

    // Calculate totals
    let totalSales = 0;
    let totalBills = bills.length;
    const paymentSummary = {
      'Mohan Kumar': { amount: 0, count: 0 },
      'Nalini': { amount: 0, count: 0 },
      'Lalitha': { amount: 0, count: 0 },
      'Hemath': { amount: 0, count: 0 },
      'Cash': { amount: 0, count: 0 }
    };

    // Calculate payment method totals
    bills.forEach(bill => {
      totalSales += bill.totalAmount;
      if (paymentSummary[bill.paymentMethod]) {
        paymentSummary[bill.paymentMethod].amount += bill.totalAmount;
        paymentSummary[bill.paymentMethod].count += 1;
      }
    });

    // Get top selling items
    const topItems = [];
    const itemSales = {};
    
    bills.forEach(bill => {
      bill.items.forEach(item => {
        const itemId = item.itemId.toString();
        if (!itemSales[itemId]) {
          itemSales[itemId] = {
            itemId: item.itemId,
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        itemSales[itemId].quantity += item.quantity;
        itemSales[itemId].revenue += item.total;
      });
    });

    // Convert to array and sort
    Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .forEach(item => topItems.push(item));

    // Create daily summary
    const dailySummary = new DailySummary({
      date: targetDate,
      totalSales,
      totalBills,
      paymentSummary,
      topItems,
      cashVerified: cashVerified || false,
      notes: notes || '',
      closedBy,
      closingTime: new Date()
    });

    await dailySummary.save({ session });

    // Reset QR code daily counts
    await QRCode.updateMany(
      {},
      { 
        $set: { dailyCount: 0 },
        $inc: { transactionCount: 0 } // Keep total count, reset only daily
      },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Prepare response
    const closingData = {
      date: targetDate,
      summary: {
        totalSales,
        totalBills,
        averageBillValue: totalBills > 0 ? totalSales / totalBills : 0
      },
      paymentSummary,
      topItems: topItems.slice(0, 5),
      cashVerified,
      notes,
      closedBy,
      closingTime: dailySummary.closingTime
    };

    res.json({
      success: true,
      data: closingData,
      message: 'Day closed successfully'
    });

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error('Error closing day:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get closed days list
exports.getClosedDays = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const closedDays = await DailySummary.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DailySummary.countDocuments();

    res.json({
      success: true,
      data: closedDays,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting closed days:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get closing details for a specific date
exports.getClosingDetails = async (req, res) => {
  try {
    const { date } = req.params;

    const dailySummary = await DailySummary.findOne({ date });
    
    if (!dailySummary) {
      return res.status(404).json({
        success: false,
        error: 'Closing details not found for this date'
      });
    }

    // Get bills for the date
    const bills = await Bill.find({ 
      date: date,
      status: 'paid'
    }).sort({ createdAt: -1 });

    const closingDetails = {
      date: dailySummary.date,
      summary: {
        totalSales: dailySummary.totalSales,
        totalBills: dailySummary.totalBills,
        cashVerified: dailySummary.cashVerified,
        notes: dailySummary.notes,
        closedBy: dailySummary.closedBy,
        closingTime: dailySummary.closingTime
      },
      paymentSummary: dailySummary.paymentSummary,
      topItems: dailySummary.topItems,
      bills: bills.map(bill => ({
        billNumber: bill.billNumber,
        time: bill.time,
        amount: bill.totalAmount,
        paymentMethod: bill.paymentMethod,
        items: bill.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }))
      }))
    };

    res.json({
      success: true,
      data: closingDetails
    });

  } catch (error) {
    console.error('Error getting closing details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};