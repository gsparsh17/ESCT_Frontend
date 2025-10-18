import { useState, useEffect } from 'react';
import { 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaClock,
  FaExclamationTriangle,
  FaTimes as FaClose,
  FaUser,
  FaMoneyBillWave,
  FaCalendar,
  FaFileAlt
} from 'react-icons/fa';
import { verifyClaim, getClaims } from '../../lib/api/admin';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor = 'bg-red-600', notes, onNotesChange }) => {
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
          
          <p className="text-gray-600 mb-4">{message}</p>

          {notes !== undefined && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Notes {confirmText === 'Reject' && '(Required)'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={confirmText === 'Reject' ? 'Please provide reason for rejection...' : 'Add verification notes (optional)...'}
                required={confirmText === 'Reject'}
              />
              {confirmText === 'Reject' && !notes && (
                <p className="mt-1 text-sm text-red-600">Rejection reason is required</p>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={confirmText === 'Reject' && !notes}
              className={`px-4 py-2 ${confirmColor} text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Claim Details Modal Component
const ClaimDetailsModal = ({ isOpen, onClose, claim }) => {
  if (!isOpen || !claim) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending Verification': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Fully Funded': 'bg-blue-100 text-blue-800'
    };
    
    return statusConfig[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      'Death During Service': 'bg-red-100 text-red-800',
      'Death After Service': 'bg-orange-100 text-orange-800',
      'Retirement Farewell': 'bg-blue-100 text-blue-800',
      "Daughter's Marriage": 'bg-purple-100 text-purple-800',
      'Medical Claim': 'bg-green-100 text-green-800'
    };
    
    return typeConfig[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 m-0">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Claim Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaClose className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Claim Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Claim Information</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Claim ID:</span>
                  <span className="text-sm text-gray-900">{claim.claimId}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(claim.type)}`}>
                    {claim.type?.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(claim.status)}`}>
                    {claim.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Amount Requested:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{claim.amountRequested?.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Amount Raised:</span>
                  <span className="text-sm text-gray-900">
                    ₹{claim.amountRaised?.toLocaleString() || '0'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Created:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Beneficiary Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Beneficiary Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FaUser className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {claim.beneficiary?.personalDetails?.fullName || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {claim.beneficiary?.ehrmsCode || claim.beneficiary?.pensionerNumber}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FaMoneyBillWave className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bank Details</p>
                    <p className="text-sm text-gray-500">
                      {claim.beneficiary?.bankDetails?.bankName || 'N/A'} • {claim.beneficiary?.bankDetails?.accountNumber ? '••••' + claim.beneficiary.bankDetails.accountNumber.slice(-4) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Claim Description */}
          {claim.description && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Description</h4>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                {claim.description}
              </p>
            </div>
          )}
          
          {/* Supporting Documents */}
          {claim.supportingDocuments && claim.supportingDocuments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Supporting Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {claim.supportingDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaFileAlt className="h-4 w-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Document {index + 1}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.type || 'Supporting document'}
                      </p>
                    </div>
                    <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Verification History */}
          {(claim.verifiedBy || claim.verificationNotes) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Verification History</h4>
              <div className="space-y-2">
                {claim.verifiedBy && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Verified By:</span>
                    <span className="text-sm text-gray-900">
                      {claim.verifiedBy?.personalDetails?.fullName || 'Admin'}
                    </span>
                  </div>
                )}
                {claim.verifiedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Verified At:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(claim.verifiedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {claim.verificationNotes && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Notes:</span>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mt-1">
                      {claim.verificationNotes}
                    </p>
                  </div>
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

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [filters, setFilters] = useState({});

  // Modal states
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showClaimDetails, setShowClaimDetails] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    fetchClaims();
  }, [filters]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await getClaims(filters);
      setClaims(response.data);
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to load claims' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClaim = async (claimId, status, notes = '') => {
    try {
      setActionLoading(`${status}-${claimId}`);
      await verifyClaim(claimId, status, notes);
      await fetchClaims();
      setError({ type: 'success', message: `Claim ${status.toLowerCase()} successfully` });
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to verify claim' });
    } finally {
      setActionLoading(null);
      setShowApproveConfirm(false);
      setShowRejectConfirm(false);
      setSelectedClaim(null);
      setVerificationNotes('');
    }
  };

  // Modal open handlers
  const openApproveConfirm = (claim) => {
    setSelectedClaim(claim);
    setVerificationNotes('');
    setShowApproveConfirm(true);
  };

  const openRejectConfirm = (claim) => {
    setSelectedClaim(claim);
    setVerificationNotes('');
    setShowRejectConfirm(true);
  };

  const openClaimDetails = (claim) => {
    setSelectedClaim(claim);
    setShowClaimDetails(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending Verification': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Fully Funded': 'bg-blue-100 text-blue-800'
    };
    
    return statusConfig[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      'Death During Service': 'bg-red-100 text-red-800',
      'Death After Service': 'bg-orange-100 text-orange-800',
      'Retirement Farewell': 'bg-blue-100 text-blue-800',
      "Daughter's Marriage": 'bg-purple-100 text-purple-800',
      'Medical Claim': 'bg-green-100 text-green-800'
    };
    
    return typeConfig[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claims Verification</h1>
          <p className="text-gray-600">Review and verify user claims</p>
        </div>
        
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="Pending Verification">Pending Verification Verification</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Fully Funded">Fully Funded</option>
          <option value="">All Claims</option>
        </select>
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
                <FaCheck className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <FaExclamationTriangle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <p>{error.message}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-sm hover:opacity-70"
            >
              <FaClose className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beneficiary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.claims?.map((claim) => (
                  <tr key={claim._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(claim.type)} mr-2`}>
                          {claim.type?.replace(/_/g, ' ')}
                        </span>
                        {claim.claimId}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <FaCalendar className="h-3 w-3 mr-1" />
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {claim.description && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {claim.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {claim.beneficiary?.personalDetails?.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {claim.beneficiary?.ehrmsCode || claim.beneficiary?.pensionerNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{claim.amountRequested?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Raised: ₹{claim.amountRaised?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(claim.status)}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      {claim.status === 'Pending Verification' && (
                        <>
                          <button
                            onClick={() => openApproveConfirm(claim)}
                            disabled={actionLoading === `Approved-${claim._id}`}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 transition-colors p-1"
                            title="Approve Claim"
                          >
                            {actionLoading === `Approved-${claim._id}` ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              <FaCheck className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openRejectConfirm(claim)}
                            disabled={actionLoading === `Rejected-${claim._id}`}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors p-1"
                            title="Reject Claim"
                          >
                            {actionLoading === `Rejected-${claim._id}` ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              <FaTimes className="h-4 w-4" />
                            )}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openClaimDetails(claim)}
                        className="text-teal-600 hover:text-teal-900 transition-colors p-1"
                        title="View Details"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {(!claims.claims || claims.claims.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No claims found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filters.status ? `No ${filters.status.toLowerCase()} claims available` : 'No claims available'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {claims.totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {claims.currentPage} of {claims.totalPages} • {claims.total} total claims
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={claims.currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={claims.currentPage >= claims.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={() => handleVerifyClaim(selectedClaim?._id, 'Approved', verificationNotes)}
        title="Approve Claim"
        message={`Are you sure you want to approve the claim for ${selectedClaim?.beneficiary?.personalDetails?.fullName}? This will make the claim available for donations.`}
        confirmText="Approve"
        confirmColor="bg-green-600"
        notes={verificationNotes}
        onNotesChange={setVerificationNotes}
      />

      <ConfirmationModal
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={() => handleVerifyClaim(selectedClaim?._id, 'Rejected', verificationNotes)}
        title="Reject Claim"
        message={`Are you sure you want to reject the claim for ${selectedClaim?.beneficiary?.personalDetails?.fullName}? This action cannot be undone.`}
        confirmText="Reject"
        confirmColor="bg-red-600"
        notes={verificationNotes}
        onNotesChange={setVerificationNotes}
      />

      {/* Claim Details Modal */}
      <ClaimDetailsModal
        isOpen={showClaimDetails}
        onClose={() => setShowClaimDetails(false)}
        claim={selectedClaim}
      />
    </div>
  );
};

export default AdminClaims;