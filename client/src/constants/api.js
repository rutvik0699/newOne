export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  ITEMS: {
    BASE: '/items',
    BY_ID: (id) => `/items/${id}`,
  },
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id) => `/orders/${id}`,
    FILTER_BY_DATE: '/orders/filter/by-date',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ORDERS: '/dashboard/recent-orders',
    MONTHLY_REVENUE: '/dashboard/monthly-revenue',
    ORDER_STATUS: '/dashboard/order-status',
  },
};

export const ORDER_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};
