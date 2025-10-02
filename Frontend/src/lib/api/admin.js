import api from "./client";

// Dashboard
export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

// Users
export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const response = await api.get(`/admin/users?${params}`);
  return response.data;
};

export const updateUserStatus = async (userId, isActive) => {
  const response = await api.put(`/admin/users/${userId}/status`, { isActive });
  return response.data;
};

export const updateUserVerification = async (userId, isVerified) => {
  const response = await api.put(`/admin/users/${userId}/verify`, { isVerified });
  return response.data;
};

export const makeUserAdmin = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/make-admin`);
  return response.data;
};

// Claims
export const getClaims = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const response = await api.get(`/admin/claims?${params}`);
  return response.data;
};

export const verifyClaim = async (claimId, status, verificationNotes = '') => {
  const response = await api.put(`/admin/claims/${claimId}/verify`, {
    status,
    verificationNotes
  });
  return response.data;
};

// Donations
export const getDonations = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const response = await api.get(`/admin/donations?${params}`);
  return response.data;
};

// Receipts
export const getPendingReceipts = async () => {
  const response = await api.get('/admin/receipts/pending');
  return response.data;
};

export const updateReceiptStatus = async (receiptId, status, rejectionReason = '') => {
  const response = await api.put(`/admin/receipts/${receiptId}/status`, {
    status,
    rejectionReason
  });
  return response.data;
};

// Subscriptions
export const getPendingSubscriptions = async () => {
  const response = await api.get('/admin/subscriptions/pending');
  return response.data;
};

export const verifyManualSubscription = async (subscriptionId, status, verificationNotes = '') => {
  const response = await api.put(`/admin/subscriptions/${subscriptionId}/verify`, {
    status,
    verificationNotes
  });
  return response.data;
};

// Donation Caps
export const getDonationCaps = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const response = await api.get(`/admin/donation-caps?${params}`);
  return response.data;
};

export const updateDonationCap = async (claimType, capAmount, monthYear) => {
  const response = await api.put(`/admin/donation-caps/${claimType}`, {
    capAmount,
    monthYear
  });
  return response.data;
};

// Donation Queue
export const getDonationQueue = async () => {
  const response = await api.get('/admin/donation-queue');
  return response.data;
};

// System Config
export const getAppConfig = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const response = await api.get(`/admin/config?${params}`);
  return response.data;
};

export const updateAppConfig = async (key, value) => {
  const response = await api.put(`/admin/config/${key}`, { value });
  return response.data;
};

// Audit Logs
export const getAuditLogs = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const response = await api.get(`/admin/logs?${params}`);
  return response.data;
};

// Export all functions for easier imports
export default {
  // Dashboard
  getAdminDashboard,
  
  // Users
  getUsers,
  updateUserStatus,
  updateUserVerification,
  makeUserAdmin,
  
  // Claims
  getClaims,
  verifyClaim,
  
  // Donations
  getDonations,
  
  // Receipts
  getPendingReceipts,
  updateReceiptStatus,
  
  // Subscriptions
  getPendingSubscriptions,
  verifyManualSubscription,
  
  // Donation Caps
  getDonationCaps,
  updateDonationCap,
  
  // Donation Queue
  getDonationQueue,
  
  // System Config
  getAppConfig,
  updateAppConfig,
  
  // Audit Logs
  getAuditLogs
};