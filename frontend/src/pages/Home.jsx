import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import {
  FaKeyboard,
  FaImage,
  FaBox,
  FaChartBar,
  FaQrcode,
  FaCalendarCheck,
  FaShoppingCart,
  FaDatabase
} from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [itemsCount, setItemsCount] = useState(0);

  useEffect(() => {
    // Check backend connection
    checkBackendStatus();
    checkItemsCount();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/test');
      setBackendStatus('✅ Connected');
      setDbStatus(response.data.mongodb === 'Connected' ? '✅ Connected' : '❌ Disconnected');
    } catch (error) {
      setBackendStatus('❌ Disconnected');
      setDbStatus('❌ Unknown');
    }
  };

  const checkItemsCount = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/items');
      setItemsCount(response.data.data?.length || 0);
    } catch (error) {
      console.log('Could not fetch items count');
    }
  };

  const options = [
    {
      title: 'Type-Based Billing',
      description: 'For users who know typing. Search items by name or code.',
      icon: <FaKeyboard />,
      path: '/billing/type',
      color: '#4e73df'
    },
    {
      title: 'Image-Based Billing',
      description: 'For users who don\'t know typing. Tap on item images.',
      icon: <FaImage />,
      path: '/billing/image',
      color: '#1cc88a'
    },
    {
      title: 'Item Management',
      description: 'Add, edit, delete items. Update prices and stock.',
      icon: <FaBox />,
      path: '/items',
      color: '#36b9cc'
    },
    {
      title: 'Reports & Analytics',
      description: 'View sales reports, item-wise analysis, payment reports.',
      icon: <FaChartBar />,
      path: '/reports',
      color: '#f6c23e'
    },
    {
      title: 'QR Code Management',
      description: 'Manage 4 UPI QR codes: Mohan, Nalini, Lalitha, Hemath.',
      icon: <FaQrcode />,
      path: '/qrcodes',
      color: '#e74a3b'
    },
    {
      title: 'Daily Closing',
      description: 'End of day summary, cash reconciliation.',
      icon: <FaCalendarCheck />,
      path: '/daily-closing',
      color: '#858796'
    }
  ];

  return (
    <Container className="home-container">
      <div className="text-center mb-5">
        <h1 className="home-title">🛒 Pooja Store Billing System</h1>
        <p className="home-subtitle">
          Fast, efficient billing system for your Pooja Store
        </p>
        
        {/* Status Indicators */}
        <Row className="justify-content-center mb-4">
          <Col md={4} className="mb-2">
            <Alert variant={backendStatus.includes('✅') ? 'success' : 'danger'}>
              <FaDatabase className="me-2" />
              Backend: {backendStatus}
            </Alert>
          </Col>
          <Col md={4} className="mb-2">
            <Alert variant={dbStatus.includes('✅') ? 'success' : 'danger'}>
              <FaDatabase className="me-2" />
              MongoDB: {dbStatus}
            </Alert>
          </Col>
        </Row>
      </div>

      <Row className="g-4">
        {options.map((option, index) => (
          <Col key={index} lg={4} md={6}>
            <Card 
              className="billing-option-card h-100"
              onClick={() => navigate(option.path)}
              style={{ cursor: 'pointer' }}
            >
              <Card.Body className="text-center d-flex flex-column">
                <div 
                  className="billing-option-icon mb-3"
                  style={{ color: option.color }}
                >
                  {option.icon}
                </div>
                <Card.Title className="billing-option-title mb-3">
                  {option.title}
                </Card.Title>
                <Card.Text className="billing-option-desc mb-4 flex-grow-1">
                  {option.description}
                </Card.Text>
                <Button 
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(option.path);
                  }}
                  style={{ backgroundColor: option.color, borderColor: option.color }}
                >
                  Open
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Stats */}
      <Row className="mt-5">
        <Col>
          <Card className="border-primary">
            <Card.Body>
              <h5 className="card-title text-primary mb-3">
                <FaShoppingCart className="me-2" />
                Quick Stats
              </h5>
              <Row>
                <Col md={3} sm={6}>
                  <div className="text-center p-3">
                    <div className="fs-1 fw-bold text-primary">{itemsCount}</div>
                    <div className="text-muted">Total Items</div>
                  </div>
                </Col>
                <Col md={3} sm={6}>
                  <div className="text-center p-3">
                    <div className="fs-1 fw-bold text-success">4</div>
                    <div className="text-muted">QR Codes</div>
                  </div>
                </Col>
                <Col md={3} sm={6}>
                  <div className="text-center p-3">
                    <div className="fs-1 fw-bold text-warning">2</div>
                    <div className="text-muted">Billing Modes</div>
                  </div>
                </Col>
                <Col md={3} sm={6}>
                  <div className="text-center p-3">
                    <div className="fs-1 fw-bold text-info">5</div>
                    <div className="text-muted">Payment Methods</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;