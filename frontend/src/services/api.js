import axios from 'axios';

// Use environment variable for backend URL
const API_BASE_URL = process.env.REACT_APP_BACKEND_API || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Items API
api.getItems = () => api.get('/items');
api.createItem = (formData) => {
  return api.post('/items', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
api.updateItem = (id, formData) => {
  return api.put(`/items/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
api.deleteItem = (id) => api.delete(`/items/${id}`);

// Bills API
api.createBill = (billData) => api.post('/bills', billData);
api.updateBill = (id, data) => api.put(`/bills/${id}`, data);
api.getBills = (params) => api.get('/bills', { params });
api.getTodayBills = () => api.get('/bills/today');
api.getBillsByDateRange = (startDate, endDate) => 
  api.get('/bills/date-range', { params: { startDate, endDate } });

// Reports API
api.getItemWiseReport = (params) => api.get('/reports/item-wise', { params });
api.getDailyReport = (params) => api.get('/reports/daily', { params });
api.getWeeklyReport = (params) => api.get('/reports/weekly', { params });
api.getMonthlyReport = (params) => api.get('/reports/monthly', { params });
api.getPaymentReport = (params) => api.get('/reports/payment-method', { params });

// QR Codes API
api.getQRCodes = () => api.get('/qrcodes');

// Daily Closing API
api.getDailyClosing = (params) => api.get('/daily-closing', { params });
api.closeDay = (data) => api.post('/daily-closing/close', data);

export default api;