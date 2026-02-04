import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Table,
  Badge, Alert, Spinner, Modal, Form
} from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import {
  FaLock, FaUnlock, FaRupeeSign, FaReceipt,
  FaCheckCircle, FaTimesCircle, FaPrint, FaCalendar
} from 'react-icons/fa';
import api from '../../services/api';

const DailyClosing = () => {
  const [loading, setLoading] = useState(true);
  const [closingData, setClosingData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingNotes, setClosingNotes] = useState('');
  const [cashVerified, setCashVerified] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Set today's date by default
  useEffect(() => {
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
  }, []);

  // Load closing data when date changes
  useEffect(() => {
    if (selectedDate) {
      loadClosingData();
    }
  }, [selectedDate]);

  const loadClosingData = async () => {
    try {
      setLoading(true);
      const response = await api.getDailyClosing({
        date: selectedDate
      });
      
      if (response.data.success) {
        setClosingData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading closing data:', error);
      toast.error('Failed to load closing data');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDay = async () => {
    try {
      setProcessing(true);
      const response = await api.closeDay({
        date: selectedDate,
        cashVerified,
        notes: closingNotes
      });
      
      if (response.data.success) {
        toast.success('Day closed successfully!');
        setShowCloseModal(false);
        loadClosingData();
        setClosingNotes('');
        setCashVerified(false);
      }
    } catch (error) {
      console.error('Error closing day:', error);
      toast.error(error.response?.data?.error || 'Failed to close day');
    } finally {
      setProcessing(false);
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

  const handlePrintSummary = () => {
    const printWindow = window.open('', '_blank');
    
    const content = `
      <html>
        <head>
          <title>Daily Closing - ${selectedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary-card { border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; }
            .total { font-weight: bold; font-size: 18px; }
            .closed-badge { background: green; color: white; padding: 5px 10px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Daily Closing Summary</h2>
            <h3>Date: ${selectedDate}</h3>
            ${closingData?.isDayClosed ? '<div class="closed-badge">DAY CLOSED</div>' : ''}
          </div>
          
          ${closingData ? `
            <div class="summary-card">
              <h4>Sales Summary</h4>
              <p>Total Sales: ${formatCurrency(closingData.summary.totalSales)}</p>
              <p>Total Bills: ${closingData.summary.totalBills}</p>
              <p>Average Bill Value: ${formatCurrency(closingData.summary.averageBillValue)}</p>
            </div>
            
            <div class="summary-card">
              <h4>Payment Summary</h4>
              ${Object.entries(closingData.paymentSummary).map(([method, data]) => `
                <p>${method}: ${formatCurrency(data.amount)} (${data.count} transactions)</p>
              `).join('')}
            </div>
          ` : ''}
        </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Container fluid className="daily-closing-container">
      <Row className="mb-4">
        <Col>
          <h2 className="d-flex align-items-center gap-2">
            {closingData?.isDayClosed ? <FaLock /> : <FaUnlock />}
            Daily Closing
          </h2>
          <p className="text-muted">
            Complete end-of-day procedures and close business for the day
          </p>
        </Col>
        <Col xs="auto" className="d-flex gap-2 align-items-center">
          <Form.Control
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto' }}
          />
          <Button variant="outline-primary" onClick={handlePrintSummary}>
            <FaPrint /> Print
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading closing data...</p>
        </div>
      ) : closingData ? (
        <>
          {/* Status Banner */}
          <Card className={`mb-4 ${closingData.isDayClosed ? 'border-success' : 'border-warning'}`}>
            <Card.Body>
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex align-items-center gap-3">
                    {closingData.isDayClosed ? (
                      <>
                        <FaCheckCircle className="text-success fs-1" />
                        <div>
                          <h4 className="text-success mb-1">Day Closed</h4>
                          <p className="text-muted mb-0">
                            Closed by {closingData.closedBy} at {new Date(closingData.closingTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="text-warning fs-1" />
                        <div>
                          <h4 className="text-warning mb-1">Day Open</h4>
                          <p className="text-muted mb-0">
                            Complete daily closing procedures
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </Col>
                <Col md={4} className="text-end">
                  {!closingData.isDayClosed && (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setShowCloseModal(true)}
                    >
                      <FaLock /> Close Day
                    </Button>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="border-primary">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Total Sales</h6>
                      <h3 className="mb-0">{formatCurrency(closingData.summary.totalSales)}</h3>
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
                      <h3 className="mb-0">{closingData.summary.totalBills}</h3>
                      <small className="text-muted">
                        Avg: {formatCurrency(closingData.summary.averageBillValue)}
                      </small>
                    </div>
                    <FaReceipt className="text-success fs-1" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-info">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Date</h6>
                      <h3 className="mb-0">
                        {new Date(closingData.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </h3>
                    </div>
                    <FaCalendar className="text-info fs-1" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className={closingData.isDayClosed ? 'border-success' : 'border-warning'}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Status</h6>
                      <h3 className="mb-0">
                        {closingData.isDayClosed ? 'CLOSED' : 'OPEN'}
                      </h3>
                    </div>
                    {closingData.isDayClosed ? (
                      <FaLock className="text-success fs-1" />
                    ) : (
                      <FaUnlock className="text-warning fs-1" />
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Payment Method Breakdown */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Payment Method Summary</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {Object.entries(closingData.paymentSummary).map(([method, data]) => (
                  <Col key={method} md={6} lg={4} className="mb-3">
                    <Card>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Badge bg={getPaymentMethodColor(method)} className="fs-6">
                            {method}
                          </Badge>
                          <span className="fw-bold">{data.count} transactions</span>
                        </div>
                        <div className="fw-bold fs-4 text-success">
                          {formatCurrency(data.amount)}
                        </div>
                        <div className="text-muted small">
                          {((data.amount / closingData.summary.totalSales) * 100).toFixed(1)}% of total
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {/* UPI QR Code Limits */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">UPI QR Code Usage</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {['Mohan Kumar', 'Nalini', 'Lalitha', 'Hemath'].map((method) => {
                  const usage = closingData.qrUsage[method];
                  if (!usage) return null;
                  
                  const usagePercentage = (usage.dailyCount / usage.dailyLimit) * 100;
                  
                  return (
                    <Col key={method} md={6} lg={3} className="mb-3">
                      <Card>
                        <Card.Body>
                          <div className="text-center mb-3">
                            <Badge bg={getPaymentMethodColor(method)} className="fs-6 mb-2">
                              {method}
                            </Badge>
                            <h4 className="fw-bold">{usage.dailyCount}/{usage.dailyLimit}</h4>
                            <small className="text-muted">Daily Transactions</small>
                          </div>
                          <div className={`progress ${usagePercentage >= 90 ? 'bg-danger' : ''}`}>
                            <div 
                              className={`progress-bar ${usagePercentage < 70 ? 'bg-success' : 'bg-warning'}`}
                              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            >
                              {usagePercentage.toFixed(0)}%
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <small className="text-muted">
                              Remaining: {usage.remainingTransactions}
                            </small>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
              <Alert variant="info" className="mt-3">
                <strong>Note:</strong> UPI QR codes reset to 0/20 when day is closed.
                Ensure all QR codes are within limits before closing.
              </Alert>
            </Card.Body>
          </Card>

          {/* Top Selling Items */}
          {closingData.topItems && closingData.topItems.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Top Selling Items Today</h5>
              </Card.Header>
              <Card.Body>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Revenue</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closingData.topItems.map((item, index) => (
                      <tr key={item.itemId}>
                        <td>
                          <div className="d-flex align-items-center">
                            <Badge bg="secondary" className="me-2">{index + 1}</Badge>
                            {item.name}
                          </div>
                        </td>
                        <td className="fw-bold">{item.quantity}</td>
                        <td className="text-success fw-bold">
                          <FaRupeeSign /> {item.revenue.toFixed(2)}
                        </td>
                        <td>
                          {((item.revenue / closingData.summary.totalSales) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Recent Bills */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Bills ({closingData.bills.length})</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Bill No</th>
                      <th>Time</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Items</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closingData.bills.map((bill) => (
                      <tr key={bill.billNumber}>
                        <td>
                          <Badge bg="light" text="dark">
                            {bill.billNumber}
                          </Badge>
                        </td>
                        <td>{bill.time}</td>
                        <td className="fw-bold text-success">
                          <FaRupeeSign /> {bill.amount.toFixed(2)}
                        </td>
                        <td>
                          <Badge bg={getPaymentMethodColor(bill.paymentMethod)}>
                            {bill.paymentMethod}
                          </Badge>
                        </td>
                        <td>{bill.items} items</td>
                        <td>
                          <Badge bg="success">Paid</Badge>
                        </td>
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
          <FaCalendar className="mb-2" size={32} />
          <h5>No Closing Data</h5>
          <p className="mb-0">Select a date to view closing information</p>
        </Alert>
      )}

      {/* Close Day Modal */}
      <Modal show={showCloseModal} onHide={() => setShowCloseModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaLock /> Close Day - {selectedDate}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="mb-4">
            <h6>Important: Before closing the day:</h6>
            <ol className="mb-0">
              <li>Verify all payments are received</li>
              <li>Count and verify cash in hand</li>
              <li>Check UPI QR code limits</li>
              <li>Ensure all bills are entered</li>
              <li>This action cannot be undone</li>
            </ol>
          </Alert>

          <Form>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="I have verified cash amount matches the report"
                checked={cashVerified}
                onChange={(e) => setCashVerified(e.target.checked)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Closing Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Any notes or observations..."
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
              />
            </Form.Group>

            <div className="text-center">
              <h4 className="text-success">
                {formatCurrency(closingData?.summary?.totalSales || 0)}
              </h4>
              <p className="text-muted">Total sales for the day</p>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCloseModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCloseDay}
            disabled={!cashVerified || processing}
          >
            {processing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Closing...
              </>
            ) : (
              'Confirm & Close Day'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DailyClosing;