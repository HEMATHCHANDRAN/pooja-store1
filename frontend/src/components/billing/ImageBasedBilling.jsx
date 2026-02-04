import React from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FaImage, FaShoppingCart } from 'react-icons/fa';

const ImageBasedBilling = () => {
  return (
    <Container fluid className="billing-container">
      <Row className="mb-4">
        <Col>
          <h2 className="d-flex align-items-center gap-2">
            <FaImage /> Image-Based Billing
          </h2>
          <p className="text-muted">Tap on item images to add to cart. Perfect for touch interface.</p>
        </Col>
      </Row>

      <Alert variant="info">
        <h4>Image-Based Billing - Coming Soon!</h4>
        <p className="mb-0">This feature allows you to add items by tapping on their images.</p>
      </Alert>

      <Row className="mt-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h5>How it will work:</h5>
              <ul>
                <li>See all items as images in a grid</li>
                <li>Tap on item image to add to cart</li>
                <li>Adjust quantities with + / - buttons</li>
                <li>Select from 4 UPI accounts or Cash</li>
                <li>Show QR code for UPI payment</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <FaShoppingCart size={64} className="text-success mb-3" />
              <h5>Touch Interface</h5>
              <p>Designed for easy touch operation</p>
              <Button variant="success">Start Billing</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ImageBasedBilling;