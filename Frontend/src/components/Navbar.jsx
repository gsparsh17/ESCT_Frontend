import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from '../hooks/useTranslation';
import { setLanguage } from '../store/slices/languageSlice';
import { FaBars, FaTimes, FaBell, FaUserShield, FaExclamationTriangle, FaCheckCircle, FaUsers, FaTimesCircle, FaGlobe } from 'react-icons/fa';
import { getAllUsers } from '../lib/api/users';
import { getMe } from '../lib/api/auth';
import { getMyNominees } from '../lib/api/profile';
import { getTotalMemberCount } from '../lib/api/users';

export default function Navbar() {
  const { token, logout, user } = useAuth();
  const dispatch = useDispatch();
  const { t, currentLanguage } = useTranslation();
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

  const handleLanguageChange = (e) => {
    dispatch(setLanguage(e.target.value));
  };

  // Check for incomplete profile fields with pensioner support
  const checkIncompleteFields = (userData) => {
    const incomplete = [];
    
    if (!userData) return incomplete;

    // Check personal details (common for both user types)
    if (!userData.personalDetails?.fullName) incomplete.push(t('NAVBAR.fields.fullName', 'Full Name'));
    if (!userData.personalDetails?.dateOfBirth) incomplete.push(t('NAVBAR.fields.dateOfBirth', 'Date of Birth'));
    if (!userData.personalDetails?.sex) incomplete.push(t('NAVBAR.fields.gender', 'Gender'));
    if (!userData.personalDetails?.phone) incomplete.push(t('NAVBAR.fields.phone', 'Phone Number'));
    if (!userData.personalDetails?.email) incomplete.push(t('NAVBAR.fields.email', 'Email'));
    if (!userData.personalDetails?.aadhaarNumber) incomplete.push(t('NAVBAR.fields.aadhaar', 'Aadhaar Number'));
    
    // Check employment details based on user type
    if (userData.userType === 'EMPLOYEE') {
      // Employee specific fields
      if (!userData.employmentDetails?.state) incomplete.push(t('NAVBAR.fields.empState', 'Employment State'));
      if (!userData.employmentDetails?.district) incomplete.push(t('NAVBAR.fields.empDistrict', 'Employment District'));
      if (!userData.employmentDetails?.department) incomplete.push(t('NAVBAR.fields.empDepartment', 'Employment Department'));
      if (!userData.employmentDetails?.designation) incomplete.push(t('NAVBAR.fields.empDesignation', 'Employment Designation'));
      if (!userData.employmentDetails?.dateOfJoining) incomplete.push(t('NAVBAR.fields.doj', 'Date of Joining'));
    } else if (userData.userType === 'PENSIONER') {
      // Pensioner specific fields
      if (!userData.employmentDetails?.state) incomplete.push(t('NAVBAR.fields.state', 'State'));
      if (!userData.employmentDetails?.dateOfRetirement) incomplete.push(t('NAVBAR.fields.retirementDate', 'Date of Retirement'));
      if (!userData.employmentDetails?.retirementDocumentUrl) incomplete.push(t('NAVBAR.fields.retirementDoc', 'Retirement Document'));
    }
    
    // Check bank details (common for both user types)
    if (!userData.bankDetails?.accountNumber) incomplete.push(t('NAVBAR.fields.accountNumber', 'Bank Account Number'));
    if (!userData.bankDetails?.ifscCode) incomplete.push(t('NAVBAR.fields.ifsc', 'IFSC Code'));
    if (!userData.bankDetails?.bankName) incomplete.push(t('NAVBAR.fields.bankName', 'Bank Name'));
    
    // Check Aadhaar documents (common for both user types)
    if (!userData.personalDetails?.aadhaarFrontUrl) incomplete.push(t('NAVBAR.fields.aadhaarFront', 'Aadhaar Front Document'));
    if (!userData.personalDetails?.aadhaarBackUrl) incomplete.push(t('NAVBAR.fields.aadhaarBack', 'Aadhaar Back Document'));
    
    // Check profile photo (common for both user types)
    if (!userData.photoUrl) incomplete.push(t('NAVBAR.fields.profilePhoto', 'Profile Photo'));

    return incomplete;
  };

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
  const generateNotifications = (incompleteFields, nominees, userData) => {
    const newNotifications = [];
    
    // Profile completion notifications
    if (incompleteFields.length > 0) {
      newNotifications.push({
        id: 'profile-incomplete',
        message: t('NAVBAR.notifications.profileIncomplete', 'Please complete your profile. {count} field(s) missing.', { count: incompleteFields.length }),
        time: t('NAVBAR.notifications.justNow', 'Just now'),
        read: false,
        type: 'warning',
        action: '/profile'
      });
      
      // Add individual field notifications
      incompleteFields.forEach((field, index) => {
        newNotifications.push({
          id: `field-missing-${index}`,
          message: t('NAVBAR.notifications.fieldMissing', 'Please add your {field}', { field }),
          time: t('NAVBAR.notifications.justNow', 'Just now'),
          read: false,
          type: 'info',
          action: '/profile'
        });
      });
    } else if (profileData) {
      newNotifications.push({
        id: 'profile-complete',
        message: t('NAVBAR.notifications.profileComplete', 'Your profile is complete! Thank you for updating all details.'),
        time: t('NAVBAR.notifications.justNow', 'Just now'),
        read: false,
        type: 'success'
      });
    }

    // User type specific notifications
    if (userData?.userType === 'PENSIONER') {
      if (!userData.employmentDetails?.retirementDocumentUrl) {
        newNotifications.push({
          id: 'retirement-doc-missing',
          message: t('NAVBAR.notifications.retirementDocMissing', 'Please upload your retirement document to complete your pensioner profile.'),
          time: t('NAVBAR.notifications.justNow', 'Just now'),
          read: false,
          type: 'warning',
          action: '/profile'
        });
      }
    }

    // Nominee notifications
    if (nominees.length === 0) {
      newNotifications.push({
        id: 'no-nominees',
        message: t('NAVBAR.notifications.noNominees', 'Please add at least one nominee to complete your profile.'),
        time: t('NAVBAR.notifications.justNow', 'Just now'),
        read: false,
        type: 'warning',
        action: '/profile'
      });
    } else if (nominees.length === 1) {
      newNotifications.push({
        id: 'add-second-nominee',
        message: t('NAVBAR.notifications.addSecondNominee', 'Consider adding a second nominee for better coverage.'),
        time: t('NAVBAR.notifications.justNow', 'Just now'),
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
        const newNotifications = generateNotifications(incomplete, userNominees, userProfile);
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
        // Use the new function
        const count = await getTotalMemberCount();
        if (!mounted) return;
        
        // The API now just returns a number
        setUsers(count - 1); // Your logic to subtract 1 remains
      } catch (err) {
        if (!mounted) return;
        setUsersError(err.message || t('NAVBAR.errors.failedLoadUsers', 'Failed to load users'));
      } finally {
        if (mounted) setUsersLoading(false);
      }
    };

    fetchUsers();

    return () => { mounted = false };
  }, []); // <--- Remove 'token' from the dependency array

  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks = (
    <>
      <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to={token ? '/home' : '/home'} onClick={handleLinkClick}>
        {t('NAVBAR.links.home', 'Home')}
      </Link>
      <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/legal/about" onClick={handleLinkClick}>
        {t('NAVBAR.links.about', 'About Us')}
      </Link>
      {token ? (
        <>
          <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/claims" onClick={handleLinkClick}>
            {t('NAVBAR.links.claims', 'Claims')}
          </Link>
          <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/profile" onClick={handleLinkClick}>
            {t('NAVBAR.links.profile', 'Profile')}
          </Link>
          <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/donation-queue" onClick={handleLinkClick}>
            {t('NAVBAR.links.donationQueue', 'Donation Queue')}
          </Link>
          
          {/* Admin Link - Only show for admins */}
          {user?.isAdmin && (
            <Link 
              className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors flex items-center" 
              to="/admin" 
              onClick={handleLinkClick}
            >
              <FaUserShield className="mr-1" />
              {t('NAVBAR.links.admin', 'Admin')}
            </Link>
          )}
          
          <button onClick={handleLogout} className="rounded-full bg-teal-600 px-4 py-2 text-white text-sm font-semibold shadow-md hover:bg-teal-700 transition-colors">
            {t('NAVBAR.links.logout', 'Logout')}
          </button>
        </>
      ) : (
        <>
          <Link className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors" to="/register" onClick={handleLinkClick}>
            {t('NAVBAR.links.register', 'Register')}
          </Link>
          <Link className="rounded-full bg-teal-600 px-4 py-2 text-white text-sm font-semibold shadow-md hover:bg-teal-700 transition-colors" to="/login" onClick={handleLinkClick}>
            {t('NAVBAR.links.login', 'Login')}
          </Link>
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

  // Get user type display text
  const getUserTypeDisplay = () => {
    if (profileData?.userType === 'PENSIONER') {
      return t('NAVBAR.userTypes.pensioner', 'Pensioner');
    }
    return t('NAVBAR.userTypes.employee', 'Employee');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-teal-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
          <Link to={token ? '/home' : '/'} className="flex items-center gap-3">
            <img src="/icon2.png" alt="ESCT" className="h-9 w-16" />
            <span className="font-extrabold text-xl text-teal-800 tracking-wider">ESCT</span>
            <span className="lg:text-lg sm:text-sm text-xs text-teal-800 tracking-wider">
              {t('NAVBAR.totalMembers', 'Total Members')}: {usersLoading ? '...' : usersError ? '—' : users}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center space-x-2 mr-2">
              <FaGlobe className="text-teal-600 text-sm" />
              <select
                value={currentLanguage}
                onChange={handleLanguageChange}
                className="text-sm rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm bg-white py-1 px-2"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>
            
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
                      <h3 className="font-semibold text-gray-800">
                        {t('NAVBAR.notifications.title', 'Notifications')}
                      </h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                        >
                          {t('NAVBAR.notifications.markAllRead', 'Mark all as read')}
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
                          <p>{t('NAVBAR.notifications.noNotifications', 'No notifications')}</p>
                          <p className="text-xs mt-1">{t('NAVBAR.notifications.allCaughtUp', 'All caught up!')}</p>
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
                          {t('NAVBAR.notifications.completeProfile', 'Complete Your Profile ({fields} fields missing, {nominees}/2 nominees)', {
                            fields: incompleteFields.length,
                            nominees: hasNominees ? '1' : '0'
                          })}
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
            {/* Language Selector for Mobile */}
            <div className="flex items-center space-x-1">
              <select
                value={currentLanguage}
                onChange={handleLanguageChange}
                className="text-xs rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm bg-white py-1 px-1"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
              </select>
            </div>

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
                      <h3 className="font-semibold text-gray-800">
                        {t('NAVBAR.notifications.title', 'Notifications')}
                      </h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                        >
                          {t('NAVBAR.notifications.markAllRead', 'Mark all as read')}
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
                          <p>{t('NAVBAR.notifications.noNotifications', 'No notifications')}</p>
                          <p className="text-xs mt-1">{t('NAVBAR.notifications.allCaughtUp', 'All caught up!')}</p>
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
                          {t('NAVBAR.notifications.completeProfile', 'Complete Your Profile ({fields} fields missing, {nominees}/2 nominees)', {
                            fields: incompleteFields.length,
                            nominees: hasNominees ? '1' : '0'
                          })}
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
            {/* Mobile Language Selector */}
            <div className="flex items-center space-x-2 pb-2 border-b border-teal-100">
              <FaGlobe className="text-teal-600" />
              <span className="text-sm font-medium text-teal-700">
                {t('NAVBAR.language', 'Language')}:
              </span>
              <select
                value={currentLanguage}
                onChange={handleLanguageChange}
                className="text-sm rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm bg-white py-1 px-2 flex-1"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>
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
                <h3 className="text-lg font-bold text-gray-800">
                  {t('NAVBAR.modal.completeProfile', 'Complete Your Profile')}
                </h3>
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
                {t('NAVBAR.modal.description', 'To get the most out of ESCT, please complete your profile information:')}
              </p>
              
              <div className="space-y-3 mb-6">
                {incompleteFields.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <FaExclamationTriangle className="text-yellow-500 mr-2" />
                      <span className="font-medium text-yellow-800">
                        {t('NAVBAR.modal.missingInfo', 'Missing Information')}
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      {t('NAVBAR.modal.fieldsMissing', '{count} field(s) need to be completed in your profile.', { 
                        count: incompleteFields.length 
                      })}
                    </p>
                    {profileData?.userType && (
                      <p className="text-xs text-yellow-600 mt-1">
                        {t('NAVBAR.modal.userType', 'User Type: {type}', { 
                          type: getUserTypeDisplay() 
                        })}
                      </p>
                    )}
                  </div>
                )}
                
                {!hasNominees && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <FaUsers className="text-blue-500 mr-2" />
                      <span className="font-medium text-blue-800">
                        {t('NAVBAR.modal.noNominees', 'No Nominees Added')}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">
                      {t('NAVBAR.modal.addNominees', 'Please add at least one nominee to complete your profile setup.')}
                    </p>
                  </div>
                )}

                {/* Pensioner specific reminder */}
                {profileData?.userType === 'PENSIONER' && incompleteFields.some(field => 
                  field.includes('Retirement') || field.includes('retirement')
                ) && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <FaUserShield className="text-purple-500 mr-2" />
                      <span className="font-medium text-purple-800">
                        {t('NAVBAR.modal.pensionerRequirement', 'Pensioner Requirement')}
                      </span>
                    </div>
                    <p className="text-sm text-purple-700">
                      {t('NAVBAR.modal.retirementDocRequired', 'As a pensioner, please ensure you upload your retirement document.')}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-4">
                {t('NAVBAR.modal.oneTimePopup', 'This popup will only appear once. You can always update your profile later from the Profile section.')}
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleModalClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {t('NAVBAR.modal.doLater', 'I\'ll Do It Later')}
              </button>
              <button
                onClick={handleModalCompleteProfile}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                {t('NAVBAR.modal.completeNow', 'Complete Profile Now')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}