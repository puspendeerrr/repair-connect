import axios from 'axios';

let API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (API_BASE && !API_BASE.endsWith('/api')) {
  if (API_BASE.endsWith('/')) {
    API_BASE = API_BASE.slice(0, -1);
  }
  API_BASE += '/api';
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Auth
export const sendOtp = (email) => api.post('/auth/send-otp', { email });
export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const registerUser = (data, tempToken) => api.post('/auth/register', data, {
  headers: { Authorization: `Bearer ${tempToken}` }
});
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// Users
export const getUsers = (params) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.patch(`/users/${id}`, data);
export const toggleUserActive = (id) => api.patch(`/users/${id}/toggle-active`);
export const verifyProvider = (id) => api.patch(`/users/${id}/verify-provider`);

// Requests
export const createRequest = (data) => api.post('/requests', data);
export const getRequests = (params) => api.get('/requests', { params });
export const getRequest = (id) => api.get(`/requests/${id}`);
export const updateRequest = (id, data) => api.patch(`/requests/${id}`, data);

// Quotes
export const submitQuote = (requestId, data) => api.post(`/requests/${requestId}/quotes`, data);
export const getRequestQuotes = (requestId) => api.get(`/requests/${requestId}/quotes`);
export const getMyQuotes = (params) => api.get('/quotes/my', { params });
export const acceptQuote = (quoteId) => api.patch(`/quotes/${quoteId}/accept`);

// Bookings
export const getBookings = (params) => api.get('/bookings', { params });
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const updateBooking = (id, data) => api.patch(`/bookings/${id}`, data);

// Messages
export const getMessages = (bookingId) => api.get(`/messages/${bookingId}`);
export const sendMessage = (bookingId, data) => api.post(`/messages/${bookingId}`, data);
export const markMessagesRead = (bookingId) => api.patch(`/messages/${bookingId}/read`);

// Reviews
export const createReview = (data) => api.post('/reviews', data);
export const getUserReviews = (userId) => api.get(`/reviews/${userId}`);

// Payments
export const createPaymentOrder = (data) => api.post('/payments/create-order', data);
export const verifyPayment = (data) => api.post('/payments/verify', data);

// Notifications
export const getNotifications = (params) => api.get('/notifications', { params });
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');

// Upload
export const uploadImage = (formData) =>
  api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const uploadMultipleImages = (formData) =>
  api.post('/upload/multiple', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export default api;
