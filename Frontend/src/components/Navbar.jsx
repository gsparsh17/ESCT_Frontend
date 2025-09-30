// Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes, FaBell } from 'react-icons/fa'; // Import Bell icon
import { getAllUsers } from '../lib/api/users';

export default function Navbar() {
  const { token, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true); // Set this based on your logic
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const handleLinkClick = () => setOpen(false);

  // Mock notifications data - replace with actual data from your API
  const notifications = [
    { id: 1, message: 'Your donation for Retirement Farewell has been processed', time: '2 hours ago', read: false },
    { id: 2, message: 'New claim submitted for Death During Service', time: '1 day ago', read: true },
    { id: 3, message: 'Monthly contribution reminder', time: '2 days ago', read: false },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks = (
    <>
      <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to={token ? '/home' : '/home'} onClick={handleLinkClick}>Home</Link>
      <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/legal/about" onClick={handleLinkClick}>About Us</Link>
      {token ? (
        <>
          <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/claims" onClick={handleLinkClick}>Claims</Link>
          <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/profile" onClick={handleLinkClick}>Profile</Link>
          <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/donation-queue" onClick={handleLinkClick}>Donation Queue</Link>
          <button onClick={() => { logout(); handleLinkClick(); navigate('/') }} className="rounded-full bg-teal-600 px-4 py-2 text-white text-sm font-semibold shadow-md hover:bg-teal-700 transition-colors">Logout</button>
        </>
      ) : (
        <>
          <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/register" onClick={handleLinkClick}>Register</Link>
          <Link className="rounded-full bg-teal-600 px-4 py-2 text-white text-sm font-semibold shadow-md hover:bg-teal-700 transition-colors" to="/login" onClick={handleLinkClick}>Login</Link>
        </>
      )}
    </>
  );

  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const all = await getAllUsers();
        if (!mounted) return;
        setUsers(Array.isArray(all) ? all : []);
      } catch (err) {
        if (!mounted) return;
        setUsersError(err.message || 'Failed to load users');
      } finally {
        if (mounted) setUsersLoading(false);
      }
    };

    // Attempt to fetch users if token is present or public endpoint is allowed
    fetchUsers();

    return () => { mounted = false };
  }, [token]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-teal-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
        <Link to={token ? '/home' : '/'} className="flex items-center gap-3">
          <img src="/icon2.png" alt="ESCT" className="h-9 w-16" />
          <span className="font-extrabold text-xl text-teal-800 tracking-wider">ESCT</span>
          <span className="text-lg text-teal-800 tracking-wider">
            Total Users: {usersLoading ? '...' : usersError ? '—' : users.length}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks}
          
          {/* Notification Bell - Only show when logged in */}
          {token && (
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-teal-700 hover:text-teal-900 transition-colors focus:outline-none"
              >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                            notification.read ? 'border-transparent' : 'border-teal-500 bg-teal-50'
                          }`}
                        >
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center text-gray-500">
                        No notifications
                      </div>
                    )}
                  </div>
                  
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        // Mark all as read logic here
                        setShowNotifications(false);
                      }}
                      className="text-sm text-teal-600 hover:text-teal-800 font-medium w-full text-center py-1"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          {/* Mobile Notification Bell - Only show when logged in */}
          {token && (
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-teal-700 hover:text-teal-900 transition-colors focus:outline-none"
              >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Mobile Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                            notification.read ? 'border-transparent' : 'border-teal-500 bg-teal-50'
                          }`}
                        >
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center text-gray-500">
                        No notifications
                      </div>
                    )}
                  </div>
                  
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        // Mark all as read logic here
                        setShowNotifications(false);
                      }}
                      className="text-sm text-teal-600 hover:text-teal-800 font-medium w-full text-center py-1"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button onClick={() => setOpen(!open)} className="text-teal-800 text-xl focus:outline-none">
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${open ? 'block' : 'hidden'} transition-all duration-300 ease-in-out`}>
        <div className="flex flex-col gap-4 px-4 py-4 border-t border-teal-100 bg-white/95">
          {navLinks}
        </div>
      </div>

      {/* Overlay to close notifications when clicking outside */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </header>
  );
}