const Bill = require('../models/Bill');
const Item = require('../models/Item');
const DailySummary = require('../models/DailySummary');
const QRCode = require('../models/QRCode');

// Item-wise sales report
exports.getItemWiseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    // Get all bills in date range
    const bills = await Bill.find({
      date: { $gte: startDate, $lte: endDate },
      status: 'paid'
    });

    // Aggregate item sales
    const itemSales = {};
    
    bills.forEach(bill => {
      bill.items.forEach(item => {
        const itemId = item.itemId.toString();
        
        if (!itemSales[itemId]) {
          itemSales[itemId] = {
            itemId: item.itemId,
            itemCode: item.itemCode,
            name: item.name,
            totalQuantity: 0,
            totalAmount: 0,
            averagePrice: 0
          };
        }
        
        itemSales[itemId].totalQuantity += item.quantity;
        itemSales[itemId].totalAmount += item.total;
      });
    });

    // Calculate average price and get current stock
    const itemIds = Object.keys(itemSales);
    const items = await Item.find({ _id: { $in: itemIds } });
    
    const itemMap = {};
    items.forEach(item => {
      itemMap[item._id.toString()] = {
        currentStock: item.currentStock,
        price: item.price,
        category: item.category
      };
    });

    // Prepare final data
    const reportData = Object.values(itemSales).map(sale => {
      const itemInfo = itemMap[sale.itemId.toString()] || {};
      return {
        ...sale,
        currentStock: itemInfo.currentStock || 0,
        price: itemInfo.price || 0,
        category: itemInfo.category || 'Unknown',
        averagePrice: sale.totalQuantity > 0 ? sale.totalAmount / sale.totalQuantity : 0
      };
    });

    // Sort by total amount (highest first)
    reportData.sort((a, b) => b.totalAmount - a.totalAmount);

    // Calculate totals
    const totals = reportData.reduce((acc, item) => ({
      totalQuantity: acc.totalQuantity + item.totalQuantity,
      totalAmount: acc.totalAmount + item.totalAmount
    }), { totalQuantity: 0, totalAmount: 0 });

    res.json({
      success: true,
      data: {
        items: reportData,
        totals,
        dateRange: { startDate, endDate },
        totalItems: reportData.length
      }
    });

  } catch (error) {
    console.error('Error generating item-wise report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Daily report
exports.getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date is required'
      });
    }

    // Get bills for the date
    const bills = await Bill.find({ 
      date: date,
      status: 'paid'
    }).sort({ createdAt: -1 });

    // Calculate summary
    let totalSales = 0;
    let totalBills = bills.length;
    const paymentSummary = {
      'Mohan Kumar': { amount: 0, count: 0 },
      'Nalini': { amount: 0, count: 0 },
      'Lalitha': { amount: 0, count: 0 },
      'Hemath': { amount: 0, count: 0 },
      'Cash': { amount: 0, count: 0 }
    };

    bills.forEach(bill => {
      totalSales += bill.totalAmount;
      if (paymentSummary[bill.paymentMethod]) {
        paymentSummary[bill.paymentMethod].amount += bill.totalAmount;
        paymentSummary[bill.paymentMethod].count += 1;
      }
    });

    // Get top selling items for the day
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
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        date,
        totalSales,
        totalBills,
        paymentSummary,
        topItems,
        bills: bills.map(bill => ({
          billNumber: bill.billNumber,
          time: bill.time,
          totalAmount: bill.totalAmount,
          paymentMethod: bill.paymentMethod,
          itemsCount: bill.items.length
        }))
      }
    });

  } catch (error) {
    console.error('Error generating daily report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Weekly report
exports.getWeeklyReport = async (req, res) => {
  try {
    const { startDate } = req.query;
    
    if (!startDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date is required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // 7 days total

    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    // Get bills for the week
    const bills = await Bill.find({
      date: { $gte: startDateStr, $lte: endDateStr },
      status: 'paid'
    });

    // Group by day
    const dailyData = {};
    const days = [];
    
    // Initialize all days in the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
      
      dailyData[dateStr] = {
        date: dateStr,
        day: dayName,
        sales: 0,
        bills: 0
      };
      days.push(dateStr);
    }

    // Fill with actual data
    bills.forEach(bill => {
      if (dailyData[bill.date]) {
        dailyData[bill.date].sales += bill.totalAmount;
        dailyData[bill.date].bills += 1;
      }
    });

    // Calculate totals
    let totalSales = 0;
    let totalBills = 0;
    
    const dailyReport = days.map(dateStr => {
      const dayData = dailyData[dateStr];
      totalSales += dayData.sales;
      totalBills += dayData.bills;
      return dayData;
    });

    // Calculate day-wise averages
    const averages = {
      averageDailySales: totalSales / 7,
      averageDailyBills: totalBills / 7,
      highestSalesDay: dailyReport.reduce((max, day) => 
        day.sales > max.sales ? day : max
      , { sales: 0 }),
      lowestSalesDay: dailyReport.reduce((min, day) => 
        day.sales < min.sales || min.sales === 0 ? day : min
      , { sales: 0 })
    };

    res.json({
      success: true,
      data: {
        week: {
          startDate: startDateStr,
          endDate: endDateStr
        },
        dailyReport,
        totals: {
          totalSales,
          totalBills
        },
        averages
      }
    });

  } catch (error) {
    console.error('Error generating weekly report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Monthly report
exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: 'Month and year are required'
      });
    }

    const monthInt = parseInt(month);
    const yearInt = parseInt(year);
    
    if (monthInt < 1 || monthInt > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid month'
      });
    }

    // Create date range for the month
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(yearInt, monthInt, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

    // Get bills for the month
    const bills = await Bill.find({
      date: { $gte: startDate, $lte: endDate },
      status: 'paid'
    });

    // Get previous month for comparison
    const prevMonth = monthInt === 1 ? 12 : monthInt - 1;
    const prevYear = monthInt === 1 ? yearInt - 1 : yearInt;
    const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
    const prevStartDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-01`;
    const prevEndDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-${prevLastDay.toString().padStart(2, '0')}`;

    const prevMonthBills = await Bill.find({
      date: { $gte: prevStartDate, $lte: prevEndDate },
      status: 'paid'
    });

    // Calculate current month totals
    let totalSales = 0;
    let totalBills = bills.length;
    const paymentSummary = {
      'Mohan Kumar': { amount: 0, count: 0 },
      'Nalini': { amount: 0, count: 0 },
      'Lalitha': { amount: 0, count: 0 },
      'Hemath': { amount: 0, count: 0 },
      'Cash': { amount: 0, count: 0 }
    };

    bills.forEach(bill => {
      totalSales += bill.totalAmount;
      if (paymentSummary[bill.paymentMethod]) {
        paymentSummary[bill.paymentMethod].amount += bill.totalAmount;
        paymentSummary[bill.paymentMethod].count += 1;
      }
    });

    // Calculate previous month totals
    let prevMonthSales = 0;
    prevMonthBills.forEach(bill => {
      prevMonthSales += bill.totalAmount;
    });

    // Calculate growth
    const salesGrowth = prevMonthSales > 0 
      ? ((totalSales - prevMonthSales) / prevMonthSales * 100).toFixed(2)
      : 100;

    // Get daily breakdown
    const dailyData = {};
    for (let day = 1; day <= lastDay; day++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      dailyData[dateStr] = {
        date: dateStr,
        sales: 0,
        bills: 0
      };
    }

    bills.forEach(bill => {
      if (dailyData[bill.date]) {
        dailyData[bill.date].sales += bill.totalAmount;
        dailyData[bill.date].bills += 1;
      }
    });

    const dailyReport = Object.values(dailyData);

    // Get top selling items for the month
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
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        month: {
          month: monthInt,
          year: yearInt,
          monthName: new Date(yearInt, monthInt - 1, 1).toLocaleDateString('en-IN', { month: 'long' })
        },
        totals: {
          totalSales,
          totalBills,
          averageDailySales: totalSales / lastDay,
          averageBillValue: totalBills > 0 ? totalSales / totalBills : 0
        },
        comparison: {
          previousMonth: prevMonthSales,
          growth: parseFloat(salesGrowth),
          growthType: salesGrowth >= 0 ? 'increase' : 'decrease'
        },
        paymentSummary,
        dailyReport,
        topItems
      }
    });

  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Payment method report
exports.getPaymentMethodReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    // Get bills in date range
    const bills = await Bill.find({
      date: { $gte: startDate, $lte: endDate },
      status: 'paid'
    });

    // Initialize payment methods
    const paymentMethods = [
      'Mohan Kumar',
      'Nalini', 
      'Lalitha',
      'Hemath',
      'Cash'
    ];

    const paymentData = {};
    let totalAmount = 0;
    let totalTransactions = 0;

    // Initialize all payment methods
    paymentMethods.forEach(method => {
      paymentData[method] = {
        amount: 0,
        transactions: 0,
        percentage: 0
      };
    });

    // Calculate totals
    bills.forEach(bill => {
      if (paymentData[bill.paymentMethod]) {
        paymentData[bill.paymentMethod].amount += bill.totalAmount;
        paymentData[bill.paymentMethod].transactions += 1;
        totalAmount += bill.totalAmount;
        totalTransactions += 1;
      }
    });

    // Calculate percentages
    Object.keys(paymentData).forEach(method => {
      paymentData[method].percentage = totalAmount > 0 
        ? (paymentData[method].amount / totalAmount * 100).toFixed(2)
        : 0;
    });

    // Get QR code transaction limits
    const qrCodes = await QRCode.find({});
    const qrLimits = {};
    qrCodes.forEach(qr => {
      qrLimits[qr.name] = {
        dailyLimit: 20,
        dailyUsed: qr.dailyCount || 0,
        remaining: 20 - (qr.dailyCount || 0)
      };
    });

    // Sort by amount (highest first)
    const sortedData = Object.entries(paymentData)
      .map(([method, data]) => ({
        method,
        ...data
      }))
      .sort((a, b) => b.amount - a.amount);

    res.json({
      success: true,
      data: {
        dateRange: { startDate, endDate },
        paymentMethods: sortedData,
        totals: {
          totalAmount,
          totalTransactions,
          averageTransaction: totalTransactions > 0 ? totalAmount / totalTransactions : 0
        },
        qrLimits,
        summary: {
          upiTotal: paymentData['Mohan Kumar'].amount + 
                   paymentData['Nalini'].amount + 
                   paymentData['Lalitha'].amount + 
                   paymentData['Hemath'].amount,
          cashTotal: paymentData['Cash'].amount,
          upiPercentage: totalAmount > 0 ? 
            ((paymentData['Mohan Kumar'].amount + 
              paymentData['Nalini'].amount + 
              paymentData['Lalitha'].amount + 
              paymentData['Hemath'].amount) / totalAmount * 100).toFixed(2) : 0
        }
      }
    });

  } catch (error) {
    console.error('Error generating payment method report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Export report to Excel
exports.exportToExcel = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    if (!type || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Report type, start date, and end date are required'
      });
    }

    // Generate appropriate report based on type
    let reportData;
    switch (type) {
      case 'item-wise':
        // Get item-wise report data
        const itemReport = await exports.getItemWiseReportData(startDate, endDate);
        reportData = itemReport;
        break;
      case 'payment':
        // Get payment report data
        const paymentReport = await exports.getPaymentMethodReportData(startDate, endDate);
        reportData = paymentReport;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid report type'
        });
    }

    // In a real implementation, you would use a library like exceljs
    // to generate Excel file. For now, we'll return JSON.
    res.json({
      success: true,
      data: reportData,
      message: 'Export functionality would generate Excel file'
    });

  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function for item-wise report data
exports.getItemWiseReportData = async (startDate, endDate) => {
  const bills = await Bill.find({
    date: { $gte: startDate, $lte: endDate },
    status: 'paid'
  });

  const itemSales = {};
  
  bills.forEach(bill => {
    bill.items.forEach(item => {
      const itemId = item.itemId.toString();
      
      if (!itemSales[itemId]) {
        itemSales[itemId] = {
          itemId: item.itemId,
          itemCode: item.itemCode,
          name: item.name,
          totalQuantity: 0,
          totalAmount: 0
        };
      }
      
      itemSales[itemId].totalQuantity += item.quantity;
      itemSales[itemId].totalAmount += item.total;
    });
  });

  return Object.values(itemSales);
};

// Helper function for payment report data
exports.getPaymentMethodReportData = async (startDate, endDate) => {
  const bills = await Bill.find({
    date: { $gte: startDate, $lte: endDate },
    status: 'paid'
  });

  const paymentData = {};
  const paymentMethods = ['Mohan Kumar', 'Nalini', 'Lalitha', 'Hemath', 'Cash'];
  
  paymentMethods.forEach(method => {
    paymentData[method] = {
      amount: 0,
      transactions: 0
    };
  });

  bills.forEach(bill => {
    if (paymentData[bill.paymentMethod]) {
      paymentData[bill.paymentMethod].amount += bill.totalAmount;
      paymentData[bill.paymentMethod].transactions += 1;
    }
  });

  return paymentData;
};