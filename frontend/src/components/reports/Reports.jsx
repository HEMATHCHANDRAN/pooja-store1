import React, { useState } from 'react';
import { Container, Row, Col, Card, Tab, Nav } from 'react-bootstrap';
import { 
  FaChartBar, 
  FaCalendarDay, 
  FaCalendarWeek, 
  FaCalendarAlt,
  FaCreditCard,
  FaFileExport
} from 'react-icons/fa';
import ItemWiseReport from './ItemWiseReport';
import DailyReport from './DailyReport';
import WeeklyReport from './WeeklyReport';
import MonthlyReport from './MonthlyReport';
import PaymentReport from './PaymentReport';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('item-wise');

  return (
    <Container fluid className="reports-container">
      <Row className="mb-4">
        <Col>
          <h2 className="d-flex align-items-center gap-2">
            <FaChartBar /> Reports Dashboard
          </h2>
          <p className="text-muted">
            Analyze sales performance and generate detailed reports
          </p>
        </Col>
      </Row>

      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Row>
          <Col lg={3} xl={2}>
            <Card className="shadow-sm">
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="item-wise" className="d-flex align-items-center gap-2 py-3">
                      <FaChartBar className="fs-5" />
                      <span>Item-wise Sales</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="daily" className="d-flex align-items-center gap-2 py-3">
                      <FaCalendarDay className="fs-5" />
                      <span>Daily Report</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="weekly" className="d-flex align-items-center gap-2 py-3">
                      <FaCalendarWeek className="fs-5" />
                      <span>Weekly Report</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="monthly" className="d-flex align-items-center gap-2 py-3">
                      <FaCalendarAlt className="fs-5" />
                      <span>Monthly Report</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="payment" className="d-flex align-items-center gap-2 py-3">
                      <FaCreditCard className="fs-5" />
                      <span>Payment Report</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="export" className="d-flex align-items-center gap-2 py-3">
                      <FaFileExport className="fs-5" />
                      <span>Export Reports</span>
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={9} xl={10}>
            <Tab.Content>
              <Tab.Pane eventKey="item-wise">
                <ItemWiseReport />
              </Tab.Pane>
              <Tab.Pane eventKey="daily">
                <DailyReport />
              </Tab.Pane>
              <Tab.Pane eventKey="weekly">
                <WeeklyReport />
              </Tab.Pane>
              <Tab.Pane eventKey="monthly">
                <MonthlyReport />
              </Tab.Pane>
              <Tab.Pane eventKey="payment">
                <PaymentReport />
              </Tab.Pane>
              <Tab.Pane eventKey="export">
                <ExportReports />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

// Export Reports Component
const ExportReports = () => {
  const [exportType, setExportType] = useState('item-wise');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    // Implement export logic here
    setTimeout(() => {
      setLoading(false);
      alert(`Exporting ${exportType} report from ${startDate} to ${endDate}`);
    }, 1000);
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0"><FaFileExport /> Export Reports</h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          <Col md={6}>
            <label className="form-label">Report Type</label>
            <select 
              className="form-select"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
            >
              <option value="item-wise">Item-wise Sales</option>
              <option value="payment">Payment Method</option>
              <option value="daily">Daily Summary</option>
              <option value="monthly">Monthly Summary</option>
            </select>
          </Col>
          <Col md={3}>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Col>
          <Col xs={12}>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-success"
                onClick={handleExport}
                disabled={loading || !startDate || !endDate}
              >
                {loading ? 'Exporting...' : 'Export to Excel'}
              </button>
              <button className="btn btn-outline-primary">
                Export to PDF
              </button>
              <button className="btn btn-outline-secondary">
                Print Report
              </button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default Reports;