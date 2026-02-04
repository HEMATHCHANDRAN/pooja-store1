import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Table,
  InputGroup, Modal, Badge, Alert, ListGroup, Image
} from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaPlus, FaMinus, FaTrash, FaRupeeSign,
  FaShoppingCart, FaPrint, FaQrcode, FaTimes, FaCheck, FaHome, FaImage
} from 'react-icons/fa';
import api from '../../services/api';

const TypeBasedBilling = () => {
  const navigate = useNavigate();
  
  // State management
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  
  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStep, setPaymentStep] = useState('select'); // select, qr, complete
  const [generatedBill, setGeneratedBill] = useState(null);
  const [showPrintOption, setShowPrintOption] = useState(false);
  
  // Refs
  const searchRef = useRef(null);

  // Image URL helper function
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL or base64, return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Remove leading slash if present
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    
    // Construct full URL
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}/${cleanPath}`;
  };

  // QR image helper
  const getQRImagePath = () => {
    const qrMap = {
      'Mohan Kumar': 'mohan.png',
      'Nalini': 'nalini.png',
      'Lalitha': 'lalitha.png',
      'Hemath': 'hemath.png'
    };
    return qrMap[paymentMethod] || 'default.png';
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  // Filter items
  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, items]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const itemsResponse = await api.getItems();
      const itemsData = itemsResponse.data.data || [];
      setItems(itemsData);
      
      const uniqueCategories = ['All', ...new Set(itemsData.map(item => item.category))];
      setCategories(uniqueCategories);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.itemCode.toLowerCase().includes(term)
      );
    }
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredItems(filtered);
  };

  // Cart operations
  const addToCart = (item) => {
    if (item.currentStock <= 0) {
      toast.error(`${item.name} is out of stock!`);
      return;
    }

    const existingItem = cart.find(cartItem => cartItem.itemId === item._id);
    
    if (existingItem) {
      if (existingItem.quantity >= item.currentStock) {
        toast.error(`Only ${item.currentStock} items available in stock!`);
        return;
      }
      
      setCart(cart.map(cartItem =>
        cartItem.itemId === item._id
          ? {
              ...cartItem,
              quantity: cartItem.quantity + 1,
              total: (cartItem.quantity + 1) * cartItem.price
            }
          : cartItem
      ));
    } else {
      setCart([
        ...cart,
        {
          itemId: item._id,
          itemCode: item.itemCode,
          name: item.name,
          price: item.price,
          quantity: 1,
          total: item.price,
          stock: item.currentStock,
          image: item.image
        }
      ]);
    }
    
    toast.success(`Added ${item.name} to cart`);
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item.itemId === itemId) {
        const newQuantity = Math.max(1, item.quantity + change);
        
        if (newQuantity > item.stock) {
          toast.error(`Only ${item.stock} items available in stock!`);
          return item;
        }
        
        return {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.price
        };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.itemId !== itemId));
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear the cart?')) {
      setCart([]);
      toast.success('Cart cleared');
    }
  };

  // Calculations
  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleGenerateBill = () => {
    if (cart.length === 0) {
      toast.error('Add items to cart before generating bill!');
      return;
    }
    setPaymentStep('select');
    setShowPaymentModal(true);
  };

  const handlePaymentSelect = () => {
    if (paymentMethod === 'Cash') {
      generateBill();
    } else {
      setPaymentStep('qr');
      generateBill();
    }
  };

  const generateBill = async () => {
    try {
      const billData = {
        items: cart.map(item => ({
          itemId: item.itemId,
          itemCode: item.itemCode,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        paymentMethod: paymentMethod,
        status: paymentMethod === 'Cash' ? 'paid' : 'pending',
        totalAmount: getSubtotal(),
        totalItems: getTotalItems()
      };

      const response = await api.createBill(billData);
      
      if (response.data.success) {
        const bill = response.data.data;
        setGeneratedBill(bill);
        
        if (paymentMethod === 'Cash') {
          setPaymentStep('complete');
          toast.success(`Bill ${bill.billNumber} generated!`);
        } else {
          toast.success(`Bill ${bill.billNumber} generated. Show QR code to customer.`);
        }
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to create bill';
      toast.error(errorMsg);
    }
  };

  const handlePaymentConfirmed = async () => {
    try {
      if (generatedBill && generatedBill._id) {
        try {
          await api.updateBill(generatedBill._id, { status: 'paid' });
          setPaymentStep('complete');
          toast.success('Payment confirmed successfully!');
        } catch (updateError) {
          setPaymentStep('complete');
          toast.success('Payment received!');
        }
      } else {
        toast.error('Bill information not found');
      }
    } catch (error) {
      setPaymentStep('complete');
      toast.success('Payment received!');
    }
  };

  const printReceipt = (bill) => {
    const printWindow = window.open('', '_blank');
    
    const dateStr = bill.date || new Date().toISOString().split('T')[0];
    const timeStr = bill.time || new Date().toLocaleTimeString('en-IN', { hour12: false });
    
    const receiptContent = `
      <html>
        <head>
          <title>Receipt - ${bill.billNumber}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
            }
            
            body { 
              font-family: 'Courier New', monospace; 
              padding: 10px; 
              max-width: 280px; 
              margin: 0 auto; 
              background: white;
              font-size: 12px;
            }
            .receipt { border-top: 2px dashed #000; padding-top: 10px; }
            .header { text-align: center; margin-bottom: 10px; }
            .store-name { font-weight: bold; font-size: 16px; margin-bottom: 2px; }
            .address { font-size: 10px; margin-bottom: 8px; }
            .separator { border-top: 1px dashed #000; margin: 10px 0; }
            .item-row { display: flex; justify-content: space-between; margin: 4px 0; }
            .item-name { flex: 2; text-align: left; }
            .item-qty { flex: 1; text-align: center; }
            .item-price { flex: 1; text-align: right; }
            .total-row { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 14px; }
            .footer { text-align: center; margin-top: 15px; font-size: 10px; border-top: 1px dashed #000; padding-top: 10px; }
            .thank-you { font-size: 12px; font-weight: bold; text-align: center; margin-top: 10px; }
            .bill-info { font-size: 11px; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="store-name">🛍️ POOJA STORE PRO</div>
              <div class="address">Religious Items & Supplies</div>
              <div class="separator"></div>
              <div class="bill-info">
                Bill No: <strong>${bill.billNumber}</strong><br>
                Date: ${dateStr} | Time: ${timeStr}
              </div>
            </div>
            
            <div class="separator"></div>
            
            ${bill.items.map(item => `
              <div class="item-row">
                <div class="item-name">${item.name}</div>
                <div class="item-qty">${item.quantity} x ${item.price}</div>
                <div class="item-price">₹${item.total}</div>
              </div>
            `).join('')}
            
            <div class="separator"></div>
            
            <div class="item-row total-row">
              <div>TOTAL</div>
              <div>${bill.totalItems || bill.items.reduce((sum, item) => sum + item.quantity, 0)} items</div>
              <div>₹${bill.totalAmount}</div>
            </div>
            
            <div class="separator"></div>
            
            <div class="bill-info">
              Payment: <strong>${bill.paymentMethod}</strong><br>
              Status: <strong>${bill.status === 'paid' ? 'PAID' : 'PENDING'}</strong>
            </div>
            
            <div class="footer">
              <div>Thank you for shopping with us!</div>
              <div>Visit again 🙏</div>
            </div>
            
            <div class="thank-you">
              धन्यवाद! पुनः आगमन की प्रतीक्षा में
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 500);
  };

  const handleFinish = () => {
    setCart([]);
    setSearchTerm('');
    setSelectedCategory('All');
    setShowPaymentModal(false);
    setPaymentStep('select');
    setPaymentMethod('Cash');
    setGeneratedBill(null);
    loadInitialData();
    navigate('/');
  };

  return (
    <Container fluid className="billing-container px-3">
      <Row className="mb-4">
        <Col>
          <h2 className="d-flex align-items-center gap-2">
            <FaSearch /> Type-Based Billing
            {cart.length > 0 && (
              <Badge bg="primary" className="ms-2">
                {getTotalItems()} items
              </Badge>
            )}
          </h2>
          <p className="text-muted">Search items by name or code. Perfect for keyboard users.</p>
        </Col>
      </Row>

      <Row>
        {/* Left Panel - Items - REDUCED WIDTH */}
        <Col lg={7} xl={8}>
          <Card className="mb-4">
            <Card.Body>
              {/* Search and Filter */}
              <Row className="mb-4">
                <Col md={8}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      ref={searchRef}
                      type="text"
                      placeholder="Type item name or code (e.g., 'agarbatti' or 'INC001')..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="py-2"
                    />
                    {searchTerm && (
                      <Button
                        variant="outline-secondary"
                        onClick={() => setSearchTerm('')}
                      >
                        <FaTimes />
                      </Button>
                    )}
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="py-2"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              {/* Items Grid with LARGER IMAGES */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading items...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <Alert variant="info" className="text-center py-4">
                  <FaSearch size={32} className="mb-3" />
                  <h5>No items found</h5>
                  <p className="mb-0">
                    {searchTerm ? `No items matching "${searchTerm}"` : 'No items available. Add items first!'}
                  </p>
                </Alert>
              ) : (
                <Row>
                  {filteredItems.map(item => (
                    <Col key={item._id} xl={3} lg={4} md={4} sm={6} xs={6} className="mb-3">
                      <Card className="item-card h-100 border-0 shadow-sm">
                        <div className="position-relative" style={{ 
                          height: '200px',  // INCREASED HEIGHT
                          overflow: 'hidden',
                          backgroundColor: '#f8f9fa'
                        }}>
                          {item.image ? (
                            <Card.Img
                              variant="top"
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              style={{ 
                                height: '100%', 
                                width: '100%', 
                                objectFit: 'cover',
                                transition: 'transform 0.3s'
                              }}
                              className="hover-zoom"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `
                                  <div class="d-flex flex-column align-items-center justify-content-center" style="height: 100%;">
                                    <i class="fas fa-image text-muted mb-2" style="font-size: 64px;"></i>
                                    <small class="text-muted">No Image</small>
                                  </div>
                                `;
                              }}
                            />
                          ) : (
                            <div className="d-flex flex-column align-items-center justify-content-center"
                                 style={{ height: '100%' }}>
                              <FaImage className="text-muted mb-3" size={64} />
                              <small className="text-muted">No Image</small>
                            </div>
                          )}
                          <Badge 
                            bg={item.currentStock > 10 ? 'success' : item.currentStock > 0 ? 'warning' : 'danger'}
                            className="position-absolute top-0 end-0 m-2"
                            style={{ fontSize: '0.8rem', padding: '5px 10px' }}
                          >
                            Stock: {item.currentStock}
                          </Badge>
                        </div>
                        <Card.Body className="text-center p-3">
                          <Card.Title className="h6 mb-2 text-truncate fw-bold" title={item.name}>
                            {item.name}
                          </Card.Title>
                          <Card.Text className="mb-2">
                            <small className="text-muted">Code: {item.itemCode}</small>
                          </Card.Text>
                          <Card.Text className="fw-bold text-primary mb-3" style={{ fontSize: '1.1rem' }}>
                            ₹{item.price}
                          </Card.Text>
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-100 py-2"
                            onClick={() => addToCart(item)}
                            disabled={item.currentStock <= 0}
                            style={{ fontSize: '0.9rem' }}
                          >
                            {item.currentStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Panel - Cart - INCREASED WIDTH */}
        <Col lg={5} xl={4}>
          <Card className="cart-container shadow-lg">
            <Card.Header className="bg-primary text-white py-3">
              <h5 className="mb-0 d-flex align-items-center justify-content-between">
                <span>
                  <FaShoppingCart className="me-2" /> Shopping Cart
                  {cart.length > 0 && (
                    <Badge bg="light" text="dark" className="ms-2">
                      {cart.length} items
                    </Badge>
                  )}
                </span>
                {cart.length > 0 && (
                  <Button
                    variant="light"
                    size="sm"
                    onClick={clearCart}
                    className="py-1 px-2"
                  >
                    <FaTrash /> Clear All
                  </Button>
                )}
              </h5>
            </Card.Header>
            
            <Card.Body className="p-0" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <FaShoppingCart size={64} className="mb-3 opacity-50" />
                  <h6>Your cart is empty</h6>
                  <p className="small mb-0">
                    Search and add items from the left panel
                  </p>
                </div>
              ) : (
                <>
                  <ListGroup variant="flush" className="cart-items">
                    {cart.map(item => (
                      <ListGroup.Item key={item.itemId} className="cart-item py-3">
                        <div className="d-flex align-items-start gap-3">
                          <div className="position-relative" style={{ 
                            width: '80px',   // INCREASED SIZE
                            height: '80px',  // INCREASED SIZE
                            flexShrink: 0
                          }}>
                            {item.image ? (
                              <Image
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '8px'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `
                                    <div class="bg-light d-flex align-items-center justify-content-center"
                                         style="width: 100%; height: 100%; border-radius: 8px;">
                                      <i class="fas fa-image text-muted fs-4"></i>
                                    </div>
                                  `;
                                }}
                              />
                            ) : (
                              <div className="bg-light d-flex align-items-center justify-content-center"
                                   style={{ 
                                     width: '100%', 
                                     height: '100%', 
                                     borderRadius: '8px' 
                                   }}>
                                <FaImage className="text-muted fs-4" />
                              </div>
                            )}
                            <Badge 
                              bg="primary" 
                              className="position-absolute bottom-0 end-0 translate-middle"
                              style={{ 
                                fontSize: '0.75rem',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {item.quantity}
                            </Badge>
                          </div>
                          <div className="flex-grow-1">
                            <div className="cart-item-name fw-bold mb-1" style={{ fontSize: '1rem' }}>
                              {item.name}
                            </div>
                            <div className="cart-item-qty text-muted small mb-2">
                              Code: {item.itemCode}
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-3">
                              <div className="btn-group btn-group-sm">
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => updateQuantity(item.itemId, -1)}
                                  disabled={item.quantity <= 1}
                                  className="px-3"
                                >
                                  <FaMinus />
                                </Button>
                                <span className="px-3 py-1 border bg-white fw-bold">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => updateQuantity(item.itemId, 1)}
                                  className="px-3"
                                >
                                  <FaPlus />
                                </Button>
                              </div>
                              <div className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>
                                ₹{item.total}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeFromCart(item.itemId)}
                            className="align-self-start mt-1"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </>
              )}
            </Card.Body>
            
            {cart.length > 0 && (
              <Card.Footer className="border-top-0 bg-light">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Total Items:</span>
                  <span className="fw-bold">{getTotalItems()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal:</span>
                  <span className="fw-bold">₹{getSubtotal()}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="text-muted fs-5">Grand Total:</span>
                  <span className="fw-bold fs-3 text-primary">₹{getSubtotal()}</span>
                </div>
                
                <Button
                  variant="success"
                  size="lg"
                  className="w-100 py-3 fw-bold shadow"
                  onClick={handleGenerateBill}
                >
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <FaRupeeSign />
                    <span>GENERATE BILL - ₹{getSubtotal()}</span>
                  </div>
                </Button>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Payment Modal */}
      <Modal 
        show={showPaymentModal} 
        onHide={() => setShowPaymentModal(false)} 
        centered 
        size="xl"  // Changed to xl for larger modal
        backdrop="static"
      >
        <Modal.Header closeButton={paymentStep === 'select'}>
          <Modal.Title>
            {paymentStep === 'select' && 'Select Payment Method'}
            {paymentStep === 'qr' && 'QR Code Payment'}
            {paymentStep === 'complete' && 'Payment Complete'}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body style={{ padding: '30px' }}>
          {/* Step 1: Select Payment Method */}
          {paymentStep === 'select' && (
            <>
              <div className="text-center mb-5">
                <h2 className="text-primary mb-3">Total Amount: ₹{getSubtotal()}</h2>
                <p className="text-muted fs-5">Select payment method</p>
              </div>
              
              <Row className="g-4 mb-5">
                {['Mohan Kumar', 'Nalini', 'Lalitha', 'Hemath', 'Cash'].map(method => (
                  <Col key={method} xs={6} md={4} lg={3}>
                    <Button
                      variant={paymentMethod === method ? 'primary' : 'outline-primary'}
                      className="w-100 py-5"
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        borderWidth: paymentMethod === method ? '3px' : '1px',
                        fontSize: '1rem'
                      }}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <div className="fs-1 mb-3">
                          {method === 'Cash' ? '💵' : <FaQrcode />}
                        </div>
                        <div className="fw-bold fs-5">{method}</div>
                        {method !== 'Cash' && (
                          <small className="text-muted mt-1">UPI Payment</small>
                        )}
                      </div>
                    </Button>
                  </Col>
                ))}
              </Row>
              
              <div className="text-center mt-4">
                <Button
                  variant="success"
                  size="lg"
                  className="px-5 py-3 fw-bold"
                  onClick={handlePaymentSelect}
                  style={{ fontSize: '1.1rem' }}
                >
                  <FaCheck className="me-2" /> Continue
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Show QR Code - EXTRA LARGE SIZE */}
          {paymentStep === 'qr' && generatedBill && (
            <>
              <div className="text-center mb-5">
                <h2 className="text-primary mb-2">Amount: ₹{generatedBill.totalAmount}</h2>
                <p className="text-muted fs-5 mb-1">Scan to pay using {paymentMethod}</p>
                <p className="text-muted fs-5">Bill No: <strong>{generatedBill.billNumber}</strong></p>
              </div>
              
              <div className="text-center">
                <div className="p-4 mb-4 bg-light rounded d-flex flex-column align-items-center">
                  {/* EXTRA LARGE QR CODE - 500x500px */}
                  <div className="qr-container mb-4" style={{
                    width: '500px',
                    height: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    border: '4px solid #dee2e6',
                    borderRadius: '15px',
                    padding: '25px'
                  }}>
                    <Image
                      src={`/qrcodes/${getQRImagePath()}`}
                      alt={`${paymentMethod} QR Code`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                      className="shadow"
                    />
                  </div>
                  
                  <div className="amount-display mt-4">
                    <h1 className="text-success fw-bold" style={{ fontSize: '3rem' }}>
                      ₹{generatedBill.totalAmount}
                    </h1>
                    <div className="payment-info mt-3">
                      <Badge bg="info" className="fs-5 p-3">
                        Payment to: {paymentMethod}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* REMOVED INSTRUCTIONS SECTION */}
                
                <div className="d-flex justify-content-center gap-4 mt-5">
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={() => {
                      setPaymentStep('select');
                    }}
                    style={{ 
                      minWidth: '160px',
                      padding: '12px 24px',
                      fontSize: '1.1rem'
                    }}
                  >
                    <FaTimes className="me-2" /> Back
                  </Button>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handlePaymentConfirmed}
                    style={{ 
                      minWidth: '220px',
                      padding: '12px 24px',
                      fontSize: '1.1rem'
                    }}
                  >
                    <FaCheck className="me-2" /> Payment Received
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Payment Complete - WITH PRINT OPTION */}
          {paymentStep === 'complete' && generatedBill && (
            <>
              <div className="text-center mb-5">
                <div className="display-1 text-success mb-4">✅</div>
                <h1 className="text-success mb-3">Payment Successful!</h1>
                <p className="text-muted fs-4">
                  Bill <strong className="text-dark">{generatedBill.billNumber}</strong> has been paid
                </p>
              </div>
              
              <Alert variant="success" className="text-center p-4">
                <div className="d-flex flex-column align-items-center">
                  <div className="fs-2 mb-3">Amount: ₹{generatedBill.totalAmount}</div>
                  <div className="mb-3 fs-5">Payment: {generatedBill.paymentMethod}</div>
                  <Badge bg="success" className="fs-5 p-3">PAID</Badge>
                </div>
              </Alert>
              
              {/* Print Option Section */}
              {!showPrintOption ? (
                <div className="text-center mt-5">
                  <h5 className="mb-4">Would you like to print the receipt?</h5>
                  <div className="d-flex justify-content-center gap-4">
                    <Button
                      variant="outline-primary"
                      size="lg"
                      onClick={() => {
                        printReceipt(generatedBill);
                        setShowPrintOption(true);
                      }}
                      style={{ 
                        minWidth: '180px',
                        padding: '12px 24px',
                        fontSize: '1.1rem'
                      }}
                    >
                      <FaPrint className="me-2" /> Yes, Print Receipt
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="lg"
                      onClick={() => setShowPrintOption(true)}
                      style={{ 
                        minWidth: '180px',
                        padding: '12px 24px',
                        fontSize: '1.1rem'
                      }}
                    >
                      No, Skip Printing
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center mt-5">
                  <h5 className="mb-4">What would you like to do next?</h5>
                  <div className="d-flex justify-content-center gap-4">
                    <Button
                      variant="outline-primary"
                      size="lg"
                      onClick={() => {
                        setShowPaymentModal(false);
                        setShowPrintOption(false);
                        setCart([]);
                        setSearchTerm('');
                        setSelectedCategory('All');
                        setGeneratedBill(null);
                        loadInitialData();
                      }}
                      style={{ 
                        minWidth: '180px',
                        padding: '12px 24px',
                        fontSize: '1.1rem'
                      }}
                    >
                      <FaHome className="me-2" /> Return to Home
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        setShowPaymentModal(false);
                        setShowPrintOption(false);
                        setCart([]);
                        setSearchTerm('');
                        setSelectedCategory('All');
                        setGeneratedBill(null);
                      }}
                      style={{ 
                        minWidth: '180px',
                        padding: '12px 24px',
                        fontSize: '1.1rem'
                      }}
                    >
                      <FaSearch className="me-2" /> Start New Bill
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default TypeBasedBilling;