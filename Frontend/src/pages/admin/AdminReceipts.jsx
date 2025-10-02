// pages/admin/AdminReceipts.jsx
import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaDownload } from 'react-icons/fa';
import { getPendingReceipts, updateReceiptStatus } from '../../lib/api/admin';

const AdminReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await getPendingReceipts();
      setReceipts(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptAction = async (receiptId, status, rejectionReason = '') => {
    try {
      await updateReceiptStatus(receiptId, status, rejectionReason);
      fetchReceipts(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Failed to update receipt status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Receipts Management</h1>
        <p className="text-gray-600">Verify manual payment receipts</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid gap-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending receipts</h3>
            <p className="mt-1 text-sm text-gray-500">All receipts have been processed.</p>
          </div>
        ) : (
          receipts.map((receipt) => (
            <div key={receipt._id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {receipt.uploaderId?.personalDetails?.fullName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        EHRMS: {receipt.uploaderId?.ehrmsCode}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Amount:</span>
                      <span className="ml-2">₹{receipt.amount}</span>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <span className="ml-2">{receipt.paymentType}</span>
                    </div>
                    <div>
                      <span className="font-medium">Uploaded:</span>
                      <span className="ml-2">
                        {new Date(receipt.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReceiptAction(receipt._id, 'VERIFIED')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaCheck className="h-4 w-4" />
                    Verify
                  </button>
                  <button
                    onClick={() => handleReceiptAction(receipt._id, 'REJECTED', 'Please provide valid receipt')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FaTimes className="h-4 w-4" />
                    Reject
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <FaEye className="h-4 w-4" />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReceipts;