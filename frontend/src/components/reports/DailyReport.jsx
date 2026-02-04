import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Form, Button, Table,
  Badge, Alert, Spinner, ProgressBar
} from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import {
  FaCalendarDay, FaRupeeSign, FaReceipt,
  FaCreditCard, FaChartLine, FaPrint
} from 'react-icons/fa';
import api from '../../services/api';

const DailyReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  // Set today's date by default
  useEffect(() => {
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
  }, []);

  // Load report when date changes
  useEffect(() => {
    if (selectedDate) {
      loadReport();
    }
  }, [selectedDate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.getDailyReport({
        date: selectedDate
      });
      
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading daily report:', error);
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

  const getPaymentMethodColor = (method) => {
    const colors = {
      'Mohan Kumar': 'primary',
      'Nalini': 'success',
      'Lalitha': 'warning',
      'Hemath': 'info',
      'Cash': 'dark'
    };
    return colors[method] || 'secondary';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0"><FaCalendarDay /> Daily Sales Report</h5>
        <div className="d-flex gap-2 align-items-center">
          <Form.Control
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto' }}
          />
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
              <Col md={4}>
                <Card className="border-primary">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">Total Sales</h6>
                        <h3 className="mb-0">{formatCurrency(reportData.totalSales)}</h3>
                        <small className="text-muted">{reportData.date}</small>
                      </div>
                      <FaRupeeSign className="text-primary fs-1" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-success">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">Total Bills</h6>
                        <h3 className="mb-0">{reportData.totalBills}</h3>
                        <small className="text-muted">
                          Avg: {formatCurrency(reportData.totalSales / reportData.totalBills)}
                        </small>
                      </div>
                      <FaReceipt className="text-success fs-1" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-info">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">Date</h6>
                        <h3 className="mb-0">
                          {new Date(reportData.date).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </h3>
                      </div>
                      <FaCalendarDay className="text-info fs-1" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Payment Method Breakdown */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0"><FaCreditCard /> Payment Method Breakdown</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  {Object.entries(reportData.paymentSummary).map(([method, data]) => (
                    <Col key={method} md={6} lg={4} className="mb-3">
                      <Card>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Badge bg={getPaymentMethodColor(method)} className="fs-6">
                              {method}
                            </Badge>
                            <span className="fw-bold">{data.count} transactions</span>
                          </div>
                          <div className="fw-bold fs-4 text-success mb-2">
                            {formatCurrency(data.amount)}
                          </div>
                          <ProgressBar 
                            now={(data.amount / reportData.totalSales) * 100}
                            label={`${((data.amount / reportData.totalSales) * 100).toFixed(1)}%`}
                            variant={getPaymentMethodColor(method)}
                          />
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            {/* Top Selling Items */}
            {reportData.topItems && reportData.topItems.length > 0 && (
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0"><FaChartLine /> Top Selling Items</h6>
                </Card.Header>
                <Card.Body>
                  <Table hover>
                    <thead>
                      <tr>
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
                            <div className="d-flex align-items-center">
                              <Badge bg="secondary" className="me-2">{index + 1}</Badge>
                              {item.name}
                            </div>
                          </td>
                          <td className="fw-bold">{item.quantity}</td>
                          <td className="text-success fw-bold">
                            <FaRupeeSign /> {item.amount.toFixed(2)}
                          </td>
                          <td>
                            <ProgressBar 
                              now={(item.amount / reportData.totalSales) * 100}
                              label={`${((item.amount / reportData.totalSales) * 100).toFixed(1)}%`}
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

            {/* Bill List */}
            <Card>
              <Card.Header>
                <h6 className="mb-0"><FaReceipt /> Bill List ({reportData.bills.length})</h6>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Bill No</th>
                        <th>Time</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.bills.map((bill) => (
                        <tr key={bill.billNumber}>
                          <td>
                            <Badge bg="light" text="dark">
                              {bill.billNumber}
                            </Badge>
                          </td>
                          <td>{bill.time}</td>
                          <td className="fw-bold text-success">
                            <FaRupeeSign /> {bill.totalAmount.toFixed(2)}
                          </td>
                          <td>
                            <Badge bg={getPaymentMethodColor(bill.paymentMethod)}>
                              {bill.paymentMethod}
                            </Badge>
                          </td>
                          <td>{bill.itemsCount} items</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </>
        ) : (
          <Alert variant="info" className="text-center">
            <FaCalendarDay className="mb-2" size={32} />
            <h5>No Report Data</h5>
            <p className="mb-0">Select a date to view daily report</p>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default DailyReport;