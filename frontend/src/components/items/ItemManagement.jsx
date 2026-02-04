import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Table, Button, Form, InputGroup,
  Modal, Badge, Alert, Pagination, Image
} from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaBox, FaRupeeSign,
  FaSave, FaTimes, FaCamera, FaImage
} from 'react-icons/fa';
import api from '../../services/api';
import CameraCapture from './CameraCapture';

const ItemManagement = () => {
  // State management
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    itemCode: '',
    name: '',
    price: '',
    costPrice: '',
    currentStock: '',
    minStockAlert: '10',
    category: 'Incense',
    description: ''
  });
  const [itemImage, setItemImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Backend URL
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${BACKEND_URL}/${cleanPath}`;
  };

  // Load items
  useEffect(() => {
    loadItems();
  }, []);

  // Filter items
  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, items]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await api.getItems();
      const itemsData = response.data.data || [];
      setItems(itemsData);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(itemsData.map(item => item.category))];
      setCategories(uniqueCategories);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Failed to load items');
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.itemCode.toLowerCase().includes(term)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredItems(filtered);
  };

  const handleAddItem = () => {
    // Generate next item code
    const lastItem = items[items.length - 1];
    let nextCode = 'INC001';
    if (lastItem && lastItem.itemCode) {
      const prefix = lastItem.itemCode.substring(0, 3);
      const num = parseInt(lastItem.itemCode.substring(3)) + 1;
      nextCode = prefix + String(num).padStart(3, '0');
    }
    
    setFormData({
      itemCode: nextCode,
      name: '',
      price: '',
      costPrice: '',
      currentStock: '',
      minStockAlert: '10',
      category: 'Incense',
      description: ''
    });
    setItemImage(null);
    setImageFile(null);
    setShowAddModal(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setFormData({
      itemCode: item.itemCode,
      name: item.name,
      price: item.price,
      costPrice: item.costPrice || '',
      currentStock: item.currentStock,
      minStockAlert: item.minStockAlert,
      category: item.category,
      description: item.description || ''
    });
    setItemImage(item.image ? getImageUrl(item.image) : null);
    setImageFile(null);
    setShowEditModal(true);
  };

  const handleDeleteItem = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await api.deleteItem(item._id);
        toast.success(`Item "${item.name}" deleted successfully`);
        loadItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item');
      }
    }
  };

  const handleImageCapture = (imageData) => {
    setItemImage(imageData);
    // Convert base64 to File object
    const arr = imageData.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    const file = new File([u8arr], `item_${Date.now()}.jpg`, { type: mime });
    setImageFile(file);
  };

  const handleSubmitAdd = async () => {
    try {
      // Create FormData for file upload
      const formDataObj = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataObj.append(key, formData[key]);
        }
      });
      
      // Append image file if exists
      if (imageFile) {
        formDataObj.append('image', imageFile);
      }
      
      console.log('Submitting form data:', Object.fromEntries(formDataObj));
      
      const response = await api.createItem(formDataObj);
      if (response.data.success) {
        toast.success(`Item "${formData.name}" added successfully`);
        setShowAddModal(false);
        loadItems();
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error(error.response?.data?.error || 'Failed to add item');
    }
  };

  const handleSubmitEdit = async () => {
    try {
      const formDataObj = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataObj.append(key, formData[key]);
        }
      });
      
      // Append image file if exists
      if (imageFile) {
        formDataObj.append('image', imageFile);
      }
      
      const response = await api.updateItem(selectedItem._id, formDataObj);
      if (response.data.success) {
        toast.success(`Item "${formData.name}" updated successfully`);
        setShowEditModal(false);
        loadItems();
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error(error.response?.data?.error || 'Failed to update item');
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStockBadge = (stock, minStock) => {
    if (stock === 0) return <Badge bg="danger">Out of Stock</Badge>;
    if (stock <= minStock) return <Badge bg="warning">Low Stock</Badge>;
    return <Badge bg="success">In Stock</Badge>;
  };

  return (
    <Container fluid className="billing-container">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="d-flex align-items-center gap-2">
            <FaBox /> Item Management
          </h2>
          <p className="text-muted">Manage your store items ({items.length} products)</p>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button variant="primary" onClick={handleAddItem}>
            <FaPlus /> Add New Item
          </Button>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search items by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
              >
                <FaTimes /> Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Items Table with Images */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <Alert variant="info" className="m-4">
              <FaBox className="me-2" />
              {searchTerm ? `No items matching "${searchTerm}"` : 'No items found. Add some items first!'}
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Image</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item._id}>
                      <td>
                        {item.image ? (
                          <Image
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="bg-light d-flex align-items-center justify-content-center"
                                       style="width: 60px; height: 60px; border-radius: 4px;">
                                    <i class="fas fa-image text-muted"></i>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div className="bg-light d-flex align-items-center justify-content-center"
                               style={{ width: '60px', height: '60px', borderRadius: '4px' }}>
                            <FaImage className="text-muted" size={24} />
                          </div>
                        )}
                      </td>
                      <td>
                        <code>{item.itemCode}</code>
                      </td>
                      <td>
                        <div className="fw-bold">{item.name}</div>
                        {item.description && (
                          <small className="text-muted">{item.description.substring(0, 30)}...</small>
                        )}
                      </td>
                      <td>
                        <Badge bg="info">{item.category}</Badge>
                      </td>
                      <td>
                        <div className="fw-bold text-success">
                          <FaRupeeSign /> {item.price}
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold">{item.currentStock}</div>
                        <small className="text-muted">Min: {item.minStockAlert}</small>
                      </td>
                      <td>
                        {getStockBadge(item.currentStock, item.minStockAlert)}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteItem(item)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Item Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><FaPlus /> Add New Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Image Preview/Upload */}
          <div className="text-center mb-4">
            {itemImage ? (
              <div>
                <Image
                  src={itemImage}
                  alt="Item"
                  fluid
                  style={{
                    maxHeight: '200px',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px'
                  }}
                  className="mb-2"
                />
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    setItemImage(null);
                    setImageFile(null);
                  }}
                >
                  <FaTimes /> Remove Image
                </Button>
              </div>
            ) : (
              <div className="border rounded p-4">
                <FaImage size={48} className="text-muted mb-3" />
                <p className="text-muted mb-3">Add item image for better identification</p>
                <Button
                  variant="outline-primary"
                  onClick={() => setShowCamera(true)}
                >
                  <FaCamera /> Add Image
                </Button>
              </div>
            )}
          </div>

          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Item Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="itemCode"
                    value={formData.itemCode}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Price (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Cost Price (₹) - Optional</Form.Label>
                  <Form.Control
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Current Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    name="currentStock"
                    value={formData.currentStock}
                    onChange={handleFormChange}
                    min="0"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Min Stock Alert</Form.Label>
                  <Form.Control
                    type="number"
                    name="minStockAlert"
                    value={formData.minStockAlert}
                    onChange={handleFormChange}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                  >
                    <option value="Incense">Incense</option>
                    <option value="Idols">Idols</option>
                    <option value="Books">Books</option>
                    <option value="Pooja Items">Pooja Items</option>
                    <option value="Others">Others</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={2}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            <FaTimes /> Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitAdd}>
            <FaSave /> Add Item
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Item Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><FaEdit /> Edit Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Image Preview/Upload */}
          <div className="text-center mb-4">
            {itemImage ? (
              <div>
                <Image
                  src={itemImage}
                  alt="Item"
                  fluid
                  style={{
                    maxHeight: '200px',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px'
                  }}
                  className="mb-2"
                />
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowCamera(true)}
                >
                  <FaCamera /> Change Image
                </Button>
              </div>
            ) : (
              <div className="border rounded p-4">
                <FaImage size={48} className="text-muted mb-3" />
                <p className="text-muted mb-3">No image added</p>
                <Button
                  variant="outline-primary"
                  onClick={() => setShowCamera(true)}
                >
                  <FaCamera /> Add Image
                </Button>
              </div>
            )}
          </div>

          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Item Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="itemCode"
                    value={formData.itemCode}
                    onChange={handleFormChange}
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Price (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Cost Price (₹) - Optional</Form.Label>
                  <Form.Control
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Current Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    name="currentStock"
                    value={formData.currentStock}
                    onChange={handleFormChange}
                    min="0"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Min Stock Alert</Form.Label>
                  <Form.Control
                    type="number"
                    name="minStockAlert"
                    value={formData.minStockAlert}
                    onChange={handleFormChange}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                  >
                    <option value="Incense">Incense</option>
                    <option value="Idols">Idols</option>
                    <option value="Books">Books</option>
                    <option value="Pooja Items">Pooja Items</option>
                    <option value="Others">Others</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={2}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            <FaTimes /> Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitEdit}>
            <FaSave /> Update Item
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Camera Capture Modal */}
      <CameraCapture
        show={showCamera}
        onHide={() => setShowCamera(false)}
        onCapture={handleImageCapture}
      />
    </Container>
  );
};

export default ItemManagement;