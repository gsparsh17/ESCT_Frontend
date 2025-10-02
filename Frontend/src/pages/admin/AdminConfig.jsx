// pages/admin/AdminConfig.jsx
import { useState, useEffect } from 'react';
import { FaSave, FaCog } from 'react-icons/fa';
import { getAppConfig, updateAppConfig } from '../../lib/api/admin';

const AdminConfig = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      // You'll need to implement getAppConfig API function
      const response = await getAppConfig();
      setConfig(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigUpdate = async (key, value) => {
    try {
      setSaving(true);
      await updateAppConfig(key, value);
      setConfig(prev => ({ ...prev, [key]: value }));
    } catch (err) {
      setError(err.message || 'Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const configItems = [
    {
      key: 'MAX_LOGIN_ATTEMPTS',
      label: 'Max Login Attempts',
      type: 'number',
      description: 'Maximum number of failed login attempts before account lock'
    },
    {
      key: 'LOGIN_LOCKOUT_MINUTES',
      label: 'Login Lockout Duration (minutes)',
      type: 'number',
      description: 'Duration of account lock after max failed attempts'
    },
    {
      key: 'DEFAULT_DONATION_AMOUNT',
      label: 'Default Donation Amount',
      type: 'number',
      description: 'Default monthly donation amount for members'
    },
    {
      key: 'MEMBERSHIP_FEE',
      label: 'Membership Fee',
      type: 'number',
      description: 'One-time membership fee for new members'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
        <p className="text-gray-600">Manage platform settings and configurations</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {configItems.map((item) => (
              <div key={item.key} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FaCog className="h-5 w-5 text-teal-600" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{item.label}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type={item.type}
                      value={config[item.key] || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, [item.key]: e.target.value }))}
                      className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      onClick={() => handleConfigUpdate(item.key, config[item.key])}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaSave className="h-4 w-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConfig;