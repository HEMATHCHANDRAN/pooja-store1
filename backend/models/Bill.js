const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  itemCode: String,
  name: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    unique: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  time: {
    type: String,
    required: true
  },
  items: [billItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Mohan Kumar', 'Nalini', 'Lalitha', 'Hemath', 'Cash'],
    index: true
  },
  qrUsed: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'paid'
  },
  createdBy: {
    type: String,
    default: 'owner'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate bill number before saving
billSchema.pre('save', async function(next) {
  try {
    // Only generate billNumber if it doesn't exist
    if (!this.billNumber) {
      const today = new Date();
      const date = today.toISOString().split('T')[0];
      const dateStr = date.replace(/-/g, '');
      
      // Find the highest bill number for today
      const todayStart = new Date(date);
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date(date);
      todayEnd.setHours(23, 59, 59, 999);
      
      const lastBill = await this.constructor.findOne({
        createdAt: { $gte: todayStart, $lte: todayEnd }
      }).sort({ billNumber: -1 });
      
      let serialNumber = 1;
      if (lastBill && lastBill.billNumber) {
        // Extract serial number from bill number like "B20240123-001"
        const parts = lastBill.billNumber.split('-');
        if (parts.length > 1) {
          const lastNum = parseInt(parts[1]) || 0;
          serialNumber = lastNum + 1;
        }
      }
      
      this.billNumber = `B${dateStr}-${String(serialNumber).padStart(3, '0')}`;
      console.log('Generated bill number:', this.billNumber);
    }
    
    // Set date and time if not provided
    const now = new Date();
    if (!this.date) {
      this.date = now.toISOString().split('T')[0];
    }
    
    if (!this.time) {
      this.time = now.toLocaleTimeString('en-IN', { hour12: false });
    }
    
    next();
  } catch (error) {
    console.error('Error in bill pre-save middleware:', error);
    next(error);
  }
});

module.exports = mongoose.model('Bill', billSchema);