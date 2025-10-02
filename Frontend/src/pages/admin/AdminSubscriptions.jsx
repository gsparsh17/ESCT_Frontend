// pages/admin/AdminSubscriptions.jsx
import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaClock } from 'react-icons/fa';
import { getPendingSubscriptions, verifyManualSubscription } from '../../lib/api/admin';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await getPendingSubscriptions();
      setSubscriptions(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (subscriptionId, status, verificationNotes = '') => {
    try {
      await verifyManualSubscription(subscriptionId, status, verificationNotes);
      fetchSubscriptions(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Failed to update subscription status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions Management</h1>
        <p className="text-gray-600">Verify manual subscription payments</p>
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
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending subscriptions</h3>
            <p className="mt-1 text-sm text-gray-500">All subscription requests have been processed.</p>
          </div>
        ) : (
          subscriptions.map((subscription) => (
            <div key={subscription._id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {subscription.userId?.personalDetails?.fullName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        EHRMS: {subscription.userId?.ehrmsCode}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Amount:</span>
                      <span className="ml-2">₹{subscription.amount}</span>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>
                      <span className="ml-2">{subscription.duration} months</span>
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span>
                      <span className="ml-2">
                        {new Date(subscription.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {subscription.verificationNotes && (
                    <div className="mt-2">
                      <span className="font-medium text-sm">Notes:</span>
                      <p className="text-sm text-gray-600 mt-1">{subscription.verificationNotes}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSubscriptionAction(subscription._id, 'APPROVED')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaCheck className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleSubscriptionAction(subscription._id, 'REJECTED', 'Please provide valid payment proof')}
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

export default AdminSubscriptions;