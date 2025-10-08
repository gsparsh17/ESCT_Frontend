// Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes, FaBell, FaUserShield, FaExclamationTriangle, FaCheckCircle, FaUsers, FaTimesCircle } from 'react-icons/fa';
import { getAllUsers } from '../lib/api/users';
import { getMe } from '../lib/api/auth';
import { getMyNominees } from '../lib/api/profile';

export default function Navbar() {
  const { token, logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [incompleteFields, setIncompleteFields] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [hasNominees, setHasNominees] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleLinkClick = () => setOpen(false);

  // Check for incomplete profile fields
  const checkIncompleteFields = (userData) => {
    const incomplete = [];
    
    if (!userData) return incomplete;

    // Check personal details
    if (!userData.personalDetails?.fullName) incomplete.push('Full Name');
    if (!userData.personalDetails?.dateOfBirth) incomplete.push('Date of Birth');
    if (!userData.personalDetails?.sex) incomplete.push('Gender');
    if (!userData.personalDetails?.phone) incomplete.push('Phone Number');
    if (!userData.personalDetails?.email) incomplete.push('Email');
    if (!userData.personalDetails?.aadhaarNumber) incomplete.push('Aadhaar Number');
    
    // Check employment details (for employees)
    if (userData.userType === 'EMPLOYEE') {
      if (!userData.employmentDetails?.state) incomplete.push('Employment State');
      if (!userData.employmentDetails?.district) incomplete.push('Employment District');
      if (!userData.employmentDetails?.department) incomplete.push('Employment Department');
      if (!userData.employmentDetails?.designation) incomplete.push('Employment Designation');
      if (!userData.employmentDetails?.dateOfJoining) incomplete.push('Date of Joining');
    }
    
    // Check bank details
    if (!userData.bankDetails?.accountNumber) incomplete.push('Bank Account Number');
    if (!userData.bankDetails?.ifscCode) incomplete.push('IFSC Code');
    if (!userData.bankDetails?.bankName) incomplete.push('Bank Name');
    
    // Check Aadhaar documents
    if (!userData.personalDetails?.aadhaarFrontUrl) incomplete.push('Aadhaar Front Document');
    if (!userData.personalDetails?.aadhaarBackUrl) incomplete.push('Aadhaar Back Document');
    
    // Check profile photo
    if (!userData.photoUrl) incomplete.push('Profile Photo');

    return incomplete;
  };

  // Check if profile modal should be shown
  // Check if profile modal should be shown
const shouldShowProfileModal = (incompleteFields, nominees) => {
  const modalShown = localStorage.getItem('profileIncompleteModalShown');
  
  // Check if modal was previously shown
  const hasModalBeenShown = modalShown === 'true';
  
  // Show modal if: user is logged in, modal hasn't been shown before, AND profile is incomplete or has no nominees
  if (token && !hasModalBeenShown && (incompleteFields.length > 0 || nominees.length === 0)) {
    return true;
  }
  return false;
};

  // Generate notifications based on incomplete fields and nominees
  const generateNotifications = (incompleteFields, nominees) => {
    const newNotifications = [];
    
    // Profile completion notifications
    if (incompleteFields.length > 0) {
      newNotifications.push({
        id: 'profile-incomplete',
        message: `Please complete your profile. ${incompleteFields.length} field(s) missing.`,
        time: 'Just now',
        read: false,
        type: 'warning',
        action: '/profile'
      });
      
      // Add individual field notifications
      incompleteFields.forEach((field, index) => {
        newNotifications.push({
          id: `field-missing-${index}`,
          message: `Please add your ${field}`,
          time: 'Just now',
          read: false,
          type: 'info',
          action: '/profile'
        });
      });
    } else if (profileData) {
      newNotifications.push({
        id: 'profile-complete',
        message: 'Your profile is complete! Thank you for updating all details.',
        time: 'Just now',
        read: false,
        type: 'success'
      });
    }

    // Nominee notifications
    if (nominees.length === 0) {
      newNotifications.push({
        id: 'no-nominees',
        message: 'Please add at least one nominee to complete your profile.',
        time: 'Just now',
        read: false,
        type: 'warning',
        action: '/profile'
      });
    } else if (nominees.length === 1) {
      newNotifications.push({
        id: 'add-second-nominee',
        message: 'Consider adding a second nominee for better coverage.',
        time: 'Just now',
        read: false,
        type: 'info',
        action: '/profile'
      });
    }

    return newNotifications;
  };

  // Fetch user profile data and nominees
  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      if (!token) return;
      
      setProfileLoading(true);
      try {
        // Fetch profile data
        const userProfile = await getMe();
        if (!mounted) return;
        
        setProfileData(userProfile);
        
        // Fetch nominees
        const userNominees = await getMyNominees();
        if (!mounted) return;
        
        setNominees(userNominees);
        setHasNominees(userNominees.length > 0);
        
        // Check for incomplete fields
        const incomplete = checkIncompleteFields(userProfile);
        setIncompleteFields(incomplete);
        
        // Generate notifications
        const newNotifications = generateNotifications(incomplete, userNominees);
        setNotifications(newNotifications);
        
        // Check if we should show the modal popup
        if (shouldShowProfileModal(incomplete, userNominees)) {
          setShowProfileModal(true);
        }
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (!mounted) return;
      } finally {
        if (mounted) setProfileLoading(false);
      }
    };

    fetchUserData();

    return () => { mounted = false };
  }, [token]);

  // Fetch total users count
  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const all = await getAllUsers();
        if (!mounted) return;
        if(all.total===0)
        setUsers(all.total);
        else
        setUsers(all.total - 1);
      } catch (err) {
        if (!mounted) return;
        setUsersError(err.message || 'Failed to load users');
      } finally {
        if (mounted) setUsersLoading(false);
      }
    };

    fetchUsers();

    return () => { mounted = false };
  }, [token]);

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
          
          {/* Admin Link - Only show for admins */}
          {user?.isAdmin && (
            <Link 
              className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors flex items-center" 
              to="/admin" 
              onClick={handleLinkClick}
            >
              <FaUserShield className="mr-1" />
              Admin
            </Link>
          )}
          
          <button onClick={handleLogout} className="rounded-full bg-teal-600 px-4 py-2 text-white text-sm font-semibold shadow-md hover:bg-teal-700 transition-colors">Logout</button>
        </>
      ) : (
        <>
          <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/register" onClick={handleLinkClick}>Register</Link>
          <Link className="rounded-full bg-teal-600 px-4 py-2 text-white text-sm font-semibold shadow-md hover:bg-teal-700 transition-colors" to="/login" onClick={handleLinkClick}>Login</Link>
        </>
      )}
    </>
  );

  // Function to mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // Function to mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  // Function to handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.action) {
      navigate(notification.action);
      setShowNotifications(false);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500 mr-2 flex-shrink-0" />;
      case 'success':
        return <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />;
      default:
        return <FaBell className="text-blue-500 mr-2 flex-shrink-0" />;
    }
  };

  // Handle modal actions
  const handleModalCompleteProfile = () => {
    localStorage.setItem('profileIncompleteModalShown', 'true');
    setShowProfileModal(false);
    navigate('/profile');
  };

  const handleModalClose = () => {
    localStorage.setItem('profileIncompleteModalShown', 'true');
    setShowProfileModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-teal-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
          <Link to={token ? '/home' : '/'} className="flex items-center gap-3">
            <img src="/icon2.png" alt="ESCT" className="h-9 w-16" />
            <span className="font-extrabold text-xl text-teal-800 tracking-wider">ESCT</span>
            <span className="lg:text-lg sm:text-sm text-xs text-teal-800 tracking-wider">
              Total Members: {usersLoading ? '...' : usersError ? '—' : users}
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
                  <FaBell className="lg:text-xl sm:text-sm text-xs" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-2 transition-colors ${
                              notification.read 
                                ? 'border-transparent bg-white' 
                                : notification.type === 'warning'
                                  ? 'border-yellow-500 bg-yellow-50'
                                  : notification.type === 'success'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-blue-500 bg-blue-50'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1">
                                <p className="text-sm text-gray-800">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <FaCheckCircle className="mx-auto text-green-400 text-2xl mb-2" />
                          <p>No notifications</p>
                          <p className="text-xs mt-1">All caught up!</p>
                        </div>
                      )}
                    </div>
                    
                    {(incompleteFields.length > 0 || !hasNominees) && (
                      <div className="px-4 py-2 border-t border-gray-100 bg-yellow-50">
                        <Link 
                          to="/profile"
                          onClick={() => setShowNotifications(false)}
                          className="text-sm text-yellow-700 hover:text-yellow-800 font-medium w-full text-center py-2 block"
                        >
                          Complete Your Profile ({incompleteFields.length} fields missing, {hasNominees ? '1' : '0'}/2 nominees)
                        </Link>
                      </div>
                    )}
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
                  <FaBell className="lg:text-xl sm:text-sm text-sm" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Mobile Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                              notification.read ? 'border-transparent' : 'border-teal-500 bg-teal-50'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1">
                                <p className="text-sm text-gray-800">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <FaCheckCircle className="mx-auto text-green-400 text-2xl mb-2" />
                          <p>No notifications</p>
                          <p className="text-xs mt-1">All caught up!</p>
                        </div>
                      )}
                    </div>
                    
                    {(incompleteFields.length > 0 || !hasNominees) && (
                      <div className="px-4 py-2 border-t border-gray-100 bg-yellow-50">
                        <Link 
                          to="/profile"
                          onClick={() => setShowNotifications(false)}
                          className="text-sm text-yellow-700 hover:text-yellow-800 font-medium w-full text-center py-2 block"
                        >
                          Complete Your Profile ({incompleteFields.length} fields missing, {hasNominees ? '1' : '0'}/2 nominees)
                        </Link>
                      </div>
                    )}
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

      {/* Profile Incomplete Modal Popup */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-yellow-500 text-xl mr-3" />
                <h3 className="text-lg font-bold text-gray-800">Complete Your Profile</h3>
              </div>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimesCircle className="text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                To get the most out of ESCT, please complete your profile information:
              </p>
              
              <div className="space-y-3 mb-6">
                {incompleteFields.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <FaExclamationTriangle className="text-yellow-500 mr-2" />
                      <span className="font-medium text-yellow-800">Missing Information</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      {incompleteFields.length} field(s) need to be completed in your profile.
                    </p>
                  </div>
                )}
                
                {!hasNominees && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <FaUsers className="text-blue-500 mr-2" />
                      <span className="font-medium text-blue-800">No Nominees Added</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Please add at least one nominee to complete your profile setup.
                    </p>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-4">
                This popup will only appear once. You can always update your profile later from the Profile section.
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleModalClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                I'll Do It Later
              </button>
              <button
                onClick={handleModalCompleteProfile}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Complete Profile Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}