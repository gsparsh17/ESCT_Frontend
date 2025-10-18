import { useState, useEffect } from 'react';
import { 
  FaSave, 
  FaCog, 
  FaExclamationTriangle,
  FaTimes,
  FaInfoCircle,
  FaMoneyBillWave,
  FaUserShield,
  FaBell,
  FaCalendar,
  FaCreditCard,
  FaCogs,
  FaShieldAlt
} from 'react-icons/fa';
import { getAppConfig, updateAppConfig } from '../../lib/api/admin';

// Configuration Update Modal
const ConfigUpdateModal = ({ isOpen, onClose, onConfirm, configItem, currentValue, newValue }) => {
  const [inputValue, setInputValue] = useState(newValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(newValue);
    }
  }, [isOpen, newValue]);

  const handleSubmit = () => {
    onConfirm(inputValue);
    onClose();
  };

  const getValueDescription = (key, value) => {
    const descriptions = {
      'MAX_LOGIN_ATTEMPTS': `${value} failed attempts will trigger account lockout`,
      'LOGIN_LOCKOUT_MINUTES': `Accounts will be locked for ${value} minutes after max failed attempts`,
      'DEFAULT_DONATION_AMOUNT': `Members will donate ₹${value} per month by default`,
      'MEMBERSHIP_FEE': `New members pay ₹${value} as one-time membership fee`,
      'ANNUAL_SUBSCRIPTION_FEE': `Annual subscription fee is ₹${value}`,
      'SESSION_TIMEOUT_MINUTES': `User sessions expire after ${value} minutes of inactivity`,
      'PASSWORD_MIN_LENGTH': `Passwords must be at least ${value} characters long`,
      'MONTHLY_DONATION_REQUIREMENT': `Members must make ${value} donations per month`,
      'MAX_DONATION_DEBT_MONTHS': `Accounts are blocked after ${value} months of donation debt`,
      'SUBSCRIPTION_GRACE_PERIOD_DAYS': `Subscription grace period is ${value} days`,
      'MIN_DONATION_MONTHS_FOR_CLAIM': `${value} months of donations required for claim eligibility`,
      'NOTIFICATION_DAILY_LIMIT': `Maximum ${value} notifications per user per day`,
      'DONATION_REMINDER_START_DAY': `Donation reminders start on day ${value} of the month`,
      'DONATION_REMINDER_END_DAY': `Donation reminders end on day ${value} of the month`,
      'BASE_CREDIT_SCORE': `New users start with ${value} credit score points`,
      'MAX_CREDIT_SCORE': `Maximum achievable credit score is ${value}`,
      'MIN_CREDIT_SCORE': `Minimum credit score is ${value}`,
      'ON_TIME_PAYMENT_BONUS': `+${value} credit score points for on-time donations`,
      'LATE_PAYMENT_PENALTY': `-${value} credit score points for late donations`
    };
    return descriptions[key] || `Setting value to: ${value}`;
  };

  const validateInput = (value, type, key) => {
    if (!value && value !== 0 && value !== false) return 'Value is required';
    
    if (type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) return 'Must be a valid number';
      if (numValue < 0) return 'Cannot be negative';
      
      // Specific validations for certain keys
      if (key === 'PASSWORD_MIN_LENGTH' && numValue < 6) return 'Minimum 6 characters required';
      if (key === 'MAX_LOGIN_ATTEMPTS' && numValue < 1) return 'Minimum 1 attempt required';
      if (key === 'SESSION_TIMEOUT_MINUTES' && numValue < 5) return 'Minimum 5 minutes required';
    }
    
    if (type === 'boolean' && typeof value !== 'boolean') {
      return 'Must be true or false';
    }
    
    return null;
  };

  const validationError = validateInput(inputValue, configItem.type, configItem.key);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Update Configuration</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Setting</h4>
              <p className="text-lg font-semibold text-gray-900">{configItem.label}</p>
              <p className="text-sm text-gray-500 mt-1">{configItem.description}</p>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Current Value:</span>
              <span className="text-sm font-semibold text-gray-900">
                {configItem.type === 'boolean' ? (currentValue ? 'Enabled' : 'Disabled') : currentValue}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Value {configItem.type === 'boolean' ? '' : '*'}
              </label>
              {configItem.type === 'boolean' ? (
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={inputValue === true}
                      onChange={() => setInputValue(true)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enabled</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={inputValue === false}
                      onChange={() => setInputValue(false)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Disabled</span>
                  </label>
                </div>
              ) : (
                <input
                  type={configItem.type}
                  value={inputValue}
                  onChange={(e) => setInputValue(configItem.type === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={`Enter ${configItem.label.toLowerCase()}...`}
                />
              )}
              {validationError && (
                <p className="mt-1 text-sm text-red-600">{validationError}</p>
              )}
            </div>
            
            {!validationError && inputValue !== currentValue && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center">
                  <FaInfoCircle className="h-4 w-4 text-blue-600 mr-2" />
                  <p className="text-sm text-blue-800">
                    {getValueDescription(configItem.key, inputValue)}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!!validationError || inputValue === currentValue}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Update Setting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminConfig = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await getAppConfig();
      // Convert array to object for easier access
      const configObj = {};
      response.data.forEach(item => {
        configObj[item.key] = item.value;
      });
      setConfig(configObj);
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigUpdate = async (key, value) => {
    try {
      setSaving(true);
      await updateAppConfig(key, value);
      setConfig(prev => ({ ...prev, [key]: value }));
      setError({ type: 'success', message: 'Configuration updated successfully' });
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to update configuration' });
    } finally {
      setSaving(false);
    }
  };

  const openUpdateModal = (configItem) => {
    setSelectedConfig(configItem);
    setShowUpdateModal(true);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'SECURITY': FaShieldAlt,
      'DONATION': FaMoneyBillWave,
      'SUBSCRIPTION': FaUserShield,
      'NOTIFICATION': FaBell,
      'CALENDAR': FaCalendar,
      'CREDIT_SCORE': FaCreditCard,
      'SYSTEM': FaCogs,
      'CLAIM': FaMoneyBillWave
    };
    return icons[category] || FaCog;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'SECURITY': 'text-red-600 bg-red-100',
      'DONATION': 'text-teal-600 bg-teal-100',
      'SUBSCRIPTION': 'text-purple-600 bg-purple-100',
      'NOTIFICATION': 'text-yellow-600 bg-yellow-100',
      'CALENDAR': 'text-blue-600 bg-blue-100',
      'CREDIT_SCORE': 'text-green-600 bg-green-100',
      'SYSTEM': 'text-gray-600 bg-gray-100',
      'CLAIM': 'text-orange-600 bg-orange-100'
    };
    return colors[category] || 'text-gray-600 bg-gray-100';
  };

  const configItems = [
    // SECURITY CONFIGURATIONS
    {
      key: 'MAX_LOGIN_ATTEMPTS',
      label: 'Max Login Attempts',
      type: 'number',
      category: 'SECURITY',
      description: 'Maximum number of failed login attempts before account lock',
      min: 1,
      max: 10
    },
    {
      key: 'LOGIN_LOCKOUT_MINUTES',
      label: 'Login Lockout Duration',
      type: 'number',
      category: 'SECURITY',
      description: 'Duration of account lock after max failed attempts (minutes)',
      min: 1,
      max: 1440
    },
    {
      key: 'PASSWORD_MIN_LENGTH',
      label: 'Minimum Password Length',
      type: 'number',
      category: 'SECURITY',
      description: 'Minimum number of characters required for passwords',
      min: 6,
      max: 50
    },
    {
      key: 'SESSION_TIMEOUT_MINUTES',
      label: 'Session Timeout',
      type: 'number',
      category: 'SECURITY',
      description: 'User session timeout duration in minutes',
      min: 5,
      max: 480
    },

    // DONATION CONFIGURATIONS
    {
      key: 'DEFAULT_DONATION_AMOUNT',
      label: 'Default Donation Amount',
      type: 'number',
      category: 'DONATION',
      description: 'Default monthly donation amount for members (INR)',
      min: 1,
      max: 10000
    },
    {
      key: 'MONTHLY_DONATION_REQUIREMENT',
      label: 'Monthly Donation Requirement',
      type: 'number',
      category: 'DONATION',
      description: 'Number of mandatory donations per month',
      min: 1,
      max: 10
    },
    {
      key: 'MAX_DONATION_DEBT_MONTHS',
      label: 'Max Donation Debt Months',
      type: 'number',
      category: 'DONATION',
      description: 'Maximum months of donation debt before account blocking',
      min: 1,
      max: 12
    },

    // SUBSCRIPTION CONFIGURATIONS
    {
      key: 'MEMBERSHIP_FEE',
      label: 'Membership Fee',
      type: 'number',
      category: 'SUBSCRIPTION',
      description: 'One-time membership fee for new members (INR)',
      min: 0,
      max: 1000
    },
    {
      key: 'ANNUAL_SUBSCRIPTION_FEE',
      label: 'Annual Subscription Fee',
      type: 'number',
      category: 'SUBSCRIPTION',
      description: 'Annual membership renewal fee (INR)',
      min: 0,
      max: 1000
    },
    {
      key: 'SUBSCRIPTION_GRACE_PERIOD_DAYS',
      label: 'Subscription Grace Period',
      type: 'number',
      category: 'SUBSCRIPTION',
      description: 'Grace period for subscription payment in days',
      min: 0,
      max: 30
    },

    // CLAIM CONFIGURATIONS
    {
      key: 'MIN_DONATION_MONTHS_FOR_CLAIM',
      label: 'Minimum Donation Months for Claim',
      type: 'number',
      category: 'CLAIM',
      description: 'Minimum months of donations required to be eligible for claims',
      min: 0,
      max: 24
    },

    // NOTIFICATION CONFIGURATIONS
    {
      key: 'NOTIFICATION_DAILY_LIMIT',
      label: 'Notification Daily Limit',
      type: 'number',
      category: 'NOTIFICATION',
      description: 'Maximum notifications per user per day',
      min: 1,
      max: 50
    },

    // CALENDAR CONFIGURATIONS
    {
      key: 'DONATION_REMINDER_START_DAY',
      label: 'Donation Reminder Start Day',
      type: 'number',
      category: 'CALENDAR',
      description: 'Day of month to start sending donation reminders',
      min: 1,
      max: 31
    },
    {
      key: 'DONATION_REMINDER_END_DAY',
      label: 'Donation Reminder End Day',
      type: 'number',
      category: 'CALENDAR',
      description: 'Day of month to stop sending donation reminders',
      min: 1,
      max: 31
    },

    // CREDIT SCORE CONFIGURATIONS
    {
      key: 'BASE_CREDIT_SCORE',
      label: 'Base Credit Score',
      type: 'number',
      category: 'CREDIT_SCORE',
      description: 'Starting credit score for new users',
      min: 0,
      max: 1000
    },
    {
      key: 'MAX_CREDIT_SCORE',
      label: 'Maximum Credit Score',
      type: 'number',
      category: 'CREDIT_SCORE',
      description: 'Maximum achievable credit score',
      min: 0,
      max: 1000
    },
    {
      key: 'MIN_CREDIT_SCORE',
      label: 'Minimum Credit Score',
      type: 'number',
      category: 'CREDIT_SCORE',
      description: 'Minimum credit score',
      min: 0,
      max: 500
    },
    {
      key: 'ON_TIME_PAYMENT_BONUS',
      label: 'On-time Payment Bonus',
      type: 'number',
      category: 'CREDIT_SCORE',
      description: 'Points added for each on-time donation',
      min: 0,
      max: 50
    },
    {
      key: 'LATE_PAYMENT_PENALTY',
      label: 'Late Payment Penalty',
      type: 'number',
      category: 'CREDIT_SCORE',
      description: 'Points deducted for each late donation',
      min: 0,
      max: 50
    },

    // SYSTEM CONFIGURATIONS
    {
      key: 'APP_MAINTENANCE_MODE',
      label: 'Maintenance Mode',
      type: 'boolean',
      category: 'SYSTEM',
      description: 'Put application in maintenance mode'
    },
    {
      key: 'ALLOW_SIGNUPS',
      label: 'Allow New Signups',
      type: 'boolean',
      category: 'SYSTEM',
      description: 'Allow new user registrations'
    },
    {
      key: 'CLAIM_VERIFICATION_REQUIRED',
      label: 'Claim Verification Required',
      type: 'boolean',
      category: 'SYSTEM',
      description: 'Whether claims require manual verification'
    }
  ];

  const categories = [
    { value: 'ALL', label: 'All Categories', count: configItems.length },
    { value: 'SECURITY', label: 'Security', count: configItems.filter(item => item.category === 'SECURITY').length },
    { value: 'DONATION', label: 'Donation', count: configItems.filter(item => item.category === 'DONATION').length },
    { value: 'SUBSCRIPTION', label: 'Subscription', count: configItems.filter(item => item.category === 'SUBSCRIPTION').length },
    { value: 'CLAIM', label: 'Claims', count: configItems.filter(item => item.category === 'CLAIM').length },
    { value: 'NOTIFICATION', label: 'Notifications', count: configItems.filter(item => item.category === 'NOTIFICATION').length },
    { value: 'CALENDAR', label: 'Calendar', count: configItems.filter(item => item.category === 'CALENDAR').length },
    { value: 'CREDIT_SCORE', label: 'Credit Score', count: configItems.filter(item => item.category === 'CREDIT_SCORE').length },
    { value: 'SYSTEM', label: 'System', count: configItems.filter(item => item.category === 'SYSTEM').length }
  ];

  const filteredConfigItems = categoryFilter === 'ALL' 
    ? configItems 
    : configItems.filter(item => item.category === categoryFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
        <p className="text-gray-600">Manage platform settings and configurations</p>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filter by Category:</span>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setCategoryFilter(category.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  categoryFilter === category.value
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className={`border rounded-lg p-4 ${
          error.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {error.type === 'success' ? (
                <FaSave className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <FaExclamationTriangle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <p>{error.message}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-sm hover:opacity-70"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Configuration List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConfigItems.map((item) => {
              const CategoryIcon = getCategoryIcon(item.category);
              const currentValue = config[item.key];
              
              return (
                <div key={item.key} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${getCategoryColor(item.category)}`}>
                          <CategoryIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{item.label}</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{item.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="font-medium">Current Value:</span>
                            <span className={`px-2 py-1 rounded ${
                              item.type === 'boolean' 
                                ? currentValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.type === 'boolean' 
                                ? (currentValue ? 'Enabled' : 'Disabled')
                                : (typeof currentValue === 'number' ? currentValue.toLocaleString() : currentValue || 'Not set')
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => openUpdateModal(item)}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaSave className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Configure'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredConfigItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FaCog className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No configurations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No configuration items match the selected filter.
            </p>
          </div>
        )}
      </div>

      {/* Configuration Update Modal */}
      <ConfigUpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={(newValue) => handleConfigUpdate(selectedConfig?.key, newValue)}
        configItem={selectedConfig}
        currentValue={config[selectedConfig?.key]}
        newValue={config[selectedConfig?.key]}
      />
    </div>
  );
};

export default AdminConfig;