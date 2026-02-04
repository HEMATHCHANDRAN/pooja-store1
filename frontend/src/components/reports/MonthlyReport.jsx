import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Form, Button, Table,
  Badge, Alert, Spinner, ProgressBar
} from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import {
  FaCalendarAlt, FaRupeeSign, FaChartLine,
  FaArrowUp, FaArrowDown, FaPrint
} from 'react-icons/fa';
import api from '../../services/api';

const MonthlyReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Set current month and year by default
  useEffect(() => {
    const today = new Date();
    setSelectedMonth((today.getMonth() + 1).toString());
    setSelectedYear(today.getFullYear().toString());
  }, []);

  // Load report when month/year changes
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      loadReport();
    }
  }, [selectedMonth, selectedYear]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.getMonthlyReport({
        month: selectedMonth,
        year: selectedYear
      });
      
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading monthly report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const getMonths = () => {
    return [
      { value: '1', label: 'January' },
      { value: '2', label: 'February' },
      { value: '3', label: 'March' },
      { value: '4', label: 'April' },
      { value: '5', label: 'May' },
      { value: '6', label: 'June' },
      { value: '7', label: 'July' },
      { value: '8', label: 'August' },
      { value: '9', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ];
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      years.push(i.toString());
    }
    return years;
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0"><FaCalendarAlt /> Monthly Sales Report</h5>
        <div className="d-flex gap-2 align-items-center">
          <Form.Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ width: 'auto' }}
          >
            {getMonths().map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </Form.Select>
          <Form.Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ width: 'auto' }}
          >
            {getYears().map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Form.Select>
          <Button variant="outline-primary" size="sm" onClick={handlePrint}>
            <FaPrint /> Print
          </Button>
        </div>
      </Card.Header>
      
      <Card.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading report data...</p>
          </div>
        ) : reportData ? (
          <>
            {/* Summary Cards */}
            <Row className="mb-4">
              <Col md={3}>
                <Card className="border-primary">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">Monthly Sales</h6>
                        <h3 className="mb-0">{formatCurrency(reportData.totals.totalSales)}</h3>
                        <small className="text-muted">{reportData.month.monthName} {reportData.month.year}</small>
                      </div>
                      <FaRupeeSign className="text-primary fs-1" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-success">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">Total Bills</h6>
                        <h3 className="mb-0">{reportData.totals.totalBills}</h3>
                        <small className="text-muted">
                          Avg: {formatCurrency(reportData.totals.averageBillValue)}
                        </small>
                      </div>
                      <FaCalendarAlt className="text-success fs-1" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-info">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">Daily Average</h6>
                        <h3 className="mb-0">{formatCurrency(reportData.totals.averageDailySales)}</h3>
                        <small className="text-muted">
                          {reportData.totals.totalBills} bills
                        </small>
                      </div>
                      <FaChartLine className="text-info fs-1" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className={reportData.comparison.growthType === 'increase' ? 'border-success' : 'border-danger'}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">Growth</h6>
                        <h3 className={`mb-0 ${reportData.comparison.growthType === 'increase' ? 'text-success' : 'text-danger'}`}>
                          {reportData.comparison.growth}%
                          {reportData.comparison.growthType === 'increase' ? <FaArrowUp /> : <FaArrowDown />}
                        </h3>
                        <small className="text-muted">
                          vs {reportData.month.month === 1 ? 'Dec' : reportData.month.monthName}
                        </small>
                      </div>
                      <div className={`fs-1 ${reportData.comparison.growthType === 'increase' ? 'text-success' : 'text-danger'}`}>
                        {reportData.comparison.growthType === 'increase' ? <FaArrowUp /> : <FaArrowDown />}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Payment Method Breakdown */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Payment Method Distribution</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  {Object.entries(reportData.paymentSummary).map(([method, data]) => (
                    <Col key={method} md={6} lg={4} className="mb-3">
                      <Card>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Badge bg="info" className="fs-6">
                              {method}
                            </Badge>
                            <span className="fw-bold">{data.count} transactions</span>
                          </div>
                          <div className="fw-bold fs-4 text-success mb-2">
                            {formatCurrency(data.amount)}
                          </div>
                          <ProgressBar 
                            now={(data.amount / reportData.totals.totalSales) * 100}
                            label={`${((data.amount / reportData.totals.totalSales) * 100).toFixed(1)}%`}
                          />
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            {/* Daily Performance */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Daily Performance</h6>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Sales</th>
                        <th>Bills</th>
                        <th>Avg Bill</th>
                        <th>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.dailyReport.map((day) => {
                        const date = new Date(day.date);
                        const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
                        const avgBill = day.bills > 0 ? day.sales / day.bills : 0;
                        
                        return (
                          <tr key={day.date}>
                            <td>{day.date.split('-')[2]}</td>
                            <td>
                              <Badge bg={dayName === 'Sun' ? 'danger' : 'secondary'}>
                                {dayName}
                              </Badge>
                            </td>
                            <td className="fw-bold text-success">
                              <FaRupeeSign /> {day.sales.toFixed(2)}
                            </td>
                            <td className="fw-bold">{day.bills}</td>
                            <td>{formatCurrency(avgBill)}</td>
                            <td>
                              {day.sales >= reportData.totals.averageDailySales ? (
                                <Badge bg="success" className="px-2">
                                  <FaArrowUp />
                                </Badge>
                              ) : (
                                <Badge bg="warning" className="px-2">
                                  <FaArrowDown />
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            {/* Top Selling Items */}
            {reportData.topItems && reportData.topItems.length > 0 && (
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Top Selling Items</h6>
                </Card.Header>
                <Card.Body>
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Revenue</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.topItems.map((item, index) => (
                        <tr key={item.itemId}>
                          <td>
                            <Badge bg={index < 3 ? 'primary' : 'secondary'}>
                              #{index + 1}
                            </Badge>
                          </td>
                          <td className="fw-bold">{item.name}</td>
                          <td className="fw-bold">{item.quantity}</td>
                          <td className="text-success fw-bold">
                            <FaRupeeSign /> {item.amount.toFixed(2)}
                          </td>
                          <td>
                            <ProgressBar 
                              now={(item.amount / reportData.totals.totalSales) * 100}
                              label={`${((item.amount / reportData.totals.totalSales) * 100).toFixed(1)}%`}
                              style={{ height: '20px' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}
          </>
        ) : (
          <Alert variant="info" className="text-center">
            <FaCalendarAlt className="mb-2" size={32} />
            <h5>No Report Data</h5>
            <p className="mb-0">Select month and year to view monthly report</p>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default MonthlyReport;