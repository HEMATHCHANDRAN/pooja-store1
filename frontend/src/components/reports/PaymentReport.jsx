import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Form, Button, Table,
  Badge, Alert, Spinner, ProgressBar
} from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import {
  FaCreditCard, FaRupeeSign, FaQrcode,
  FaMoneyBillWave, FaChartPie, FaPrint
} from 'react-icons/fa';
import api from '../../services/api';

const PaymentReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Set default dates (last 30 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  // Load report when dates change
  useEffect(() => {
    if (startDate && endDate) {
      loadReport();
    }
  }, [startDate, endDate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.getPaymentReport({
        startDate,
        endDate
      });
      
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading payment report:', error);
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

  const getUPIMethods = () => {
    return ['Mohan Kumar', 'Nalini', 'Lalitha', 'Hemath'];
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0"><FaCreditCard /> Payment Method Report</h5>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" onClick={handlePrint}>
            <FaPrint /> Print
          </Button>
        </div>
      </Card.Header>
      
      <Card.Body>
        {/* Date Range Selector */}
        <Row className="mb-4">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button 
              variant="primary" 
              className="w-100"
              onClick={loadReport}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </Col>
        </Row>

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
                        <h6 className="text-muted mb-1">Total Amount</h6>
                        <h3 className="mb-0">{formatCurrency(reportData.totals.totalAmount)}</h3>
                        <small className="text-muted">
                          {reportData.dateRange.startDate} to {reportData.dateRange.endDate}
                        </small>
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
                        <h6 className="text-muted mb-1">Total Transactions</h6>
                        <h3 className="mb-0">{reportData.totals.totalTransactions}</h3>
                        <small className="text-muted">
                          Avg: {formatCurrency(reportData.totals.averageTransaction)}
                        </small>
                      </div>
                      <FaCreditCard className="text-success fs-1" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-info">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">UPI vs Cash</h6>
                        <h3 className="mb-0">{reportData.summary.upiPercentage}% UPI</h3>
                        <small className="text-muted">
                          {formatCurrency(reportData.summary.cashTotal)} Cash
                        </small>
                      </div>
                      <FaChartPie className="text-info fs-1" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Payment Method Breakdown */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Payment Method Analysis</h6>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Payment Method</th>
                        <th>Amount</th>
                        <th>Transactions</th>
                        <th>Percentage</th>
                        <th>Avg. Transaction</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.paymentMethods.map((method) => (
                        <tr key={method.method}>
                          <td>
                            <Badge bg={getPaymentMethodColor(method.method)} className="fs-6">
                              {method.method === 'Cash' ? <FaMoneyBillWave /> : <FaQrcode />}
                              {' '}{method.method}
                            </Badge>
                          </td>
                          <td className="fw-bold text-success">
                            <FaRupeeSign /> {method.amount.toFixed(2)}
                          </td>
                          <td>
                            <Badge bg="secondary">
                              {method.transactions}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <ProgressBar 
                                now={parseFloat(method.percentage)}
                                style={{ flex: 1, height: '20px' }}
                                variant={getPaymentMethodColor(method.method)}
                              />
                              <span className="fw-bold">{method.percentage}%</span>
                            </div>
                          </td>
                          <td className="text-muted">
                            {method.transactions > 0 ? 
                              formatCurrency(method.amount / method.transactions) : 'N/A'
                            }
                          </td>
                          <td>
                            {getUPIMethods().includes(method.method) ? (
                              reportData.qrLimits[method.method]?.remaining > 5 ? (
                                <Badge bg="success">Good</Badge>
                              ) : reportData.qrLimits[method.method]?.remaining > 0 ? (
                                <Badge bg="warning">Limited</Badge>
                              ) : (
                                <Badge bg="danger">Exhausted</Badge>
                              )
                            ) : (
                              <Badge bg="dark">Always Available</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            {/* UPI QR Code Limits */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0"><FaQrcode /> UPI QR Code Usage Limits</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  {getUPIMethods().map((method) => {
                    const limit = reportData.qrLimits[method];
                    if (!limit) return null;
                    
                    const usagePercentage = (limit.dailyUsed / limit.dailyLimit) * 100;
                    
                    return (
                      <Col key={method} md={6} lg={3} className="mb-3">
                        <Card>
                          <Card.Body>
                            <div className="text-center mb-3">
                              <Badge bg={getPaymentMethodColor(method)} className="fs-6 mb-2">
                                {method}
                              </Badge>
                              <h4 className="fw-bold">{limit.dailyUsed}/{limit.dailyLimit}</h4>
                              <small className="text-muted">Transactions Used</small>
                            </div>
                            <ProgressBar 
                              now={usagePercentage}
                              variant={
                                usagePercentage < 70 ? 'success' :
                                usagePercentage < 90 ? 'warning' : 'danger'
                              }
                              label={`${usagePercentage.toFixed(1)}%`}
                            />
                            <div className="mt-2 text-center">
                              <small className="text-muted">
                                Remaining: {limit.remaining} transactions
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
                <Alert variant="info" className="mt-3">
                  <strong>Note:</strong> Each UPI QR code has a daily limit of 20 transactions.
                  Monitor usage to avoid payment failures.
                </Alert>
              </Card.Body>
            </Card>

            {/* UPI vs Cash Comparison */}
            <Row>
              <Col md={6}>
                <Card className="border-success">
                  <Card.Header>
                    <h6 className="mb-0">UPI Payments Summary</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center">
                      <h1 className="text-success">
                        {formatCurrency(reportData.summary.upiTotal)}
                      </h1>
                      <p className="text-muted mb-2">
                        {reportData.summary.upiPercentage}% of total sales
                      </p>
                      <div className="d-flex justify-content-around">
                        {getUPIMethods().map((method) => {
                          const data = reportData.paymentMethods.find(m => m.method === method);
                          return data ? (
                            <div key={method} className="text-center">
                              <Badge bg={getPaymentMethodColor(method)}>
                                {method.split(' ')[0]}
                              </Badge>
                              <div className="fw-bold mt-1">
                                {data.transactions}
                              </div>
                              <small className="text-muted">txns</small>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-dark">
                  <Card.Header>
                    <h6 className="mb-0">Cash Payments Summary</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center">
                      <h1 className="text-dark">
                        {formatCurrency(reportData.summary.cashTotal)}
                      </h1>
                      <p className="text-muted mb-2">
                        {reportData.paymentMethods.find(m => m.method === 'Cash')?.percentage}% of total sales
                      </p>
                      <div className="d-flex justify-content-center align-items-center gap-3">
                        <FaMoneyBillWave className="fs-1 text-dark" />
                        <div>
                          <div className="fw-bold fs-4">
                            {reportData.paymentMethods.find(m => m.method === 'Cash')?.transactions}
                          </div>
                          <small className="text-muted">cash transactions</small>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <Alert variant="info" className="text-center">
            <FaCreditCard className="mb-2" size={32} />
            <h5>No Report Data</h5>
            <p className="mb-0">Select date range and click Refresh to generate report</p>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default PaymentReport;