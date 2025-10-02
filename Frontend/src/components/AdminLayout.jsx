// components/AdminLayout.jsx
import { useState } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaFileAlt, 
  FaReceipt, 
  FaCog, 
  FaHistory,
  FaBars,
  FaTimes,
  FaMoneyCheckAlt,
  FaClipboardList,
  FaUserShield
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();

  const menuItems = [
    { path: '/admin', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/admin/users', icon: FaUsers, label: 'User Management' },
    { path: '/admin/claims', icon: FaFileAlt, label: 'Claims Verification' },
    { path: '/admin/receipts', icon: FaReceipt, label: 'Receipts' },
    { path: '/admin/subscriptions', icon: FaMoneyCheckAlt, label: 'Subscriptions' },
    { path: '/admin/donation-caps', icon: FaClipboardList, label: 'Donation Caps' },
    { path: '/admin/config', icon: FaCog, label: 'System Config' },
    { path: '/admin/logs', icon: FaHistory, label: 'Audit Logs' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Redirect non-admin users
  if (!user?.isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex -m-3 sm:-m-4 lg:-m-6 ">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-teal-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex lg:flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 bg-teal-900 flex-shrink-0">
          <div className="flex items-center">
            <FaUserShield className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-teal-200"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-teal-700 text-white shadow-lg'
                    : 'text-teal-100 hover:bg-teal-700/50 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <FaBars className="h-5 w-5" />
            </button>
            
            <div className="flex-1 flex justify-between items-center">
              <h1 className="text-2xl m-2 font-bold text-teal-900">
                {menuItems.find(item => isActive(item.path))?.label || 'Admin'}
              </h1>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  <FaUserShield className="inline mr-2" />
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;