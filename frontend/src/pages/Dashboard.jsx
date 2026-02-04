import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Table,
  Badge, Alert, Spinner, Button
} from 'react-bootstrap';
import {
  FaRupeeSign, FaReceipt, FaBox, FaChartLine,
  FaArrowUp, FaArrowDown, FaCalendar, FaSync
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentBills, setRecentBills] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load today's bills
      const today = new Date().toISOString().split('T')[0];
      const billsResponse = await api.getDailyReport({ date: today });
      
      // Load items for stock check
      const itemsResponse = await api.getItems();
      
      if (billsResponse.data.success) {
        const reportData = billsResponse.data.data;
        
        // Calculate stats
        const todayStats = {
          totalSales: reportData.totalSales || 0,
          totalBills: reportData.totalBills || 0,
          averageBill: reportData.totalBills > 0 ? reportData.totalSales / reportData.totalBills : 0,
          topPaymentMethod: Object.entries(reportData.paymentSummary || {})
            .sort((a, b) => b[1].amount - a[1].amount)[0]?.[0] || 'N/A'
        };
        
        setStats(todayStats);
        setRecentBills(reportData.bills?.slice(0, 5) || []);
      }
      
      if (itemsResponse.data.data) {
        const items = itemsResponse.data.data;
        const lowStock = items
          .filter(item => item.currentStock <= item.minStockAlert)
          .slice(0, 5);
        setLowStockItems(lowStock);
      }
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
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

  const getStockBadge = (stock, minStock) => {
    if (stock === 0) return <Badge bg="danger">Out of Stock</Badge>;
    if (stock <= minStock) return <Badge bg="warning">Low Stock</Badge>;
    return <Badge bg="success">In Stock</Badge>;
  };

  const quickActions = [
    {
      title: 'Type Billing',
      description: 'Keyboard-based billing',
      icon: '⌨️',
      path: '/billing/type',
      color: 'primary'
    },
    {
      title: 'Image Billing',
      description: 'Tap-based billing',
      icon: '🖼️',
      path: '/billing/image',
      color: 'success'
    },
    {
      title: 'Add Items',
      description: 'Add new products',
      icon: '➕',
      path: '/items',
      color: 'info'
    },
    {
      title: 'Daily Report',
      description: 'View today\'s sales',
      icon: '📊',
      path: '/reports',
      color: 'warning'
    }
  ];

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="d-flex align-items-center gap-2">
            <FaChartLine /> Dashboard
          </h2>
          <p className="text-muted">Overview of your store performance</p>
        </Col>
        <Col xs="auto">
          <Button variant="outline-primary" onClick={loadDashboardData}>
            <FaSync /> Refresh
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="border-primary">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Today's Sales</h6>
                      <h3 className="mb-0">{formatCurrency(stats?.totalSales || 0)}</h3>
                      <small className="text-muted">
                        <FaCalendar /> {new Date().toLocaleDateString('en-IN')}
                      </small>
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
                      <h6 className="text-muted mb-1">Today's Bills</h6>
                      <h3 className="mb-0">{stats?.totalBills || 0}</h3>
                      <small className="text-muted">
                        Avg: {formatCurrency(stats?.averageBill || 0)}
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
                      <h6 className="text-muted mb-1">Top Payment</h6>
                      <h3 className="mb-0">{stats?.topPaymentMethod}</h3>
                      <small className="text-muted">Most used today</small>
                    </div>
                    <FaChartLine className="text-info fs-1" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-warning">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Low Stock Items</h6>
                      <h3 className="mb-0">{lowStockItems.length}</h3>
                      <small className="text-muted">Need attention</small>
                    </div>
                    <FaBox className="text-warning fs-1" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row className="mb-4">
            <Col>
              <h5 className="mb-3">Quick Actions</h5>
              <Row>
                {quickActions.map((action, index) => (
                  <Col key={index} md={3} className="mb-3">
                    <Card 
                      className={`border-${action.color} h-100 clickable`}
                      onClick={() => navigate(action.path)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Body className="text-center">
                        <div className="fs-1 mb-2">{action.icon}</div>
                        <h6 className="fw-bold">{action.title}</h6>
                        <p className="text-muted small mb-0">{action.description}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>

          {/* Recent Bills & Low Stock Items */}
          <Row>
            {/* Recent Bills */}
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <h6 className="mb-0 d-flex align-items-center gap-2">
                    <FaReceipt /> Recent Bills
                  </h6>
                </Card.Header>
                <Card.Body>
                  {recentBills.length > 0 ? (
                    <div className="table-responsive">
                      <Table hover size="sm">
                        <thead>
                          <tr>
                            <th>Bill No</th>
                            <th>Time</th>
                            <th>Amount</th>
                            <th>Payment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBills.map((bill) => (
                            <tr key={bill.billNumber}>
                              <td>
                                <Badge bg="light" text="dark">
                                  {bill.billNumber}
                                </Badge>
                              </td>
                              <td>{bill.time}</td>
                              <td className="fw-bold text-success">
                                <FaRupeeSign /> {bill.amount?.toFixed(2)}
                              </td>
                              <td>
                                <Badge bg="info">{bill.paymentMethod}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <Alert variant="info" className="text-center">
                      No bills today
                    </Alert>
                  )}
                  <div className="text-end">
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => navigate('/reports')}
                    >
                      View All Reports →
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Low Stock Items */}
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <h6 className="mb-0 d-flex align-items-center gap-2">
                    <FaBox /> Low Stock Items
                  </h6>
                </Card.Header>
                <Card.Body>
                  {lowStockItems.length > 0 ? (
                    <div className="table-responsive">
                      <Table hover size="sm">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Code</th>
                            <th>Current</th>
                            <th>Min</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lowStockItems.map((item) => (
                            <tr key={item._id}>
                              <td className="fw-bold">{item.name}</td>
                              <td><code>{item.itemCode}</code></td>
                              <td>{item.currentStock}</td>
                              <td>{item.minStockAlert}</td>
                              <td>
                                {getStockBadge(item.currentStock, item.minStockAlert)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <Alert variant="success" className="text-center">
                      All items have sufficient stock! ✅
                    </Alert>
                  )}
                  <div className="text-end">
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => navigate('/items')}
                    >
                      Manage Items →
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Store Performance Tips */}
          <Card className="border-info">
            <Card.Header>
              <h6 className="mb-0">💡 Store Performance Tips</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="d-flex gap-2 mb-2">
                    <div>✅</div>
                    <div>
                      <strong>Daily Closing:</strong> Close day to reset counters
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex gap-2 mb-2">
                    <div>✅</div>
                    <div>
                      <strong>Stock Management:</strong> Reorder low stock items
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex gap-2 mb-2">
                    <div>✅</div>
                    <div>
                      <strong>QR Limits:</strong> Monitor UPI transaction limits
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default Dashboard;