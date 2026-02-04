import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Layout Components
import Navbar from './components/shared/Navbar';

// Page Components
import Home from './pages/Dashboard';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

// Billing Components
import TypeBasedBilling from './components/billing/TypeBasedBilling';
import ImageBasedBilling from './components/billing/ImageBasedBilling';

// Management Components
import ItemManagement from './components/items/ItemManagement';

// Reports Component
import ReportsPage from './components/reports/Reports';

// QR Codes Component
import QRCodes from './components/qrcodes/QRCodes';

// Daily Closing Component
import DailyClosing from './components/closing/DailyClosing';

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        <Navbar />
        
        <div className="container-fluid mt-4">
          <Routes>
            {/* Default route */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            
            {/* Home & Dashboard */}
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Billing Routes */}
            <Route path="/billing/type" element={<TypeBasedBilling />} />
            <Route path="/billing/image" element={<ImageBasedBilling />} />
            
            {/* Management Routes */}
            <Route path="/items" element={<ItemManagement />} />
            
            {/* Reports Route */}
            <Route path="/reports" element={<ReportsPage />} />
            
            {/* QR Codes Route */}
            <Route path="/qrcodes" element={<QRCodes />} />
            
            {/* Daily Closing Route */}
            <Route path="/daily-closing" element={<DailyClosing />} />
            
            {/* Settings Route */}
            <Route path="/settings" element={<Settings />} />
            
            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;