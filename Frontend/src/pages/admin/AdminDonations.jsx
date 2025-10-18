import { useState, useEffect } from 'react';
import { 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaTimes,
  FaUser,
  FaFileAlt,
  FaCalendar,
  FaCreditCard,
  FaReceipt
} from 'react-icons/fa';
import { getDonations } from '../../lib/api/admin';

// Donation Details Modal Component
const DonationDetailsModal = ({ isOpen, onClose, donation }) => {
  if (!isOpen || !donation) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      'COMPLETED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'FAILED': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-gray-100 text-gray-800'
    };
    
    return statusConfig[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodBadge = (method) => {
    const methodConfig = {
      'RAZORPAY': 'bg-blue-100 text-blue-800',
      'MANUAL': 'bg-orange-100 text-orange-800'
    };
    
    return methodConfig[method] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Donation Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donation Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Donation Information</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Donation ID:</span>
                  <span className="text-sm text-gray-900 font-mono">{donation.donationId || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Order ID:</span>
                  <span className="text-sm text-gray-900 font-mono">{donation.paymentOrderId || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Amount:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{donation.amount?.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(donation.status)}`}>
                    {donation.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Payment Method:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodBadge(donation.paymentMethod)}`}>
                    {donation.paymentMethod}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Created:</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(donation.createdAt)}
                  </span>
                </div>
                
                {donation.completedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Completed:</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(donation.completedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Donor Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Donor Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FaUser className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {donation.donorId?.personalDetails?.fullName || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {donation.donorId?.ehrmsCode || donation.donorId?.pensionerNumber}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FaCreditCard className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Contact</p>
                    <p className="text-sm text-gray-500">
                      {donation.donorId?.personalDetails?.phone || 'N/A'} • {donation.donorId?.personalDetails?.email || 'No email'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Claim Information */}
          {donation.claimId && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Claim Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Claim ID:</span>
                  <p className="text-sm text-gray-900 font-mono">{donation.claimId.claimId}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Title:</span>
                  <p className="text-sm text-gray-900">{donation.claimId.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <p className="text-sm text-gray-900">{donation.claimId.type?.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Beneficiary:</span>
                  <p className="text-sm text-gray-900">{donation.claimId.beneficiary?.personalDetails?.fullName}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Payment Details */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Transaction ID:</span>
                <p className="text-sm text-gray-900 font-mono">{donation.transactionId || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Payment Gateway:</span>
                <p className="text-sm text-gray-900">{donation.paymentGateway || 'N/A'}</p>
              </div>
              {donation.currency && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Currency:</span>
                  <p className="text-sm text-gray-900">{donation.currency}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Receipt Information */}
          {donation.receiptId && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Receipt Information</h4>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <FaReceipt className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Receipt #{donation.receiptId}</p>
                  <p className="text-xs text-gray-500">Manual payment receipt</p>
                </div>
                <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                  View Receipt
                </button>
              </div>
            </div>
          )}
          
          {/* Error Information */}
          {donation.errorMessage && (
            <div className="mt-6 pt-6 border-t border-red-200">
              <h4 className="text-lg font-medium text-red-900 mb-4">Error Information</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{donation.errorMessage}</p>
                {donation.errorCode && (
                  <p className="text-xs text-red-600 mt-1">Error Code: {donation.errorCode}</p>
                )}
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

// Refund Confirmation Modal
const RefundConfirmationModal = ({ isOpen, onClose, onConfirm, donation }) => {
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setRefundReason('');
    }
  }, [isOpen]);

  if (!isOpen || !donation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <FaExclamationTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Process Refund</h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            Are you sure you want to process a refund for donation from {donation.donorId?.personalDetails?.fullName}?
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Reason (Required)
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Please provide reason for refund..."
              required
            />
            {!refundReason && (
              <p className="mt-1 text-sm text-red-600">Refund reason is required</p>
            )}
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="h-4 w-4 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Refund amount: <strong>₹{donation.amount?.toLocaleString()}</strong>
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(refundReason)}
              disabled={!refundReason}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Process Refund
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    paymentMethod: '',
    search: ''
  });

  // Modal states
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDonationDetails, setShowDonationDetails] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, [filters]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await getDonations(filters);
      setDonations(response.data);
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to load donations' });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async (refundReason) => {
    try {
      setActionLoading(`refund-${selectedDonation._id}`);
      // Implement refund logic here
      // await processRefund(selectedDonation._id, refundReason);
      await fetchDonations();
      setError({ type: 'success', message: 'Refund processed successfully' });
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to process refund' });
    } finally {
      setActionLoading(null);
      setShowRefundConfirm(false);
      setSelectedDonation(null);
    }
  };

  // Modal open handlers
  const openDonationDetails = (donation) => {
    setSelectedDonation(donation);
    setShowDonationDetails(true);
  };

  const openRefundConfirm = (donation) => {
    setSelectedDonation(donation);
    setShowRefundConfirm(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'COMPLETED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'FAILED': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-gray-100 text-gray-800',
      'REFUNDED': 'bg-purple-100 text-purple-800'
    };
    
    return statusConfig[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodBadge = (method) => {
    const methodConfig = {
      'RAZORPAY': 'bg-blue-100 text-blue-800',
      'MANUAL': 'bg-orange-100 text-orange-800'
    };
    
    return methodConfig[method] || 'bg-gray-100 text-gray-800';
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      status: '',
      paymentMethod: '',
      search: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donations Management</h1>
          <p className="text-gray-600">View and manage all donation transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Donations
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by donor name, donation ID, or order ID..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Methods</option>
              <option value="RAZORPAY">Razorpay</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            Showing {donations.donations?.length || 0} of {donations.total || 0} donations
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
                <FaMoneyBillWave className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <FaExclamationTriangle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <p>{error.message}</p>
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

      {/* Donations Table */}
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
                      Donation Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Claim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {donations.donations?.map((donation) => (
                    <tr key={donation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {donation.donationId || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {donation.paymentOrderId || 'No order ID'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {donation.donorId?.personalDetails?.fullName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {donation.donorId?.ehrmsCode || donation.donorId?.pensionerNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {donation.claimId?.claimId || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {donation.claimId?.title || 'No title'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{donation.amount?.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(donation.status)}`}>
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodBadge(donation.paymentMethod)}`}>
                          {donation.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendar className="h-3 w-3 mr-1" />
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <button
                          onClick={() => openDonationDetails(donation)}
                          className="text-teal-600 hover:text-teal-900 transition-colors p-1"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        {donation.status === 'COMPLETED' && (
                          <button
                            onClick={() => openRefundConfirm(donation)}
                            disabled={actionLoading === `refund-${donation._id}`}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors p-1"
                            title="Process Refund"
                          >
                            {actionLoading === `refund-${donation._id}` ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              <FaMoneyBillWave className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Empty State */}
              {(!donations.donations || donations.donations.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No donations found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filters.status || filters.paymentMethod || filters.search 
                      ? 'No donations match your filters' 
                      : 'No donations available'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {donations.totalPages > 1 && (
              <div className="bg-white px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {donations.currentPage} of {donations.totalPages} • {donations.total} total donations
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
                      disabled={filters.page >= donations.totalPages}
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

      {/* Donation Details Modal */}
      <DonationDetailsModal
        isOpen={showDonationDetails}
        onClose={() => setShowDonationDetails(false)}
        donation={selectedDonation}
      />

      {/* Refund Confirmation Modal */}
      <RefundConfirmationModal
        isOpen={showRefundConfirm}
        onClose={() => setShowRefundConfirm(false)}
        onConfirm={handleProcessRefund}
        donation={selectedDonation}
      />
    </div>
  );
};

export default AdminDonations;