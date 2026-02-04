import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome, FaChartBar, FaSearch, FaImages,
  FaBox, FaFileAlt, FaQrcode, FaLock, FaCog
} from 'react-icons/fa';

const Sidebar = () => {
  const navItems = [
    {
      path: '/home',
      icon: <FaHome />,
      label: 'Home',
      exact: true
    },
    {
      path: '/dashboard',
      icon: <FaChartBar />,
      label: 'Dashboard'
    },
    {
      path: '/billing/type',
      icon: <FaSearch />,
      label: 'Type Billing'
    },
    {
      path: '/billing/image',
      icon: <FaImages />,
      label: 'Image Billing'
    },
    {
      path: '/items',
      icon: <FaBox />,
      label: 'Items'
    },
    {
      path: '/reports',
      icon: <FaFileAlt />,
      label: 'Reports'
    },
    {
      path: '/qrcodes',
      icon: <FaQrcode />,
      label: 'QR Codes'
    },
    {
      path: '/daily-closing',
      icon: <FaLock />,
      label: 'Daily Closing'
    },
    {
      path: '/settings',
      icon: <FaCog />,
      label: 'Settings'
    }
  ];

  return (
    <div className="sidebar d-flex flex-column flex-shrink-0 p-3 bg-light">
      <div className="sidebar-header mb-4">
        <h5 className="text-center mb-3">📦 Pooja Store</h5>
        <hr className="my-2" />
      </div>
      
      <ul className="nav nav-pills flex-column mb-auto">
        {navItems.map((item) => (
          <li className="nav-item" key={item.path}>
            <NavLink
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : 'link-dark'} d-flex align-items-center gap-2`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      
      <div className="mt-auto pt-3 border-top">
        <div className="text-center text-muted small">
          <div>🕉️ शुभं भवतु 🕉️</div>
          <small>Pooja Store Pro v1.0</small>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;