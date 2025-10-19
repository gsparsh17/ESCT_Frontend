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

export const getUser = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
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

export const makeUserAdmin = async (userId, isAdmin = true) => {
  const response = await api.put(`/admin/users/${userId}/make-admin`, { isAdmin });
  return response.data;
};

export const resetUserPassword = async (userId, newPassword) => {
  const response = await api.put(`/admin/users/${userId}/reset-password`, { newPassword });
  return response.data;
};

// User Details Management
export const updateUserDetails = async (userId, updateData) => {
  const response = await api.put(`/admin/users/${userId}/details`, updateData);
  return response.data;
};

// User Documents Management
export const updateUserDocuments = async (userId, formData) => {
  const response = await api.put(`/admin/users/${userId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getUserDocuments = async (userId) => {
  const response = await api.get(`/admin/users/${userId}/documents`);
  return response.data;
};

// ==================== NOMINEE MANAGEMENT ====================

// Get all nominees for a user
export const getUserNominees = async (userId) => {
  const response = await api.get(`/admin/users/${userId}/nominees`);
  return response.data;
};

// Create or update nominee
export const createOrUpdateNominee = async (userId, nomineeData) => {
  const response = await api.post(`/admin/users/${userId}/nominees`, nomineeData);
  return response.data;
};

// Delete nominee
export const deleteNominee = async (userId, nomineeId) => {
  const response = await api.delete(`/admin/users/${userId}/nominees/${nomineeId}`);
  return response.data;
};

// Update nominee documents
export const updateNomineeDocuments = async (userId, nomineeId, formData) => {
  const response = await api.put(`/admin/users/${userId}/nominees/${nomineeId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Set primary nominee
export const setPrimaryNominee = async (userId, nomineeId) => {
  const response = await api.put(`/admin/users/${userId}/nominees/${nomineeId}/primary`);
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

export const verifyManualSubscription = async (subscriptionId, status, rejectionReason = '') => {
  const response = await api.put(`/admin/subscriptions/${subscriptionId}/verify`, {
    status,
    rejectionReason
  });
  return response.data;
};

// Donation Caps
export const getDonationCaps = async (monthYear = null) => {
  const params = new URLSearchParams();
  if (monthYear) params.append('monthYear', monthYear);
  
  const response = await api.get(`/admin/donation-caps?${params}`);
  return response.data;
};

export const updateDonationCap = async (claimType, capAmount, monthYear) => {
  const response = await api.put(`/admin/donation-caps/${claimType}`, {
    capAmount: Number(capAmount),
    monthYear
  });
  return response.data;
};

export const getDonationCapHistory = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const response = await api.get(`/admin/donation-caps/history?${params}`);
  return response.data;
};

// Donation Queue
export const getDonationQueue = async () => {
  const response = await api.get('/admin/donation-queue');
  return response.data;
};

// System Config
export const getAppConfig = async () => {
  const response = await api.get('/admin/config');
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

// ==================== GALLERY MANAGEMENT ====================

export const uploadGalleryPhoto = async (formData) => {
  const response = await api.post('/admin/gallery', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getGalleryPhotos = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const response = await api.get(`/admin/gallery?${params}`);
  return response.data;
};

export const updateGalleryStatus = async (galleryId, isActive) => {
  const response = await api.put(`/admin/gallery/${galleryId}/status`, { isActive });
  return response.data;
};

export const deleteGalleryPhoto = async (galleryId) => {
  const response = await api.delete(`/admin/gallery/${galleryId}`);
  return response.data;
};

// ==================== NEWS & BLOG MANAGEMENT ====================

export const createNewsBlog = async (formData) => {
  const response = await api.post('/admin/news', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getNewsBlogs = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const response = await api.get(`/admin/news?${params}`);
  return response.data;
};

export const updateNewsBlog = async (newsId, formData) => {
  const response = await api.put(`/admin/news/${newsId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteNewsBlog = async (newsId) => {
  const response = await api.delete(`/admin/news/${newsId}`);
  return response.data;
};

export const toggleNewsPublish = async (newsId, isPublished) => {
  const response = await api.put(`/admin/news/${newsId}/publish`, { isPublished });
  return response.data;
};

// ==================== HELPER FUNCTIONS ====================

// Helper function to create form data for file uploads
export const createFormData = (data, fileFieldName = null, file = null) => {
  const formData = new FormData();
  
  // Append all data fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // Handle arrays (like tags)
        value.forEach(item => formData.append(key, item));
      } else if (typeof value === 'object' && !(value instanceof File)) {
        // Handle nested objects by stringifying
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  });
  
  // Append file if provided
  if (file && fileFieldName) {
    formData.append(fileFieldName, file);
  }
  
  return formData;
};

// Helper for user document upload
export const uploadUserDocument = async (userId, documentType, action, file = null) => {
  const formData = new FormData();
  formData.append('documentType', documentType);
  formData.append('action', action);
  if (file) {
    formData.append('document', file);
  }
  
  return await updateUserDocuments(userId, formData);
};

// Helper for nominee document upload
export const uploadNomineeDocument = async (userId, nomineeId, documentType, file) => {
  const formData = new FormData();
  formData.append('documentType', documentType);
  formData.append('action', 'update');
  formData.append('document', file);
  
  return await updateNomineeDocuments(userId, nomineeId, formData);
};

// Helper for gallery upload
export const uploadGalleryWithData = async (galleryData, imageFile) => {
  const formData = createFormData(galleryData, 'profilePhoto', imageFile);
  return await uploadGalleryPhoto(formData);
};

// Helper for news blog creation/update
export const createNewsWithData = async (newsData, imageFile) => {
  const formData = createFormData(newsData, 'profilePhoto', imageFile);
  return await createNewsBlog(formData);
};

export const updateNewsWithData = async (newsId, newsData, imageFile) => {
  const formData = createFormData(newsData, 'profilePhoto', imageFile);
  return await updateNewsBlog(newsId, formData);
};

// Export all functions for easier imports
export default {
  // Dashboard
  getAdminDashboard,
  
  // Users
  getUsers,
  getUser,
  updateUserStatus,
  updateUserVerification,
  makeUserAdmin,
  resetUserPassword,
  updateUserDetails,
  updateUserDocuments,
  getUserDocuments,
  
  // Nominee Management
  getUserNominees,
  createOrUpdateNominee,
  deleteNominee,
  updateNomineeDocuments,
  setPrimaryNominee,
  
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
  getDonationCapHistory,
  
  // Donation Queue
  getDonationQueue,
  
  // System Config
  getAppConfig,
  updateAppConfig,
  
  // Audit Logs
  getAuditLogs,
  
  // Gallery Management
  uploadGalleryPhoto,
  getGalleryPhotos,
  updateGalleryStatus,
  deleteGalleryPhoto,
  uploadGalleryWithData,
  
  // News & Blog Management
  createNewsBlog,
  getNewsBlogs,
  updateNewsBlog,
  deleteNewsBlog,
  toggleNewsPublish,
  createNewsWithData,
  updateNewsWithData,
  
  // Helper functions
  createFormData,
  uploadUserDocument,
  uploadNomineeDocument
};