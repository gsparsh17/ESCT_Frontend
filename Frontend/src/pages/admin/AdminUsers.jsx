import { useState, useEffect } from 'react';
import { 
  FaEdit, 
  FaToggleOn, 
  FaToggleOff, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSearch,
  FaUserShield,
  FaKey,
  FaEye,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import { 
  getUsers, 
  updateUserStatus, 
  updateUserVerification, 
  makeUserAdmin, 
  resetUserPassword 
} from '../../lib/api/admin';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor = 'bg-red-600' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <FaExclamationTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 ${confirmColor} text-white rounded-lg hover:opacity-90 transition-opacity`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reset Password Modal Component
const ResetPasswordModal = ({ isOpen, onClose, onConfirm, userName }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm(newPassword);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            Reset password for <span className="font-semibold">{userName}</span>
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!newPassword || !confirmPassword}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Personal Information</h4>
              
              <div className="flex items-center space-x-4">
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.personalDetails?.fullName || 'User')}&background=0D9488&color=fff`}
                  alt={user.personalDetails?.fullName}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.personalDetails?.fullName || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{user.userType}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <p className="text-sm text-gray-900">{user.personalDetails?.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Phone:</span>
                  <p className="text-sm text-gray-900">{user.personalDetails?.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Gender:</span>
                  <p className="text-sm text-gray-900">{user.personalDetails?.sex || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Account Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Account Information</h4>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">User ID:</span>
                  <p className="text-sm text-gray-900">{user.ehrmsCode || user.pensionerNumber}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Member Since:</span>
                  <p className="text-sm text-gray-900">
                    {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Verified:</span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.isVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Admin:</span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isAdmin ? 'Administrator' : 'User'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bank Details */}
          {user.bankDetails && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Account Holder:</span>
                  <p className="text-sm text-gray-900">{user.bankDetails.accountHolderName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Account Number:</span>
                  <p className="text-sm text-gray-900">{user.bankDetails.accountNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Bank Name:</span>
                  <p className="text-sm text-gray-900">{user.bankDetails.bankName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">IFSC Code:</span>
                  <p className="text-sm text-gray-900">{user.bankDetails.ifscCode || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    userType: '',
    isVerified: '',
    isActive: ''
  });
  const [actionLoading, setActionLoading] = useState(null);
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showVerificationConfirm, setShowVerificationConfirm] = useState(false);
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers(filters);
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Action handlers with confirmation modals
  const handleStatusToggle = async (user, newStatus) => {
    try {
      setActionLoading(`status-${user._id}`);
      await updateUserStatus(user._id, newStatus);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
      setShowStatusConfirm(false);
      setSelectedUser(null);
    }
  };

  const handleVerificationToggle = async (user, newStatus) => {
    try {
      setActionLoading(`verify-${user._id}`);
      await updateUserVerification(user._id, newStatus);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update verification status');
    } finally {
      setActionLoading(null);
      setShowVerificationConfirm(false);
      setSelectedUser(null);
    }
  };

  const handleMakeAdmin = async (user, newStatus) => {
    try {
      setActionLoading(`admin-${user._id}`);
      await makeUserAdmin(user._id, newStatus);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update admin status');
    } finally {
      setActionLoading(null);
      setShowAdminConfirm(false);
      setSelectedUser(null);
    }
  };

  const handleResetPassword = async (password) => {
    try {
      setActionLoading(`password-${selectedUser._id}`);
      await resetUserPassword(selectedUser._id, password);
      setError(null);
      // Show success message
      setError({ type: 'success', message: 'Password reset successfully' });
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to reset password' });
    } finally {
      setActionLoading(null);
      setShowResetPassword(false);
      setSelectedUser(null);
    }
  };

  // Modal open handlers
  const openStatusConfirm = (user) => {
    setSelectedUser(user);
    setShowStatusConfirm(true);
  };

  const openVerificationConfirm = (user) => {
    setSelectedUser(user);
    setShowVerificationConfirm(true);
  };

  const openAdminConfirm = (user) => {
    setSelectedUser(user);
    setShowAdminConfirm(true);
  };

  const openResetPassword = (user) => {
    setSelectedUser(user);
    setShowResetPassword(true);
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      userType: '',
      isVerified: '',
      isActive: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, EHRMS, or phone..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Type
            </label>
            <select
              value={filters.userType}
              onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Types</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="PENSIONER">Pensioner</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification
            </label>
            <select
              value={filters.isVerified}
              onChange={(e) => setFilters(prev => ({ ...prev, isVerified: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All</option>
              <option value="true">Verified</option>
              <option value="false">Not Verified</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            Showing {users.users?.length || 0} of {users.total || 0} users
          </span>
          <button
            onClick={clearFilters}
            className="text-sm text-teal-600 hover:text-teal-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className={`border rounded-lg p-4 ${
          error.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {error.type === 'success' ? (
                <FaCheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <FaExclamationTriangle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <p>{error.message || error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-sm hover:opacity-70"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.users?.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.personalDetails?.fullName || 'User')}&background=0D9488&color=fff`}
                              alt={user.personalDetails?.fullName}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.personalDetails?.fullName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.ehrmsCode || user.pensionerNumber} • {user.userType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{user.personalDetails?.phone || 'N/A'}</div>
                        <div className="text-gray-500">{user.personalDetails?.email || 'No email'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openStatusConfirm(user)}
                          disabled={actionLoading === `status-${user._id}`}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } disabled:opacity-50 transition-colors`}
                        >
                          {actionLoading === `status-${user._id}` ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                          ) : user.isActive ? (
                            <>
                              <FaToggleOn className="mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <FaToggleOff className="mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openVerificationConfirm(user)}
                          disabled={actionLoading === `verify-${user._id}`}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.isVerified
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          } disabled:opacity-50 transition-colors`}
                        >
                          {actionLoading === `verify-${user._id}` ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                          ) : user.isVerified ? (
                            <>
                              <FaCheckCircle className="mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="mr-1" />
                              Not Verified
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openAdminConfirm(user)}
                          disabled={actionLoading === `admin-${user._id}`}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.isAdmin
                              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          } disabled:opacity-50 transition-colors`}
                        >
                          {actionLoading === `admin-${user._id}` ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                          ) : user.isAdmin ? (
                            <>
                              <FaUserShield className="mr-1" />
                              Admin
                            </>
                          ) : (
                            <>
                              <FaUserShield className="mr-1" />
                              User
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openResetPassword(user)}
                          disabled={actionLoading === `password-${user._id}`}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50 transition-colors p-1"
                          title="Reset Password"
                        >
                          <FaKey className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openUserDetails(user)}
                          className="text-teal-600 hover:text-teal-900 transition-colors p-1"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 transition-colors p-1"
                          title="Edit User"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {users.totalPages > 1 && (
              <div className="bg-white px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {users.currentPage} of {users.totalPages} • {users.total} total users
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={filters.page === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={filters.page >= users.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showStatusConfirm}
        onClose={() => setShowStatusConfirm(false)}
        onConfirm={() => handleStatusToggle(selectedUser, !selectedUser?.isActive)}
        title={selectedUser?.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${selectedUser?.isActive ? 'deactivate' : 'activate'} ${selectedUser?.personalDetails?.fullName}? ${selectedUser?.isActive ? 'The user will not be able to access their account.' : 'The user will be able to access their account again.'}`}
        confirmText={selectedUser?.isActive ? 'Deactivate' : 'Activate'}
        confirmColor={selectedUser?.isActive ? 'bg-red-600' : 'bg-green-600'}
      />

      <ConfirmationModal
        isOpen={showVerificationConfirm}
        onClose={() => setShowVerificationConfirm(false)}
        onConfirm={() => handleVerificationToggle(selectedUser, !selectedUser?.isVerified)}
        title={selectedUser?.isVerified ? 'Unverify User' : 'Verify User'}
        message={`Are you sure you want to ${selectedUser?.isVerified ? 'unverify' : 'verify'} ${selectedUser?.personalDetails?.fullName}? ${selectedUser?.isVerified ? 'The user will need to be verified again to access certain features.' : 'The user will gain access to all platform features.'}`}
        confirmText={selectedUser?.isVerified ? 'Unverify' : 'Verify'}
        confirmColor={selectedUser?.isVerified ? 'bg-yellow-600' : 'bg-green-600'}
      />

      <ConfirmationModal
        isOpen={showAdminConfirm}
        onClose={() => setShowAdminConfirm(false)}
        onConfirm={() => handleMakeAdmin(selectedUser, !selectedUser?.isAdmin)}
        title={selectedUser?.isAdmin ? 'Remove Admin Privileges' : 'Grant Admin Privileges'}
        message={`Are you sure you want to ${selectedUser?.isAdmin ? 'remove admin privileges from' : 'grant admin privileges to'} ${selectedUser?.personalDetails?.fullName}? ${selectedUser?.isAdmin ? 'They will lose access to the admin panel.' : 'They will gain full access to the admin panel and system management.'}`}
        confirmText={selectedUser?.isAdmin ? 'Remove Admin' : 'Make Admin'}
        confirmColor="bg-purple-600"
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
        onConfirm={handleResetPassword}
        userName={selectedUser?.personalDetails?.fullName}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showUserDetails}
        onClose={() => setShowUserDetails(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default AdminUsers;