import React, { useState } from 'react';
import {
  Container, Row, Col, Card, Form,
  Button, Alert, Tabs, Tab
} from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import {
  FaCog, FaStore, FaCreditCard, FaPrint,
  FaDatabase, FaKey, FaSave, FaUndo
} from 'react-icons/fa';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(false);
  
  // Store Settings
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Pooja Store Pro',
    address: 'Religious Items & Supplies',
    contactNumber: '+91 9876543210',
    gstNumber: '',
    receiptHeader: '🛍️ POOJA STORE PRO\nReligious Items & Supplies',
    receiptFooter: 'Thank you for shopping with us!\nVisit again 🙏\nधन्यवाद! पुनः आगमन की प्रतीक्षा में'
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    enableCash: true,
    enableUPI: true,
    upiLimitAlert: 15,
    autoPrintReceipt: false,
    requirePaymentConfirmation: true
  });

  // Backup Settings
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupLocation: 'local',
    keepBackupDays: 30
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    requirePassword: true,
    sessionTimeout: 30,
    logActivities: true
  });

  const handleSave = (section) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success(`${section} settings saved successfully!`);
      setLoading(false);
    }, 1000);
  };

  const handleReset = (section) => {
    if (window.confirm(`Reset ${section} settings to default?`)) {
      toast.info(`${section} settings reset to default`);
    }
  };

  return (
    <Container fluid className="settings-container">
      <Row className="mb-4">
        <Col>
          <h2 className="d-flex align-items-center gap-2">
            <FaCog /> Settings
          </h2>
          <p className="text-muted">
            Configure your store preferences and system settings
          </p>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={setActiveTab}
        className="mb-4"
        fill
      >
        <Tab eventKey="store" title={<><FaStore /> Store</>}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Store Information</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Store Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={storeSettings.storeName}
                        onChange={(e) => setStoreSettings({
                          ...storeSettings,
                          storeName: e.target.value
                        })}
                        placeholder="Enter store name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Contact Number</Form.Label>
                      <Form.Control
                        type="text"
                        value={storeSettings.contactNumber}
                        onChange={(e) => setStoreSettings({
                          ...storeSettings,
                          contactNumber: e.target.value
                        })}
                        placeholder="Enter contact number"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Store Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={storeSettings.address}
                        onChange={(e) => setStoreSettings({
                          ...storeSettings,
                          address: e.target.value
                        })}
                        placeholder="Enter store address"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>GST Number (Optional)</Form.Label>
                      <Form.Control
                        type="text"
                        value={storeSettings.gstNumber}
                        onChange={(e) => setStoreSettings({
                          ...storeSettings,
                          gstNumber: e.target.value
                        })}
                        placeholder="Enter GST number"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Receipt Header</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={storeSettings.receiptHeader}
                        onChange={(e) => setStoreSettings({
                          ...storeSettings,
                          receiptHeader: e.target.value
                        })}
                        placeholder="Receipt header text"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Receipt Footer</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={storeSettings.receiptFooter}
                        onChange={(e) => setStoreSettings({
                          ...storeSettings,
                          receiptFooter: e.target.value
                        })}
                        placeholder="Receipt footer text"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
              <Button
                variant="outline-secondary"
                onClick={() => handleReset('store')}
              >
                <FaUndo /> Reset
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSave('Store')}
                disabled={loading}
              >
                <FaSave /> Save Store Settings
              </Button>
            </Card.Footer>
          </Card>
        </Tab>

        <Tab eventKey="payment" title={<><FaCreditCard /> Payment</>}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Payment Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Enable Cash Payments"
                        checked={paymentSettings.enableCash}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          enableCash: e.target.checked
                        })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Enable UPI Payments"
                        checked={paymentSettings.enableUPI}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          enableUPI: e.target.checked
                        })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Auto Print Receipt"
                        checked={paymentSettings.autoPrintReceipt}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          autoPrintReceipt: e.target.checked
                        })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>UPI Limit Alert</Form.Label>
                      <Form.Control
                        type="number"
                        value={paymentSettings.upiLimitAlert}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          upiLimitAlert: parseInt(e.target.value)
                        })}
                        min="1"
                        max="19"
                      />
                      <Form.Text className="text-muted">
                        Alert when QR code reaches this many transactions (max 20/day)
                      </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Require Payment Confirmation for UPI"
                        checked={paymentSettings.requirePaymentConfirmation}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          requirePaymentConfirmation: e.target.checked
                        })}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
              <Alert variant="info" className="mt-3">
                <FaCreditCard className="me-2" />
                <strong>Note:</strong> UPI QR codes have a daily limit of 20 transactions per account.
                Monitor usage in the Payment Report section.
              </Alert>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
              <Button
                variant="outline-secondary"
                onClick={() => handleReset('payment')}
              >
                <FaUndo /> Reset
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSave('Payment')}
                disabled={loading}
              >
                <FaSave /> Save Payment Settings
              </Button>
            </Card.Footer>
          </Card>
        </Tab>

        <Tab eventKey="backup" title={<><FaDatabase /> Backup</>}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Backup & Data Management</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Enable Auto Backup"
                        checked={backupSettings.autoBackup}
                        onChange={(e) => setBackupSettings({
                          ...backupSettings,
                          autoBackup: e.target.checked
                        })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Backup Frequency</Form.Label>
                      <Form.Select
                        value={backupSettings.backupFrequency}
                        onChange={(e) => setBackupSettings({
                          ...backupSettings,
                          backupFrequency: e.target.value
                        })}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Backup Location</Form.Label>
                      <Form.Select
                        value={backupSettings.backupLocation}
                        onChange={(e) => setBackupSettings({
                          ...backupSettings,
                          backupLocation: e.target.value
                        })}
                      >
                        <option value="local">Local Storage</option>
                        <option value="cloud">Cloud Storage</option>
                        <option value="both">Both</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Keep Backups For (Days)</Form.Label>
                      <Form.Control
                        type="number"
                        value={backupSettings.keepBackupDays}
                        onChange={(e) => setBackupSettings({
                          ...backupSettings,
                          keepBackupDays: parseInt(e.target.value)
                        })}
                        min="1"
                        max="365"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
              
              <div className="mt-4">
                <h6>Manual Backup Actions</h6>
                <div className="d-flex gap-2 mt-2">
                  <Button variant="outline-primary">
                    <FaDatabase /> Backup Now
                  </Button>
                  <Button variant="outline-success">
                    Export to Excel
                  </Button>
                  <Button variant="outline-info">
                    Export to PDF
                  </Button>
                  <Button variant="outline-warning">
                    Restore from Backup
                  </Button>
                </div>
              </div>
              
              <Alert variant="warning" className="mt-4">
                <strong>Important:</strong> Regular backups protect your data.
                Recommended to keep at least 30 days of backup data.
              </Alert>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
              <Button
                variant="outline-secondary"
                onClick={() => handleReset('backup')}
              >
                <FaUndo /> Reset
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSave('Backup')}
                disabled={loading}
              >
                <FaSave /> Save Backup Settings
              </Button>
            </Card.Footer>
          </Card>
        </Tab>

        <Tab eventKey="security" title={<><FaKey /> Security</>}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Security Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Require Password for Access"
                        checked={securitySettings.requirePassword}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          requirePassword: e.target.checked
                        })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Session Timeout (Minutes)</Form.Label>
                      <Form.Control
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          sessionTimeout: parseInt(e.target.value)
                        })}
                        min="5"
                        max="240"
                      />
                      <Form.Text className="text-muted">
                        Automatic logout after inactivity
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Log All Activities"
                        checked={securitySettings.logActivities}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          logActivities: e.target.checked
                        })}
                      />
                      <Form.Text className="text-muted">
                        Record all billing and management activities
                      </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Change Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter new password"
                        className="mb-2"
                      />
                      <Form.Control
                        type="password"
                        placeholder="Confirm new password"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
              
              <Alert variant="info" className="mt-4">
                <FaKey className="me-2" />
                <strong>Security Best Practices:</strong>
                <ul className="mb-0 mt-2">
                  <li>Use a strong password</li>
                  <li>Change password regularly</li>
                  <li>Log out when not using the system</li>
                  <li>Keep backups in secure location</li>
                </ul>
              </Alert>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
              <Button
                variant="outline-secondary"
                onClick={() => handleReset('security')}
              >
                <FaUndo /> Reset
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSave('Security')}
                disabled={loading}
              >
                <FaSave /> Save Security Settings
              </Button>
            </Card.Footer>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Settings;