// pages/admin/AdminDonationCaps.jsx
import { useState, useEffect } from 'react';
import { FaSave, FaEdit, FaMoneyBillWave } from 'react-icons/fa';
import { getDonationCaps, updateDonationCap } from '../../lib/api/admin';

const AdminDonationCaps = () => {
  const [caps, setCaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCap, setEditingCap] = useState(null);
  const [newCapAmount, setNewCapAmount] = useState('');

  useEffect(() => {
    fetchCaps();
  }, []);

  const fetchCaps = async () => {
    try {
      setLoading(true);
      // You'll need to implement getDonationCaps API function
      const response = await getDonationCaps();
      console.log(response.data)
      setCaps(response.data.donationCaps);
    } catch (err) {
      setError(err.message || 'Failed to load donation caps');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCap = async (claimType, monthYear) => {
    try {
      await updateDonationCap(claimType, newCapAmount, monthYear);
      setEditingCap(null);
      setNewCapAmount('');
      fetchCaps(); // Refresh data
    } catch (err) {
      setError(err.message || 'Failed to update donation cap');
    }
  };

  const claimTypes = [
    { value: 'DEATH_DURING_SERVICE', label: 'Death During Service' },
    { value: 'DEATH_AFTER_SERVICE', label: 'Death After Service' },
    { value: 'RETIREMENT_FAREWELL', label: 'Retirement Farewell' },
    { value: 'DAUGHTER_MARRIAGE', label: "Daughter's Marriage" },
    { value: 'MEDICAL_CLAIM', label: 'Medical Claim' },
  ];

  const currentMonthYear = new Date().toISOString().slice(0, 7); // YYYY-MM

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Donation Caps Management</h1>
        <p className="text-gray-600">Set monthly donation limits for different claim types</p>
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
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {claimTypes.map((claimType) => {
                const currentCap = caps.find(cap => 
                  cap.claimType === claimType.value && cap.monthYear === currentMonthYear
                );
                
                return (
                  <tr key={claimType.value} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="h-5 w-5 text-teal-600 mr-3" />
                        <div className="text-sm font-medium text-gray-900">
                          {claimType.label}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingCap === claimType.value ? (
                        <input
                          type="number"
                          value={newCapAmount}
                          onChange={(e) => setNewCapAmount(e.target.value)}
                          className="w-32 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter amount"
                        />
                      ) : (
                        `₹${(currentCap?.capAmount || 0).toLocaleString()}`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {currentMonthYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingCap === claimType.value ? (
                        <button
                          onClick={() => handleSaveCap(claimType.value, currentMonthYear)}
                          className="flex items-center gap-2 text-green-600 hover:text-green-900"
                        >
                          <FaSave className="h-4 w-4" />
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCap(claimType.value);
                            setNewCapAmount(currentCap?.capAmount || '');
                          }}
                          className="flex items-center gap-2 text-teal-600 hover:text-teal-900"
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
    </div>
  );
};

export default AdminDonationCaps;