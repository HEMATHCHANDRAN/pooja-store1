import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { FaHome, FaStore, FaSignOutAlt } from 'react-icons/fa';

const NavigationBar = () => {
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow">
      <Container fluid>
        <Navbar.Brand 
          href="/home" 
          className="d-flex align-items-center gap-2 fw-bold"
        >
          <FaStore /> Pooja Store Pro
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/home">
              <FaHome /> Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/billing/type">
              Type Billing
            </Nav.Link>
            <Nav.Link as={NavLink} to="/billing/image">
              Image Billing
            </Nav.Link>
            <Nav.Link as={NavLink} to="/items">
              Items
            </Nav.Link>
            <Nav.Link as={NavLink} to="/reports">
              Reports
            </Nav.Link>
            <Nav.Link as={NavLink} to="/daily-closing">
              Daily Closing
            </Nav.Link>
          </Nav>
          
          <div className="d-flex align-items-center gap-3">
            <span className="text-light d-none d-md-block">
              📅 {currentDate}
            </span>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => navigate('/settings')}
            >
              ⚙️ Settings
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;