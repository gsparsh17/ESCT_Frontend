// components/MakeAdmin.jsx (Development tool)
import { useState } from 'react';
import { makeUserAdmin } from '../lib/api/admin';

const MakeAdmin = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleMakeAdmin = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      await makeUserAdmin(userId);
      setMessage('User successfully made admin');
      setUserId('');
    } catch (error) {
      setMessage(error.message || 'Failed to make user admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold mb-4">Make User Admin (Development)</h3>
      <form onSubmit={handleMakeAdmin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User ID or EHRMS Code
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter User ID or EHRMS Code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !userId.trim()}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Make Admin'}
        </button>
        {message && (
          <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default MakeAdmin;