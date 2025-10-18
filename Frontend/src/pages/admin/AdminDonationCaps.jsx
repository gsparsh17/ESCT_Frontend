import { useState, useEffect } from 'react';
import { 
  FaSave, 
  FaEdit, 
  FaMoneyBillWave, 
  FaCalendar,
  FaExclamationTriangle,
  FaTimes,
  FaHistory,
  FaInfoCircle
} from 'react-icons/fa';
import { getDonationCaps, updateDonationCap } from '../../lib/api/admin';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, claimType, currentAmount, newAmount, monthYear }) => {
  if (!isOpen) return null;

  const amountChange = newAmount - currentAmount;
  const changeType = amountChange > 0 ? 'increase' : 'decrease';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <FaExclamationTriangle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Update Donation Cap</h3>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Claim Type:</span>
              <span className="text-sm text-gray-900">{claimType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Month:</span>
              <span className="text-sm text-gray-900">{monthYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Current Cap:</span>
              <span className="text-sm text-gray-900">₹{currentAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">New Cap:</span>
              <span className="text-sm font-semibold text-gray-900">₹{newAmount?.toLocaleString()}</span>
            </div>
            {currentAmount && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Change:</span>
                <span className={`text-sm font-semibold ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {changeType === 'increase' ? '+' : ''}₹{Math.abs(amountChange).toLocaleString()} ({changeType === 'increase' ? '+' : ''}{((amountChange / currentAmount) * 100).toFixed(1)}%)
                </span>
              </div>
            )}
          </div>

          {amountChange > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <FaInfoCircle className="h-4 w-4 text-blue-600 mr-2" />
                <p className="text-sm text-blue-800">
                  Increasing the cap may allow for larger donations to this claim type.
                </p>
              </div>
            </div>
          )}

          {amountChange < 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <FaExclamationTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  Decreasing the cap may limit donation amounts for this claim type.
                </p>
              </div>
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
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Update Cap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDonationCaps = () => {
  const [caps, setCaps] = useState({ donationCaps: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [editingCap, setEditingCap] = useState(null);
  const [newCapAmount, setNewCapAmount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedClaimType, setSelectedClaimType] = useState(null);

  const claimTypes = [
    { value: 'DEATH_DURING_SERVICE', label: 'Death During Service', description: 'For employees who pass away while in service' },
    { value: 'DEATH_AFTER_SERVICE', label: 'Death After Service', description: 'For pensioners who pass away after retirement' },
    { value: 'RETIREMENT_FAREWELL', label: 'Retirement Farewell', description: 'For employees retiring from service' },
    { value: 'DAUGHTER_MARRIAGE', label: "Daughter's Marriage", description: 'For daughter\'s marriage support' },
    { value: 'MEDICAL_CLAIM', label: 'Medical Claim', description: 'For major medical treatments and emergencies' },
  ];

  useEffect(() => {
    fetchCaps();
  }, [selectedMonth]);

  const fetchCaps = async () => {
    try {
      setLoading(true);
      const response = await getDonationCaps(selectedMonth);
      setCaps(response.data);
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to load donation caps' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCap = async () => {
    if (!newCapAmount || newCapAmount <= 0) {
      setError({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }

    try {
      setActionLoading(selectedClaimType);
      await updateDonationCap(selectedClaimType, newCapAmount, selectedMonth);
      
      setError({ type: 'success', message: 'Donation cap updated successfully' });
      setEditingCap(null);
      setNewCapAmount('');
      setShowConfirmModal(false);
      setSelectedClaimType(null);
      await fetchCaps();
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to update donation cap' });
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (claimType, currentAmount) => {
    setEditingCap(claimType);
    setNewCapAmount(currentAmount || '');
    setSelectedClaimType(claimType);
  };

  const openConfirmModal = (claimType, currentAmount) => {
    if (!newCapAmount || newCapAmount <= 0) {
      setError({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }
    setSelectedClaimType(claimType);
    setShowConfirmModal(true);
  };

  const getCurrentCap = (claimType) => {
    const cap = caps.donationCaps?.find(cap => cap.claimType === claimType);
    return cap?.capAmount || 0;
  };

  const isDefaultCap = (claimType) => {
    const cap = caps.donationCaps?.find(cap => cap.claimType === claimType);
    return cap?.isDefault || !cap;
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Generate options for current year and next year
    for (let i = -6; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    
    return options;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Donation Caps Management</h1>
        <p className="text-gray-600">Set monthly donation limits for different claim types</p>
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <FaCalendar className="h-5 w-5 text-teal-600" />
            <label className="text-sm font-medium text-gray-700">
              Select Month:
            </label>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {generateMonthOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-500">
            Managing caps for: <strong>{new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</strong>
          </div>
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
                <FaSave className="h-5 w-5 text-green-600 mr-2" />
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

      {/* Caps Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Cap
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
              {claimTypes.map((claimType) => {
                const currentAmount = getCurrentCap(claimType.value);
                const isDefault = isDefaultCap(claimType.value);
                const isEditing = editingCap === claimType.value;
                
                return (
                  <tr key={claimType.value} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="h-5 w-5 text-teal-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {claimType.label}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs">
                            {claimType.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">₹</span>
                          <input
                            type="number"
                            value={newCapAmount}
                            onChange={(e) => setNewCapAmount(e.target.value)}
                            className="w-32 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter amount"
                            min="0"
                            step="1000"
                          />
                        </div>
                      ) : (
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{currentAmount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        isDefault 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isDefault ? 'Default Cap' : 'Custom Cap'}
                      </span>
                      {isDefault && (
                        <div className="text-xs text-gray-500 mt-1">
                          Using system default
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => openConfirmModal(claimType.value, currentAmount)}
                            disabled={actionLoading === claimType.value}
                            className="flex items-center gap-2 text-green-600 hover:text-green-900 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === claimType.value ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              <FaSave className="h-4 w-4" />
                            )}
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingCap(null);
                              setNewCapAmount('');
                            }}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            <FaTimes className="h-4 w-4" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => openEdit(claimType.value, currentAmount)}
                          className="flex items-center gap-2 text-teal-600 hover:text-teal-900 transition-colors"
                        >
                          <FaEdit className="h-4 w-4" />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <FaInfoCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-blue-900">About Donation Caps</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Donation caps limit the maximum amount that can be donated to a specific claim type each month</li>
              <li>Default caps are used when no custom cap is set for a month</li>
              <li>Setting a custom cap overrides the default value for that specific month</li>
              <li>Caps help manage fund allocation and ensure fair distribution across claim types</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSaveCap}
        claimType={claimTypes.find(ct => ct.value === selectedClaimType)?.label}
        currentAmount={getCurrentCap(selectedClaimType)}
        newAmount={Number(newCapAmount)}
        monthYear={selectedMonth}
      />
    </div>
  );
};

export default AdminDonationCaps;