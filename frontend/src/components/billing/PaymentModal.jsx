import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Alert } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import {
  FaQrcode,
  FaRupeeSign,
  FaCheck,
  FaTimes,
  FaPrint,
  FaHome
} from 'react-icons/fa';
import api from '../../services/api';

const PaymentModal = ({ show, onHide, cart, total, qrCodes, onSuccess }) => {
  const [selectedPayment, setSelectedPayment] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [generatedBill, setGeneratedBill] = useState(null);

  const paymentMethods = [
    { name: 'Mohan Kumar', type: 'upi', color: 'primary' },
    { name: 'Nalini', type: 'upi', color: 'success' },
    { name: 'Lalitha', type: 'upi', color: 'info' },
    { name: 'Hemath', type: 'upi', color: 'warning' },
    { name: 'Cash', type: 'cash', color: 'secondary' }
  ];

  const selectedQR = qrCodes.find(qr => qr.name === selectedPayment);

  const handleGenerateBill = async () => {
    try {
      const billData = {
        items: cart.map(item => ({
          itemId: item.itemId,
          itemCode: item.itemCode,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod: selectedPayment,
        status: 'paid'
      };

      const response = await api.createBill(billData);
      
      if (response.data.success) {
        setGeneratedBill(response.data.data);
        setPaymentStatus('generated');
        toast.success(`Bill ${response.data.data.billNumber} generated successfully!`);
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error('Failed to generate bill. Please try again.');
    }
  };

  const handlePaymentComplete = () => {
    if (selectedPayment === 'Cash') {
      // For cash, payment is immediate
      setPaymentStatus('completed');
      toast.success('Cash payment received!');
    } else {
      // For UPI, show QR and wait for confirmation
      setPaymentStatus('qr_shown');
    }
  };

  const handlePaymentConfirmed = () => {
    setPaymentStatus('completed');
    toast.success('Payment confirmed!');
  };

  const handlePrintReceipt = () => {
    if (!generatedBill) return;
    
    const receiptWindow = window.open('', '_blank');
    const receiptContent = `
      <html>
        <head>
          <title>Receipt - ${generatedBill.billNumber}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 20px; max-width: 300px; margin: 0 auto; }
            .receipt { border: 1px solid #000; padding: 15px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; padding: 3px 0; }
            .total { font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .thank-you { font-size: 14px; font-weight: bold; text-align: center; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h3 style="margin: 0">🛍️ Pooja Store</h3>
              <p style="margin: 5px 0">Bill No: <strong>${generatedBill.billNumber}</strong></p>
              <p style="margin: 5px 0">Date: ${generatedBill.date} | Time: ${generatedBill.time}</p>
            </div>
            
            ${generatedBill.items.map(item => `
              <div class="item">
                <span>${item.name} (${item.quantity})</span>
                <span>₹${item.total}</span>
              </div>
            `).join('')}
            
            <div class="total item">
              <span>TOTAL:</span>
              <span>₹${generatedBill.totalAmount}</span>
            </div>
            
            <div class="footer">
              <p>Payment Method: ${generatedBill.paymentMethod}</p>
              <p>Thank you for your purchase!</p>
            </div>
            
            <div class="thank-you">
              🎉 Thank you! Visit Again 🎉
            </div>
          </div>
        </body>
      </html>
    `;
    
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  const handleFinish = () => {
    onSuccess();
    setPaymentStatus('pending');
    setGeneratedBill(null);
    setSelectedPayment('Cash');
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton={paymentStatus === 'pending'}>
        <Modal.Title>
          <FaRupeeSign /> Payment - ₹{total}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {paymentStatus === 'pending' && (
          <>
            <Alert variant="info" className="mb-4">
              <h5>Select Payment Method</h5>
              <p className="mb-0">Choose how the customer will pay</p>
            </Alert>
            
            <Row className="g-3 mb-4">
              {paymentMethods.map(method => (
                <Col key={method.name} xs={6} md={4}>
                  <Button
                    variant={selectedPayment === method.name ? method.color : `outline-${method.color}`}
                    className="w-100 py-3"
                    onClick={() => setSelectedPayment(method.name)}
                  >
                    <div className="d-flex flex-column align-items-center">
                      <div className="fs-4 mb-1">
                        {method.type === 'upi' ? <FaQrcode /> : '💵'}
                      </div>
                      <div className="fw-bold">{method.name}</div>
                      {method.type === 'upi' && (
                        <small className="text-muted">UPI Payment</small>
                      )}
                    </div>
                  </Button>
                </Col>
              ))}
            </Row>
            
            <div className="text-center">
              <Button
                variant="primary"
                size="lg"
                className="px-5"
                onClick={handleGenerateBill}
              >
                <FaCheck /> Generate Bill
              </Button>
            </div>
          </>
        )}
        
        {paymentStatus === 'generated' && (
          <>
            <Alert variant="success" className="mb-4">
              <h5>✅ Bill Generated Successfully!</h5>
              <p className="mb-0">
                Bill Number: <Badge bg="success">{generatedBill.billNumber}</Badge>
              </p>
            </Alert>
            
            <div className="text-center mb-4">
              <h4>Total Amount: ₹{total}</h4>
              <p className="text-muted">
                Payment Method: <strong>{selectedPayment}</strong>
              </p>
            </div>
            
            <div className="text-center">
              <Button
                variant="success"
                size="lg"
                className="px-5 me-3"
                onClick={handlePaymentComplete}
              >
                {selectedPayment === 'Cash' ? 'Received Cash' : 'Show QR Code'}
              </Button>
              
              <Button
                variant="outline-primary"
                size="lg"
                className="px-5"
                onClick={handlePrintReceipt}
              >
                <FaPrint /> Print Receipt
              </Button>
            </div>
          </>
        )}
        
        {paymentStatus === 'qr_shown' && selectedQR && (
          <>
            <Alert variant="warning" className="mb-4">
              <h5>📱 Show QR Code to Customer</h5>
              <p className="mb-0">Ask customer to scan and pay ₹{total}</p>
            </Alert>
            
            <div className="text-center mb-4">
              <div className="qr-display">
                <img
                  src={`/qrcodes/${selectedPayment.toLowerCase().replace(' ', '_')}.png`}
                  alt={selectedPayment}
                  className="qr-image mb-3"
                />
                <h4 className="text-primary">₹{total}</h4>
                <p className="text-muted">Scan to pay using {selectedPayment}'s UPI</p>
              </div>
              
              <Alert variant="light" className="text-start">
                <h6>Instructions:</h6>
                <ol className="mb-0">
                  <li>Show QR code to customer</li>
                  <li>Customer scans with UPI app</li>
                  <li>Verify payment on customer's phone</li>
                  <li>Click "Payment Complete" after confirmation</li>
                </ol>
              </Alert>
            </div>
            
            <div className="text-center">
              <Button
                variant="success"
                size="lg"
                className="px-5 me-3"
                onClick={handlePaymentConfirmed}
              >
                <FaCheck /> Payment Complete
              </Button>
              
              <Button
                variant="outline-secondary"
                size="lg"
                className="px-5"
                onClick={() => setPaymentStatus('generated')}
              >
                <FaTimes /> Back
              </Button>
            </div>
          </>
        )}
        
        {paymentStatus === 'completed' && (
          <>
            <Alert variant="success" className="mb-4">
              <h5>🎉 Payment Successful!</h5>
              <p className="mb-0">
                Bill {generatedBill.billNumber} has been paid successfully.
              </p>
            </Alert>
            
            <div className="text-center mb-4">
              <div className="display-1 text-success mb-3">✅</div>
              <h4>Thank you for your purchase!</h4>
              <p className="text-muted">
                Payment of ₹{total} received via {selectedPayment}
              </p>
            </div>
            
            <div className="text-center">
              <Button
                variant="primary"
                size="lg"
                className="px-5 me-3"
                onClick={handlePrintReceipt}
              >
                <FaPrint /> Reprint Receipt
              </Button>
              
              <Button
                variant="success"
                size="lg"
                className="px-5"
                onClick={handleFinish}
              >
                <FaHome /> New Bill
              </Button>
            </div>
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <small className="text-muted">
          {paymentStatus === 'pending' && 'Select payment method and generate bill'}
          {paymentStatus === 'generated' && 'Bill generated. Proceed with payment.'}
          {paymentStatus === 'qr_shown' && 'Show QR code to customer'}
          {paymentStatus === 'completed' && 'Payment completed successfully'}
        </small>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;