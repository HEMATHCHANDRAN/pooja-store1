import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Form, Button, Table,
  Badge, Alert, Spinner
} from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import {
  FaCalendarWeek, FaRupeeSign, FaChartLine,
  FaArrowUp, FaArrowDown, FaPrint
} from 'react-icons/fa';
import api from '../../services/api';

const WeeklyReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState('');

  // Set default to current week's Monday
  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(today.setDate(diff));
    setStartDate(monday.toISOString().split('T')[0]);
  }, []);

  // Load report when date changes
  useEffect(() => {
    if (startDate) {
      loadReport();
    }
  }, [startDate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.getWeeklyReport({
        startDate
      });
      
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading weekly report:', error);
      toast.error('Failed to load report');
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0"><FaCalendarWeek /> Weekly Sales Report</h5>
        <div className="d-flex gap-2 align-items-center">
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: 'auto' }}
          />
          <Button variant="outline-primary" size="sm" onClick={handlePrint}>
            <FaPrint /> Print
          </Button>
        </div>
      </Card.Header>
      
      <Card.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading report data...</p>
          </div>
        ) : reportData ? (
          <>
            {/* Summary Cards */}
            <Row className="mb-4">
              <Col md={4}>
                <Card className="border-primary">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">Weekly Sales</h6>
                        <h3 className="mb-0">{formatCurrency(reportData.totals.totalSales)}</h3>
                        <small className="text-muted">
                          {reportData.week.startDate} to {reportData.week.endDate}
                        </small>
                      </div>
                      <FaRupeeSign className="text-primary fs-1" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-success">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">Total Bills</h6>
                        <h3 className="mb-0">{reportData.totals.totalBills}</h3>
                        <small className="text-muted">
                          Avg: {formatCurrency(reportData.totals.totalSales / reportData.totals.totalBills)}
                        </small>
                      </div>
                      <FaCalendarWeek className="text-success fs-1" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-info">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">Daily Average</h6>
                        <h3 className="mb-0">{formatCurrency(reportData.averages.averageDailySales)}</h3>
                        <small className="text-muted">
                          {reportData.averages.averageDailyBills.toFixed(1)} bills/day
                        </small>
                      </div>
                      <FaChartLine className="text-info fs-1" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Day-wise Breakdown */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Day-wise Performance</h6>
              </Card.Header>
              <Card.Body>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Date</th>
                      <th>Sales</th>
                      <th>Bills</th>
                      <th>Avg Bill Value</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.dailyReport.map((day, index) => (
                      <tr key={day.date}>
                        <td>
                          <Badge bg={day.day === 'Sun' ? 'danger' : 'secondary'}>
                            {day.day}
                          </Badge>
                        </td>
                        <td>{day.date}</td>
                        <td className="fw-bold text-success">
                          <FaRupeeSign /> {day.sales.toFixed(2)}
                        </td>
                        <td className="fw-bold">{day.bills}</td>
                        <td>
                          {day.bills > 0 ? formatCurrency(day.sales / day.bills) : 'N/A'}
                        </td>
                        <td>
                          {day.sales >= reportData.averages.averageDailySales ? (
                            <Badge bg="success">
                              <FaArrowUp /> Above Avg
                            </Badge>
                          ) : (
                            <Badge bg="warning">
                              <FaArrowDown /> Below Avg
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Highlights */}
            <Row>
              <Col md={6}>
                <Card className="border-success">
                  <Card.Header>
                    <h6 className="mb-0">Best Performing Day</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center">
                      <h3 className="text-success">
                        {reportData.averages.highestSalesDay.day} - {reportData.averages.highestSalesDay.date}
                      </h3>
                      <h4 className="fw-bold">
                        {formatCurrency(reportData.averages.highestSalesDay.sales)}
                      </h4>
                      <p className="text-muted mb-0">
                        {reportData.averages.highestSalesDay.bills} bills
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-warning">
                  <Card.Header>
                    <h6 className="mb-0">Lowest Performing Day</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center">
                      <h3 className="text-warning">
                        {reportData.averages.lowestSalesDay.day} - {reportData.averages.lowestSalesDay.date}
                      </h3>
                      <h4 className="fw-bold">
                        {formatCurrency(reportData.averages.lowestSalesDay.sales)}
                      </h4>
                      <p className="text-muted mb-0">
                        {reportData.averages.lowestSalesDay.bills} bills
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <Alert variant="info" className="text-center">
            <FaCalendarWeek className="mb-2" size={32} />
            <h5>No Report Data</h5>
            <p className="mb-0">Select a week to view weekly report</p>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default WeeklyReport;