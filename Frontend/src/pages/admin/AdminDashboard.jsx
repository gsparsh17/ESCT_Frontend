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
  FaUserCheck,
  FaImages,
  FaNewspaper,
  FaUserShield
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
        const response = await getAdminDashboard();
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
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
          title="Active Users"
          value={stats?.users?.active || 0}
          icon={FaUserCheck}
          color="bg-green-500"
          to="/admin/users?isActive=true"
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
          value={stats?.claims?.pending || 0}
          icon={FaFileAlt}
          color="bg-orange-500"
          to="/admin/claims?status=PENDING"
        />
        <StatCard
          title="Completed Claims"
          value={stats?.claims?.completed || 0}
          icon={FaCheckCircle}
          color="bg-green-500"
          to="/admin/claims?status=COMPLETED"
        />
        <StatCard
          title="Total Donations"
          value={stats?.donations?.total || 0}
          icon={FaMoneyBillWave}
          color="bg-teal-500"
          to="/admin/donations"
        />
        <StatCard
          title="Monthly Amount"
          value={`₹${(stats?.donations?.monthlyAmount || 0).toLocaleString()}`}
          icon={FaMoneyBillWave}
          color="bg-indigo-500"
          to="/admin/donations"
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
            <div>
              <div className="font-medium">Pending Receipts</div>
              <div className="text-sm text-gray-500">{stats?.donations?.pendingReceipts || 0} pending</div>
            </div>
          </Link>
          <Link
            to="/admin/subscriptions"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaUserShield className="h-6 w-6 text-teal-600 mr-3" />
            <div>
              <div className="font-medium">Subscriptions</div>
              <div className="text-sm text-gray-500">Manage memberships</div>
            </div>
          </Link>
          <Link
            to="/admin/gallery"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaImages className="h-6 w-6 text-teal-600 mr-3" />
            <div>
              <div className="font-medium">Gallery</div>
              <div className="text-sm text-gray-500">Manage photos</div>
            </div>
          </Link>
          <Link
            to="/admin/news"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaNewspaper className="h-6 w-6 text-teal-600 mr-3" />
            <div>
              <div className="font-medium">News & Blogs</div>
              <div className="text-sm text-gray-500">Content management</div>
            </div>
          </Link>
          <Link
            to="/admin/logs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaHistory className="h-6 w-6 text-teal-600 mr-3" />
            <div>
              <div className="font-medium">Audit Logs</div>
              <div className="text-sm text-gray-500">System activities</div>
            </div>
          </Link>
          <Link
            to="/admin/config"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaCog className="h-6 w-6 text-teal-600 mr-3" />
            <div>
              <div className="font-medium">System Config</div>
              <div className="text-sm text-gray-500">Platform settings</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activities */}
      {stats?.recentActivities && stats.recentActivities.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-3">
            {stats.recentActivities.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-700">{activity.description}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;