import React from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { FaQrcode, FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const QRCodes = () => {
  const qrCodes = [
    { name: 'Mohan Kumar', upiId: 'mohan@upi', isActive: true, image: 'mohan.png' },
    { name: 'Nalini', upiId: 'nalini@upi', isActive: true, image: 'nalini.png' },
    { name: 'Lalitha', upiId: 'lalitha@upi', isActive: true, image: 'lalitha.png' },
    { name: 'Hemath', upiId: 'hemath@upi', isActive: true, image: 'hemath.png' },
  ];

  return (
    <Container fluid className="billing-container">
      <Row className="mb-4">
        <Col>
          <h2 className="d-flex align-items-center gap-2">
            <FaQrcode /> QR Code Management
          </h2>
          <p className="text-muted">Manage 4 UPI QR codes for payment collection</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary">Add QR Code</Button>
        </Col>
      </Row>

      <Row className="g-4">
        {qrCodes.map((qr, index) => (
          <Col key={index} lg={3} md={6}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <div className="bg-light p-3 rounded d-inline-block">
                    <FaQrcode size={80} className="text-primary" />
                  </div>
                </div>
                <Card.Title>{qr.name}</Card.Title>
                <Card.Text className="text-muted">
                  UPI: {qr.upiId}
                </Card.Text>
                <div className="d-flex justify-content-center gap-2">
                  <Button variant="outline-primary" size="sm">
                    <FaEdit /> Edit
                  </Button>
                  <Button variant={qr.isActive ? "success" : "secondary"} size="sm">
                    {qr.isActive ? <FaToggleOn /> : <FaToggleOff />}
                    {qr.isActive ? ' Active' : ' Inactive'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="mt-4">
        <Card.Body>
          <h5 className="mb-3">QR Code Instructions</h5>
          <ul>
            <li>Place QR code images in <code>public/qrcodes/</code> folder</li>
            <li>Name them: mohan.png, nalini.png, lalitha.png, hemath.png</li>
            <li>Each QR code corresponds to a different UPI account</li>
            <li>Use different accounts to avoid transaction limits</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default QRCodes;