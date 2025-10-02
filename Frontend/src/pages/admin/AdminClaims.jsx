// pages/admin/AdminClaims.jsx
import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaClock } from 'react-icons/fa';
import { verifyClaim, getClaims } from '../../lib/api/admin';
import { fetchAllClaims } from '../../lib/api/claims';

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'pending'
  });

  useEffect(() => {
    fetchClaims();
  }, [filters]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      // You'll need to implement getClaims API function
      const response = await fetchAllClaims(filters);
      setClaims(response);
    } catch (err) {
      setError(err.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClaim = async (claimId, status, verificationNotes = '') => {
    try {
      await verifyClaim(claimId, status, verificationNotes);
      fetchClaims(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Failed to verify claim');
    }
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
          <option value="pending">Pending Verification</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All Claims</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
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
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {claim.type}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {claim.beneficiary?.personalDetails?.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {claim.beneficiary?.ehrmsCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ₹{claim.amountRequested?.toLocaleString()}
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
                            onClick={() => handleVerifyClaim(claim._id, 'Approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaCheck className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleVerifyClaim(claim._id, 'Rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTimes className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <button className="text-teal-600 hover:text-teal-900">
                        <FaEye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClaims;