// pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaFileAlt, 
  FaCheckCircle, 
  FaMoneyBillWave,
  FaReceipt,
  FaHistory,
  FaCog,
  FaClock,
  FaUserCheck
} from 'react-icons/fa';
import { getAdminDashboard } from '../../lib/api/admin';

const StatCard = ({ title, value, icon: Icon, color, to }) => (
  <Link 
    to={to} 
    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getAdminDashboard();
        setStats(data.data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-teal-100">Manage your ESCT platform efficiently</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.users?.total || 0}
          icon={FaUsers}
          color="bg-blue-500"
          to="/admin/users"
        />
        <StatCard
          title="Verified Users"
          value={stats?.users?.verified || 0}
          icon={FaUserCheck}
          color="bg-green-500"
          to="/admin/users?isVerified=true"
        />
        <StatCard
          title="Pending Verification"
          value={stats?.users?.pendingVerification || 0}
          icon={FaClock}
          color="bg-yellow-500"
          to="/admin/users?isVerified=false"
        />
        <StatCard
          title="Total Claims"
          value={stats?.claims?.total || 0}
          icon={FaFileAlt}
          color="bg-purple-500"
          to="/admin/claims"
        />
        <StatCard
          title="Pending Claims"
          value={stats?.claims?.pendingVerification || 0}
          icon={FaFileAlt}
          color="bg-orange-500"
          to="/admin/claims?status=pending"
        />
        <StatCard
          title="Approved Claims"
          value={stats?.claims?.approved || 0}
          icon={FaCheckCircle}
          color="bg-green-500"
          to="/admin/claims?status=approved"
        />
        <StatCard
          title="Total Donations"
          value={stats?.donations?.total || 0}
          icon={FaMoneyBillWave}
          color="bg-teal-500"
          to="/admin/donation-caps"
        />
        <StatCard
          title="Total Amount"
          value={`₹${(stats?.donations?.totalAmount || 0).toLocaleString()}`}
          icon={FaMoneyBillWave}
          color="bg-indigo-500"
          to="/admin/donation-caps"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/receipts"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaReceipt className="h-6 w-6 text-teal-600 mr-3" />
            <span>Pending Receipts</span>
          </Link>
          <Link
            to="/admin/subscriptions"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaMoneyBillWave className="h-6 w-6 text-teal-600 mr-3" />
            <span>Pending Subscriptions</span>
          </Link>
          <Link
            to="/admin/logs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaHistory className="h-6 w-6 text-teal-600 mr-3" />
            <span>Audit Logs</span>
          </Link>
          <Link
            to="/admin/config"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaCog className="h-6 w-6 text-teal-600 mr-3" />
            <span>System Config</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;