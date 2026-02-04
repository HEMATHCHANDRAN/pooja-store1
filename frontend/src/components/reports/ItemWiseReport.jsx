import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Form, Button, Table,
  Badge, Alert, Spinner, InputGroup
} from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import {
  FaSearch, FaRupeeSign, FaBox, FaSortAmountDown,
  FaSortAmountUp, FaFileExport, FaPrint, FaCalendar
} from 'react-icons/fa';
import api from '../../services/api';

const ItemWiseReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('amount');
  const [sortOrder, setSortOrder] = useState('desc');

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
      const response = await api.getItemWiseReport({
        startDate,
        endDate
      });
      
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortedItems = () => {
    if (!reportData?.items) return [];
    
    const items = [...reportData.items];
    
    return items.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    }).filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStockBadge = (stock) => {
    if (stock > 20) return <Badge bg="success">High</Badge>;
    if (stock > 5) return <Badge bg="warning">Medium</Badge>;
    return <Badge bg="danger">Low</Badge>;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    toast.success('Export functionality coming soon!');
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0"><FaBox /> Item-wise Sales Report</h5>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" onClick={handlePrint}>
            <FaPrint /> Print
          </Button>
          <Button variant="outline-success" size="sm" onClick={handleExport}>
            <FaFileExport /> Export
          </Button>
        </div>
      </Card.Header>
      
      <Card.Body>
        {/* Date Range Selector */}
        <Row className="mb-4">
          <Col md={3}>
            <Form.Group>
              <Form.Label><FaCalendar /> Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label><FaCalendar /> End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Search Items</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
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

        {/* Summary Cards */}
        {reportData && (
          <Row className="mb-4">
            <Col md={4}>
              <Card className="border-primary">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Total Items Sold</h6>
                      <h3 className="mb-0">{reportData.totals.totalQuantity}</h3>
                    </div>
                    <FaBox className="text-primary fs-1" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-success">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Total Revenue</h6>
                      <h3 className="mb-0">{formatCurrency(reportData.totals.totalAmount)}</h3>
                    </div>
                    <FaRupeeSign className="text-success fs-1" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-info">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Unique Items</h6>
                      <h3 className="mb-0">{reportData.totalItems}</h3>
                    </div>
                    <FaSortAmountDown className="text-info fs-1" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Report Table */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading report data...</p>
          </div>
        ) : reportData ? (
          <>
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>
                      <Button 
                        variant="link" 
                        className="p-0 text-decoration-none"
                        onClick={() => handleSort('name')}
                      >
                        Item Name {sortBy === 'name' && (
                          sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />
                        )}
                      </Button>
                    </th>
                    <th>Code</th>
                    <th>Category</th>
                    <th>
                      <Button 
                        variant="link" 
                        className="p-0 text-decoration-none"
                        onClick={() => handleSort('totalQuantity')}
                      >
                        Quantity Sold {sortBy === 'totalQuantity' && (
                          sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />
                        )}
                      </Button>
                    </th>
                    <th>Current Stock</th>
                    <th>Price</th>
                    <th>
                      <Button 
                        variant="link" 
                        className="p-0 text-decoration-none"
                        onClick={() => handleSort('totalAmount')}
                      >
                        Total Amount {sortBy === 'totalAmount' && (
                          sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />
                        )}
                      </Button>
                    </th>
                    <th>Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedItems().map((item, index) => (
                    <tr key={item.itemId}>
                      <td className="fw-bold">{item.name}</td>
                      <td><code>{item.itemCode}</code></td>
                      <td>
                        <Badge bg="info">{item.category}</Badge>
                      </td>
                      <td>
                        <span className="fw-bold">{item.totalQuantity}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold">{item.currentStock}</span>
                          {getStockBadge(item.currentStock)}
                        </div>
                      </td>
                      <td className="fw-bold text-primary">
                        <FaRupeeSign /> {item.price}
                      </td>
                      <td className="fw-bold text-success">
                        <FaRupeeSign /> {item.totalAmount.toFixed(2)}
                      </td>
                      <td className="text-muted">
                        <FaRupeeSign /> {item.averagePrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {reportData.totals && (
                  <tfoot className="table-dark">
                    <tr>
                      <td colSpan="3" className="text-end fw-bold">TOTALS:</td>
                      <td className="fw-bold">{reportData.totals.totalQuantity}</td>
                      <td>-</td>
                      <td>-</td>
                      <td className="fw-bold text-success">
                        <FaRupeeSign /> {reportData.totals.totalAmount.toFixed(2)}
                      </td>
                      <td>-</td>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </div>
            
            {getSortedItems().length === 0 && (
              <Alert variant="info" className="text-center mt-3">
                No items found matching your search
              </Alert>
            )}

            {/* Date Range Info */}
            <div className="mt-3 text-muted">
              <small>
                Report Period: {startDate} to {endDate} | 
                Showing {getSortedItems().length} of {reportData.items.length} items
              </small>
            </div>
          </>
        ) : (
          <Alert variant="info" className="text-center">
            <FaCalendar className="mb-2" size={32} />
            <h5>No Report Data</h5>
            <p className="mb-0">Select date range and click Refresh to generate report</p>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default ItemWiseReport;