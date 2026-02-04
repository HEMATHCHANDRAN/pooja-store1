import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Row,
  Col,
  ProgressBar,
  Alert
} from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import {
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaRupeeSign,
  FaChartBar
} from 'react-icons/fa';
import api from '../../services/api';

const PaymentReport = ({ dateRange }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const response = await api.getPaymentReport(dateRange);
      setReportData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading payment report:', error);
      toast.error('Failed to load payment report');
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      if (type === 'excel') {
        window.open(`http://localhost:5000/api/reports/export/excel?type=payment&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      } else if (type === 'pdf') {
        window.open(`http://localhost:5000/api/reports/export/pdf?type=payment&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading payment report...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <Alert variant="info">
        No payment report data available for the selected period.
      </Alert>
    );
  }

  const paymentMethods = [
    { name: 'Mohan Kumar', color: 'primary' },
    { name: 'Nalini', color: 'success' },
    { name: 'Lalitha', color: 'info' },
    { name: 'Hemath', color: 'warning' },
    { name: 'Cash', color: 'secondary' }
  ];

  return (
    <div>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h4 className="d-flex align-items-center gap-2">
            <FaChartBar /> Payment Method Report
          </h4>
          <p className="text-muted mb-0">
            {reportData.period} | Total Sales: ₹{reportData.totalAmount} | Total Bills: {reportData.totalBills}
          </p>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button variant="outline-success" size="sm" onClick={() => handleExport('excel')}>
            <FaFileExcel /> Excel
          </Button>
          <Button variant="outline-danger" size="sm" onClick={() => handleExport('pdf')}>
            <FaFilePdf /> PDF
          </Button>
          <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
            <FaPrint /> Print
          </Button>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4">
        {reportData.breakdown.map((payment, index) => (
          <Col key={payment.method} xl={2} lg={4} md={4} sm={6} className="mb-3">
            <Card className={`border-${paymentMethods.find(p => p.name === payment.method)?.color || 'primary'}`}>
              <Card.Body className="text-center">
                <div className={`text-${paymentMethods.find(p => p.name === payment.method)?.color || 'primary'} fs-1 mb-2`}>
                  <FaRupeeSign />
                </div>
                <h5 className="card-title">{payment.method}</h5>
                <h3 className="mb-2">₹{payment.amount}</h3>
                <p className="text-muted mb-1">
                  {payment.count} {payment.count === 1 ? 'transaction' : 'transactions'}
                </p>
                <p className="fw-bold">{payment.percentage}%</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Detailed Table */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Payment Method Breakdown</h5>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Payment Method</th>
                  <th className="text-center">Transactions</th>
                  <th className="text-end">Amount</th>
                  <th className="text-end">Percentage</th>
                  <th className="text-center">Progress</th>
                </tr>
              </thead>
              <tbody>
                {reportData.breakdown.map((payment) => (
                  <tr key={payment.method}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className={`bg-${paymentMethods.find(p => p.name === payment.method)?.color || 'primary'} rounded-circle me-2`}
                             style={{ width: '12px', height: '12px' }}></div>
                        <span className="fw-bold">{payment.method}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-primary">{payment.count}</span>
                    </td>
                    <td className="text-end fw-bold">
                      ₹{payment.amount.toLocaleString()}
                    </td>
                    <td className="text-end">
                      {payment.percentage}%
                    </td>
                    <td>
                      <ProgressBar
                        now={parseFloat(payment.percentage)}
                        variant={paymentMethods.find(p => p.name === payment.method)?.color || 'primary'}
                        label={`${payment.percentage}%`}
                      />
                    </td>
                  </tr>
                ))}
                <tr className="table-active">
                  <td className="fw-bold">TOTAL</td>
                  <td className="text-center fw-bold">{reportData.totalBills}</td>
                  <td className="text-end fw-bold">₹{reportData.totalAmount.toLocaleString()}</td>
                  <td className="text-end fw-bold">100%</td>
                  <td>
                    <ProgressBar now={100} variant="dark" label="100%" />
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Insights */}
      <Card>
        <Card.Body>
          <h5 className="mb-3">Insights</h5>
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <h6>Top Payment Method</h6>
                <p className="fs-4">
                  {reportData.breakdown.reduce((max, payment) => 
                    payment.amount > max.amount ? payment : max
                  ).method}
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <h6>Average Transaction Value</h6>
                <p className="fs-4">
                  ₹{(reportData.totalAmount / reportData.totalBills).toFixed(2)}
                </p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentReport;