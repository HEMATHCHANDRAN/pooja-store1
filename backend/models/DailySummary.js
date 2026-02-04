const mongoose = require('mongoose');

const dailySummarySchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalBills: {
    type: Number,
    default: 0
  },
  paymentSummary: {
    type: Map,
    of: {
      amount: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },
    default: {}
  },
  topItems: [{
    itemId: mongoose.Schema.Types.ObjectId,
    name: String,
    quantity: Number,
    revenue: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DailySummary', dailySummarySchema);