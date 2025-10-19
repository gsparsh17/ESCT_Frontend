import { useState, useEffect } from 'react';
import { 
  FaEdit, 
  FaToggleOn, 
  FaToggleOff, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSearch,
  FaUserShield,
  FaKey,
  FaEye,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSave,
  FaUndo,
  FaImage,
  FaFileImage,
  FaTrash,
  FaPlus,
  FaUser,
  FaUsers
} from 'react-icons/fa';

// API functions - updated with nominee management
import { 
  getUsers, 
  updateUserStatus, 
  updateUserVerification, 
  makeUserAdmin, 
  resetUserPassword,
  updateUserDetails,
  updateUserDocuments,
  // Nominee API functions
  getUserNominees,
  createOrUpdateNominee,
  deleteNominee,
  updateNomineeDocuments
} from '../../lib/api/admin';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor = 'bg-red-600' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <FaExclamationTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 ${confirmColor} text-white rounded-lg hover:opacity-90 transition-opacity`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reset Password Modal Component
const ResetPasswordModal = ({ isOpen, onClose, onConfirm, userName }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm(newPassword);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            Reset password for <span className="font-semibold">{userName}</span>
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
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
              disabled={!newPassword || !confirmPassword}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Document Management Modal Component
const DocumentManagementModal = ({ isOpen, onClose, onUpdate, user, loading }) => {
  const [documentType, setDocumentType] = useState('');
  const [action, setAction] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setDocumentType('');
      setAction('');
      setFile(null);
      setPreviewUrl('');
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = () => {
    if (!documentType || !action) {
      alert('Please select document type and action');
      return;
    }

    if (action === 'update' && !file) {
      alert('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('action', action);
    if (file) {
      formData.append('document', file);
    }

    onUpdate(user._id, formData);
  };

  const getDocumentUrl = () => {
    switch (documentType) {
      case 'aadhaarFront':
        return user?.personalDetails?.aadhaarFrontUrl;
      case 'aadhaarBack':
        return user?.personalDetails?.aadhaarBackUrl;
      case 'profilePhoto':
        return user?.photoUrl;
      case 'retirementDocument':
        return user?.employmentDetails?.retirementDocumentUrl;
      default:
        return null;
    }
  };

  const getDocumentName = () => {
    switch (documentType) {
      case 'aadhaarFront':
        return 'Aadhaar Front';
      case 'aadhaarBack':
        return 'Aadhaar Back';
      case 'profilePhoto':
        return 'Profile Photo';
      case 'retirementDocument':
        return 'Retirement Document';
      default:
        return 'Document';
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Manage Documents</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Document Type</option>
                <option value="profilePhoto">Profile Photo</option>
                <option value="aadhaarFront">Aadhaar Front</option>
                <option value="aadhaarBack">Aadhaar Back</option>
                <option value="retirementDocument">Retirement Document</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Action</option>
                <option value="view">View Document</option>
                <option value="update">Update Document</option>
                <option value="remove">Remove Document</option>
              </select>
            </div>

            {documentType && action === 'view' && getDocumentUrl() && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current {getDocumentName()}
                </label>
                <div className="border border-gray-300 rounded-lg p-4 text-center">
                  <img
                    src={getDocumentUrl()}
                    alt={getDocumentName()}
                    className="max-w-full max-h-64 mx-auto rounded-lg"
                  />
                  <a
                    href={getDocumentUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-teal-600 hover:text-teal-700"
                  >
                    Open in new tab
                  </a>
                </div>
              </div>
            )}

            {action === 'update' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New {getDocumentName()}
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {previewUrl && file?.type.startsWith('image/') && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-48 mx-auto rounded-lg border"
                    />
                  </div>
                )}
              </div>
            )}

            {action === 'remove' && getDocumentUrl() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FaExclamationTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-yellow-800">
                    Are you sure you want to remove the {getDocumentName().toLowerCase()}?
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  This action cannot be undone. The document will be permanently removed.
                </p>
              </div>
            )}

            {action === 'view' && !getDocumentUrl() && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <FaFileImage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No {getDocumentName().toLowerCase()} found</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            {(action === 'update' || action === 'remove') && (
              <button
                onClick={handleSubmit}
                disabled={loading || (action === 'update' && !file)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : action === 'update' ? (
                  <>
                    <FaSave className="h-4 w-4" />
                    Update
                  </>
                ) : (
                  <>
                    <FaTrash className="h-4 w-4" />
                    Remove
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Nominee Management Modal Component
const NomineeManagementModal = ({ isOpen, onClose, user, onSaveNominee, onDeleteNominee, onUpdateNomineeDocuments }) => {
  const [nominees, setNominees] = useState([]);
  const [editingNominee, setEditingNominee] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && user) {
      fetchNominees();
    }
  }, [isOpen, user]);

  const fetchNominees = async () => {
    try {
      setLoading(true);
      const response = await getUserNominees(user._id);
      setNominees(response.data || []);
    } catch (err) {
      console.error('Failed to fetch nominees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (nominee = null) => {
    setEditingNominee(nominee);
    setFormData(nominee ? { ...nominee } : {
      name: '',
      relation: '',
      dateOfBirth: '',
      aadhaarNumber: '',
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: ''
      },
      isPrimary: false
    });
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBankDetailChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Nominee name is required';
    }
    if (!formData.relation?.trim()) {
      newErrors.relation = 'Relation is required';
    }
    if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Aadhaar must be 12 digits';
    }
    if (formData.bankDetails?.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankDetails.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSaveNominee(user._id, formData);
      await fetchNominees();
      setEditingNominee(null);
      setFormData({});
    } catch (err) {
      console.error('Failed to save nominee:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (nomineeId) => {
    if (window.confirm('Are you sure you want to delete this nominee?')) {
      try {
        setLoading(true);
        await onDeleteNominee(user._id, nomineeId);
        await fetchNominees();
      } catch (err) {
        console.error('Failed to delete nominee:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDocumentUpdate = async (nomineeId, documentType, file) => {
    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('action', 'update');
      formData.append('document', file);
      
      await onUpdateNomineeDocuments(user._id, nomineeId, formData);
      await fetchNominees();
    } catch (err) {
      console.error('Failed to update nominee document:', err);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Manage Nominees - {user.personalDetails?.fullName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {editingNominee !== null ? (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900">
                {editingNominee ? 'Edit Nominee' : 'Add New Nominee'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nominee Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relation *
                  </label>
                  <input
                    type="text"
                    value={formData.relation || ''}
                    onChange={(e) => handleChange('relation', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.relation ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Spouse, Son, Daughter"
                  />
                  {errors.relation && <p className="mt-1 text-sm text-red-600">{errors.relation}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    value={formData.aadhaarNumber || ''}
                    onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.aadhaarNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    maxLength={12}
                  />
                  {errors.aadhaarNumber && <p className="mt-1 text-sm text-red-600">{errors.aadhaarNumber}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Details
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded-lg p-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails?.accountNumber || ''}
                        onChange={(e) => handleBankDetailChange('accountNumber', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails?.ifscCode || ''}
                        onChange={(e) => handleBankDetailChange('ifscCode', e.target.value.toUpperCase())}
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          errors.ifscCode ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.ifscCode && <p className="mt-1 text-sm text-red-600">{errors.ifscCode}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails?.bankName || ''}
                        onChange={(e) => handleBankDetailChange('bankName', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch Name
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails?.branchName || ''}
                        onChange={(e) => handleBankDetailChange('branchName', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPrimary || false}
                      onChange={(e) => handleChange('isPrimary', e.target.checked)}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Set as Primary Nominee</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingNominee(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FaSave className="h-4 w-4" />
                  )}
                  {editingNominee ? 'Update Nominee' : 'Add Nominee'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-medium text-gray-900">Nominees ({nominees.length})</h4>
                <button
                  onClick={() => handleEdit()}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  <FaPlus className="h-4 w-4" />
                  Add Nominee
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : nominees.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <FaUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No nominees added yet</p>
                  <button
                    onClick={() => handleEdit()}
                    className="mt-2 text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Add your first nominee
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nominees.map((nominee) => (
                    <div key={nominee._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-medium text-gray-900 flex items-center gap-2">
                            {nominee.name}
                            {nominee.isPrimary && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Primary
                              </span>
                            )}
                          </h5>
                          <p className="text-sm text-gray-600">Relation: {nominee.relation}</p>
                          {nominee.age && <p className="text-sm text-gray-600">Age: {nominee.age}</p>}
                          {nominee.aadhaarNumber && (
                            <p className="text-sm text-gray-600">Aadhaar: {nominee.aadhaarNumber}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(nominee)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit Nominee"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(nominee._id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Nominee"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {nominee.bankDetails && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <h6 className="text-sm font-medium text-gray-700 mb-2">Bank Details</h6>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>Account: {nominee.bankDetails.accountNumber}</p>
                            <p>IFSC: {nominee.bankDetails.ifscCode}</p>
                            <p>Bank: {nominee.bankDetails.bankName}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              if (e.target.files[0]) {
                                handleDocumentUpdate(nominee._id, 'aadhaarFront', e.target.files[0]);
                              }
                            };
                            input.click();
                          }}
                          className="text-sm text-teal-600 hover:text-teal-700"
                        >
                          {nominee.aadhaarFrontUrl ? 'Update Aadhaar Front' : 'Upload Aadhaar Front'}
                        </button>
                        <button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              if (e.target.files[0]) {
                                handleDocumentUpdate(nominee._id, 'aadhaarBack', e.target.files[0]);
                              }
                            };
                            input.click();
                          }}
                          className="text-sm text-teal-600 hover:text-teal-700"
                        >
                          {nominee.aadhaarBackUrl ? 'Update Aadhaar Back' : 'Upload Aadhaar Back'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Edit User Modal Component (Updated with proper state management)
const EditUserModal = ({ isOpen, onClose, onSave, user, loading }) => {
  const [formData, setFormData] = useState({
    personalDetails: {},
    employmentDetails: {},
    bankDetails: {}
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        personalDetails: {
          fullName: user.personalDetails?.fullName || '',
          dateOfBirth: user.personalDetails?.dateOfBirth ? 
            new Date(user.personalDetails.dateOfBirth).toISOString().split('T')[0] : '',
          age: user.personalDetails?.age || '',
          sex: user.personalDetails?.sex || '',
          aadhaarNumber: user.personalDetails?.aadhaarNumber || '',
          phone: user.personalDetails?.phone || '',
          email: user.personalDetails?.email || ''
        },
        employmentDetails: {
          state: user.employmentDetails?.state || '',
          district: user.employmentDetails?.district || '',
          organisation: user.employmentDetails?.organisation || '',
          department: user.employmentDetails?.department || '',
          designation: user.employmentDetails?.designation || '',
          dateOfJoining: user.employmentDetails?.dateOfJoining ? 
            new Date(user.employmentDetails.dateOfJoining).toISOString().split('T')[0] : '',
          dateOfRetirement: user.employmentDetails?.dateOfRetirement ? 
            new Date(user.employmentDetails.dateOfRetirement).toISOString().split('T')[0] : ''
        },
        bankDetails: {
          accountNumber: user.bankDetails?.accountNumber || '',
          ifscCode: user.bankDetails?.ifscCode || '',
          bankName: user.bankDetails?.bankName || '',
          branchName: user.bankDetails?.branchName || '',
          upiId: user.bankDetails?.upiId || ''
        }
      });
    }
  }, [user, isOpen]);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Details Validation
    if (!formData.personalDetails?.fullName?.trim()) {
      newErrors['personalDetails.fullName'] = 'Full name is required';
    }
    if (formData.personalDetails?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalDetails.email)) {
      newErrors['personalDetails.email'] = 'Invalid email format';
    }
    if (formData.personalDetails?.phone && !/^[6-9]\d{9}$/.test(formData.personalDetails.phone)) {
      newErrors['personalDetails.phone'] = 'Invalid phone number';
    }
    if (formData.personalDetails?.aadhaarNumber && !/^\d{12}$/.test(formData.personalDetails.aadhaarNumber)) {
      newErrors['personalDetails.aadhaarNumber'] = 'Aadhaar must be 12 digits';
    }

    // Bank Details Validation
    if (formData.bankDetails?.accountNumber && !/^\d{9,18}$/.test(formData.bankDetails.accountNumber)) {
      newErrors['bankDetails.accountNumber'] = 'Invalid account number';
    }
    if (formData.bankDetails?.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankDetails.ifscCode)) {
      newErrors['bankDetails.ifscCode'] = 'Invalid IFSC code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(user._id, formData);
    }
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        personalDetails: {
          fullName: user.personalDetails?.fullName || '',
          dateOfBirth: user.personalDetails?.dateOfBirth ? 
            new Date(user.personalDetails.dateOfBirth).toISOString().split('T')[0] : '',
          age: user.personalDetails?.age || '',
          sex: user.personalDetails?.sex || '',
          aadhaarNumber: user.personalDetails?.aadhaarNumber || '',
          phone: user.personalDetails?.phone || '',
          email: user.personalDetails?.email || ''
        },
        employmentDetails: {
          state: user.employmentDetails?.state || '',
          district: user.employmentDetails?.district || '',
          organisation: user.employmentDetails?.organisation || '',
          department: user.employmentDetails?.department || '',
          designation: user.employmentDetails?.designation || '',
          dateOfJoining: user.employmentDetails?.dateOfJoining ? 
            new Date(user.employmentDetails.dateOfJoining).toISOString().split('T')[0] : '',
          dateOfRetirement: user.employmentDetails?.dateOfRetirement ? 
            new Date(user.employmentDetails.dateOfRetirement).toISOString().split('T')[0] : ''
        },
        bankDetails: {
          accountNumber: user.bankDetails?.accountNumber || '',
          ifscCode: user.bankDetails?.ifscCode || '',
          bankName: user.bankDetails?.bankName || '',
          branchName: user.bankDetails?.branchName || '',
          upiId: user.bankDetails?.upiId || ''
        }
      });
    }
    setErrors({});
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Edit User Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Personal Details */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.personalDetails?.fullName || ''}
                    onChange={(e) => handleChange('personalDetails', 'fullName', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors['personalDetails.fullName'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['personalDetails.fullName'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['personalDetails.fullName']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.personalDetails?.dateOfBirth || ''}
                    onChange={(e) => handleChange('personalDetails', 'dateOfBirth', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.personalDetails?.age || ''}
                    onChange={(e) => handleChange('personalDetails', 'age', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    min="18"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.personalDetails?.sex || ''}
                    onChange={(e) => handleChange('personalDetails', 'sex', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    value={formData.personalDetails?.aadhaarNumber || ''}
                    onChange={(e) => handleChange('personalDetails', 'aadhaarNumber', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors['personalDetails.aadhaarNumber'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    maxLength={12}
                  />
                  {errors['personalDetails.aadhaarNumber'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['personalDetails.aadhaarNumber']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.personalDetails?.phone || ''}
                    onChange={(e) => handleChange('personalDetails', 'phone', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors['personalDetails.phone'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    maxLength={10}
                  />
                  {errors['personalDetails.phone'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['personalDetails.phone']}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.personalDetails?.email || ''}
                    onChange={(e) => handleChange('personalDetails', 'email', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors['personalDetails.email'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['personalDetails.email'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['personalDetails.email']}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Employment Details */}
            {user.userType === 'EMPLOYEE' && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.employmentDetails?.state || ''}
                      onChange={(e) => handleChange('employmentDetails', 'state', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District
                    </label>
                    <input
                      type="text"
                      value={formData.employmentDetails?.district || ''}
                      onChange={(e) => handleChange('employmentDetails', 'district', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organisation
                    </label>
                    <input
                      type="text"
                      value={formData.employmentDetails?.organisation || ''}
                      onChange={(e) => handleChange('employmentDetails', 'organisation', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.employmentDetails?.department || ''}
                      onChange={(e) => handleChange('employmentDetails', 'department', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={formData.employmentDetails?.designation || ''}
                      onChange={(e) => handleChange('employmentDetails', 'designation', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Joining
                    </label>
                    <input
                      type="date"
                      value={formData.employmentDetails?.dateOfJoining || ''}
                      onChange={(e) => handleChange('employmentDetails', 'dateOfJoining', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Retirement
                    </label>
                    <input
                      type="date"
                      value={formData.employmentDetails?.dateOfRetirement || ''}
                      onChange={(e) => handleChange('employmentDetails', 'dateOfRetirement', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bank Details */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails?.accountNumber || ''}
                    onChange={(e) => handleChange('bankDetails', 'accountNumber', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors['bankDetails.accountNumber'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['bankDetails.accountNumber'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['bankDetails.accountNumber']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails?.ifscCode || ''}
                    onChange={(e) => handleChange('bankDetails', 'ifscCode', e.target.value.toUpperCase())}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors['bankDetails.ifscCode'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['bankDetails.ifscCode'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['bankDetails.ifscCode']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails?.bankName || ''}
                    onChange={(e) => handleChange('bankDetails', 'bankName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails?.branchName || ''}
                    onChange={(e) => handleChange('bankDetails', 'branchName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails?.upiId || ''}
                    onChange={(e) => handleChange('bankDetails', 'upiId', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <FaUndo className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FaSave className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced User Details Modal Component with Nominees Section
const UserDetailsModal = ({ isOpen, onClose, user, onManageDocuments, onManageNominees }) => {
  const [nominees, setNominees] = useState([]);

  useEffect(() => {
    if (isOpen && user) {
      fetchNominees();
    }
  }, [isOpen, user]);

  const fetchNominees = async () => {
    try {
      const response = await getUserNominees(user._id);
      setNominees(response.data || []);
    } catch (err) {
      console.error('Failed to fetch nominees:', err);
    }
  };

  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const DocumentSection = ({ title, documents }) => (
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="text-lg font-medium text-gray-900 mb-4">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <FaFileImage className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                <p className="text-xs text-gray-500">{doc.description}</p>
              </div>
            </div>
            <button
              onClick={() => onManageDocuments(user, doc.type, 'view')}
              className="text-teal-600 hover:text-teal-700 p-1"
              title={`View ${doc.name}`}
            >
              <FaEye className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Details & Documents */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <img
                      className="h-16 w-16 rounded-full object-cover"
                      src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.personalDetails?.fullName || 'User')}&background=0D9488&color=fff`}
                      alt={user.personalDetails?.fullName}
                    />
                    <button
                      onClick={() => onManageDocuments(user, 'profilePhoto', 'view')}
                      className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-1 rounded-full hover:bg-teal-700"
                      title="View Profile Photo"
                    >
                      <FaEye className="h-3 w-3" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.personalDetails?.fullName || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{user.userType}</p>
                    <p className="text-xs text-gray-400">User ID: {user.userId}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Full Name:</span>
                    <p className="text-sm text-gray-900 mt-1">{user.personalDetails?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Date of Birth:</span>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(user.personalDetails?.dateOfBirth)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Age:</span>
                    <p className="text-sm text-gray-900 mt-1">{user.personalDetails?.age || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Gender:</span>
                    <p className="text-sm text-gray-900 mt-1">{user.personalDetails?.sex || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Aadhaar Number:</span>
                    <p className="text-sm text-gray-900 mt-1">{user.personalDetails?.aadhaarNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Phone:</span>
                    <p className="text-sm text-gray-900 mt-1">{user.personalDetails?.phone || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <p className="text-sm text-gray-900 mt-1">{user.personalDetails?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Document Sections */}
              <DocumentSection
                title="Aadhaar Documents"
                documents={[
                  {
                    name: 'Aadhaar Front',
                    description: 'Front side of Aadhaar card',
                    type: 'aadhaarFront',
                    url: user.personalDetails?.aadhaarFrontUrl
                  },
                  {
                    name: 'Aadhaar Back',
                    description: 'Back side of Aadhaar card',
                    type: 'aadhaarBack',
                    url: user.personalDetails?.aadhaarBackUrl
                  }
                ]}
              />

              {/* Nominees Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Nominees ({nominees.length})</h4>
                  <button
                    onClick={() => onManageNominees(user)}
                    className="px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <FaUsers className="h-4 w-4" />
                    Manage Nominees
                  </button>
                </div>
                
                {nominees.length === 0 ? (
                  <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <FaUser className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No nominees added</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {nominees.map((nominee) => (
                      <div key={nominee._id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-900 flex items-center gap-2">
                              {nominee.name}
                              {nominee.isPrimary && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  Primary
                                </span>
                              )}
                            </h5>
                            <p className="text-sm text-gray-600">Relation: {nominee.relation}</p>
                            {nominee.age && <p className="text-sm text-gray-600">Age: {nominee.age}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Employment Details */}
              {(user.employmentDetails?.state || user.userType === 'EMPLOYEE') && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    {user.userType === 'EMPLOYEE' ? 'Employment Details' : 'Service Details'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">State:</span>
                      <p className="text-sm text-gray-900 mt-1">{user.employmentDetails?.state || 'N/A'}</p>
                    </div>
                    {user.userType === 'EMPLOYEE' && (
                      <>
                        <div>
                          <span className="text-sm font-medium text-gray-700">District:</span>
                          <p className="text-sm text-gray-900 mt-1">{user.employmentDetails?.district || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Organisation:</span>
                          <p className="text-sm text-gray-900 mt-1">{user.employmentDetails?.organisation || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Department:</span>
                          <p className="text-sm text-gray-900 mt-1">{user.employmentDetails?.department || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Designation:</span>
                          <p className="text-sm text-gray-900 mt-1">{user.employmentDetails?.designation || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Date of Joining:</span>
                          <p className="text-sm text-gray-900 mt-1">{formatDate(user.employmentDetails?.dateOfJoining)}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-700">Date of Retirement:</span>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(user.employmentDetails?.dateOfRetirement)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {user.bankDetails && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Account Number:</span>
                      <p className="text-sm text-gray-900 mt-1">{user.bankDetails.accountNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Bank Name:</span>
                      <p className="text-sm text-gray-900 mt-1">{user.bankDetails.bankName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Branch Name:</span>
                      <p className="text-sm text-gray-900 mt-1">{user.bankDetails.branchName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">IFSC Code:</span>
                      <p className="text-sm text-gray-900 mt-1">{user.bankDetails.ifscCode || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">UPI ID:</span>
                      <p className="text-sm text-gray-900 mt-1">{user.bankDetails.upiId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Details & Financial Info */}
            <div className="space-y-6">
              {/* Account Status */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Account Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Identifier:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {user.ehrmsCode || user.pensionerNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Member Since:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatDate(user.joiningDate)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Verified:</span>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Admin:</span>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.isAdmin ? 'Administrator' : 'User'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Credit Score:</span>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      user.creditScore >= 700 ? 'bg-green-100 text-green-800' :
                      user.creditScore >= 600 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.creditScore || 500}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Donation Shortfall:</span>
                    <span className="text-sm font-medium text-gray-900">
                      ₹{user.donationShortfall || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Donations:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.totalDonationsCompleted || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Admin Users Component
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    userType: '',
    isVerified: '',
    isActive: ''
  });
  const [actionLoading, setActionLoading] = useState(null);
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showVerificationConfirm, setShowVerificationConfirm] = useState(false);
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const [showDocumentManagement, setShowDocumentManagement] = useState(false);
  const [showNomineeManagement, setShowNomineeManagement] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers(filters);
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Action handlers
  const handleStatusToggle = async (user, newStatus) => {
    try {
      setActionLoading(`status-${user._id}`);
      await updateUserStatus(user._id, newStatus);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
      setShowStatusConfirm(false);
      setSelectedUser(null);
    }
  };

  const handleVerificationToggle = async (user, newStatus) => {
    try {
      setActionLoading(`verify-${user._id}`);
      await updateUserVerification(user._id, newStatus);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update verification status');
    } finally {
      setActionLoading(null);
      setShowVerificationConfirm(false);
      setSelectedUser(null);
    }
  };

  const handleMakeAdmin = async (user, newStatus) => {
    try {
      setActionLoading(`admin-${user._id}`);
      await makeUserAdmin(user._id, newStatus);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update admin status');
    } finally {
      setActionLoading(null);
      setShowAdminConfirm(false);
      setSelectedUser(null);
    }
  };

  const handleResetPassword = async (password) => {
    try {
      setActionLoading(`password-${selectedUser._id}`);
      await resetUserPassword(selectedUser._id, password);
      setError(null);
      setError({ type: 'success', message: 'Password reset successfully' });
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to reset password' });
    } finally {
      setActionLoading(null);
      setShowResetPassword(false);
      setSelectedUser(null);
    }
  };

  const handleUpdateUser = async (userId, updateData) => {
    try {
      setActionLoading(`edit-${userId}`);
      await updateUserDetails(userId, updateData);
      await fetchUsers();
      setShowEditUser(false);
      setSelectedUser(null);
      setError({ type: 'success', message: 'User details updated successfully' });
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to update user details' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDocumentUpdate = async (userId, formData) => {
    try {
      setActionLoading(`documents-${userId}`);
      await updateUserDocuments(userId, formData);
      await fetchUsers();
      setShowDocumentManagement(false);
      setSelectedUser(null);
      setError({ type: 'success', message: 'Document updated successfully' });
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to update document' });
    } finally {
      setActionLoading(null);
    }
  };

  // Nominee handlers
  const handleSaveNominee = async (userId, nomineeData) => {
    try {
      await createOrUpdateNominee(userId, nomineeData);
      setError({ type: 'success', message: 'Nominee saved successfully' });
      return true;
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to save nominee' });
      return false;
    }
  };

  const handleDeleteNominee = async (userId, nomineeId) => {
    try {
      await deleteNominee(userId, nomineeId);
      setError({ type: 'success', message: 'Nominee deleted successfully' });
      return true;
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to delete nominee' });
      return false;
    }
  };

  const handleUpdateNomineeDocuments = async (userId, nomineeId, formData) => {
    try {
      await updateNomineeDocuments(userId, nomineeId, formData);
      setError({ type: 'success', message: 'Nominee document updated successfully' });
      return true;
    } catch (err) {
      setError({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to update nominee document' });
      return false;
    }
  };

  // Modal open handlers
  const openStatusConfirm = (user) => {
    setSelectedUser(user);
    setShowStatusConfirm(true);
  };

  const openVerificationConfirm = (user) => {
    setSelectedUser(user);
    setShowVerificationConfirm(true);
  };

  const openAdminConfirm = (user) => {
    setSelectedUser(user);
    setShowAdminConfirm(true);
  };

  const openResetPassword = (user) => {
    setSelectedUser(user);
    setShowResetPassword(true);
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const openEditUser = (user) => {
    setSelectedUser(user);
    setShowEditUser(true);
  };

  const openDocumentManagement = (user) => {
    setSelectedUser(user);
    setShowDocumentManagement(true);
  };

  const openNomineeManagement = (user) => {
    setSelectedUser(user);
    setShowNomineeManagement(true);
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      userType: '',
      isVerified: '',
      isActive: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, EHRMS, or phone..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Type
            </label>
            <select
              value={filters.userType}
              onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Types</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="PENSIONER">Pensioner</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification
            </label>
            <select
              value={filters.isVerified}
              onChange={(e) => setFilters(prev => ({ ...prev, isVerified: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All</option>
              <option value="true">Verified</option>
              <option value="false">Not Verified</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            Showing {users.users?.length || 0} of {users.total || 0} users
          </span>
          <button
            onClick={clearFilters}
            className="text-sm text-teal-600 hover:text-teal-700"
          >
            Clear Filters
          </button>
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
                <FaCheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <FaExclamationTriangle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <p>{error.message || error}</p>
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

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.users?.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.personalDetails?.fullName || 'User')}&background=0D9488&color=fff`}
                              alt={user.personalDetails?.fullName}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.personalDetails?.fullName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.ehrmsCode || user.pensionerNumber} • {user.userType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{user.personalDetails?.phone || 'N/A'}</div>
                        <div className="text-gray-500">{user.personalDetails?.email || 'No email'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openStatusConfirm(user)}
                          disabled={actionLoading === `status-${user._id}`}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } disabled:opacity-50 transition-colors`}
                        >
                          {actionLoading === `status-${user._id}` ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                          ) : user.isActive ? (
                            <>
                              <FaToggleOn className="mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <FaToggleOff className="mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openVerificationConfirm(user)}
                          disabled={actionLoading === `verify-${user._id}`}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.isVerified
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          } disabled:opacity-50 transition-colors`}
                        >
                          {actionLoading === `verify-${user._id}` ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                          ) : user.isVerified ? (
                            <>
                              <FaCheckCircle className="mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="mr-1" />
                              Not Verified
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openAdminConfirm(user)}
                          disabled={actionLoading === `admin-${user._id}`}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.isAdmin
                              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          } disabled:opacity-50 transition-colors`}
                        >
                          {actionLoading === `admin-${user._id}` ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                          ) : user.isAdmin ? (
                            <>
                              <FaUserShield className="mr-1" />
                              Admin
                            </>
                          ) : (
                            <>
                              <FaUserShield className="mr-1" />
                              User
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openResetPassword(user)}
                          disabled={actionLoading === `password-${user._id}`}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50 transition-colors p-1"
                          title="Reset Password"
                        >
                          <FaKey className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openUserDetails(user)}
                          className="text-teal-600 hover:text-teal-900 transition-colors p-1"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditUser(user)}
                          className="text-gray-600 hover:text-gray-900 transition-colors p-1"
                          title="Edit User"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDocumentManagement(user)}
                          className="text-purple-600 hover:text-purple-900 transition-colors p-1"
                          title="Manage Documents"
                        >
                          <FaImage className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openNomineeManagement(user)}
                          className="text-orange-600 hover:text-orange-900 transition-colors p-1"
                          title="Manage Nominees"
                        >
                          <FaUsers className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {users.totalPages > 1 && (
              <div className="bg-white px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {users.currentPage} of {users.totalPages} • {users.total} total users
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={filters.page === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={filters.page >= users.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showStatusConfirm}
        onClose={() => setShowStatusConfirm(false)}
        onConfirm={() => handleStatusToggle(selectedUser, !selectedUser?.isActive)}
        title={selectedUser?.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${selectedUser?.isActive ? 'deactivate' : 'activate'} ${selectedUser?.personalDetails?.fullName}? ${selectedUser?.isActive ? 'The user will not be able to access their account.' : 'The user will be able to access their account again.'}`}
        confirmText={selectedUser?.isActive ? 'Deactivate' : 'Activate'}
        confirmColor={selectedUser?.isActive ? 'bg-red-600' : 'bg-green-600'}
      />

      <ConfirmationModal
        isOpen={showVerificationConfirm}
        onClose={() => setShowVerificationConfirm(false)}
        onConfirm={() => handleVerificationToggle(selectedUser, !selectedUser?.isVerified)}
        title={selectedUser?.isVerified ? 'Unverify User' : 'Verify User'}
        message={`Are you sure you want to ${selectedUser?.isVerified ? 'unverify' : 'verify'} ${selectedUser?.personalDetails?.fullName}? ${selectedUser?.isVerified ? 'The user will need to be verified again to access certain features.' : 'The user will gain access to all platform features.'}`}
        confirmText={selectedUser?.isVerified ? 'Unverify' : 'Verify'}
        confirmColor={selectedUser?.isVerified ? 'bg-yellow-600' : 'bg-green-600'}
      />

      <ConfirmationModal
        isOpen={showAdminConfirm}
        onClose={() => setShowAdminConfirm(false)}
        onConfirm={() => handleMakeAdmin(selectedUser, !selectedUser?.isAdmin)}
        title={selectedUser?.isAdmin ? 'Remove Admin Privileges' : 'Grant Admin Privileges'}
        message={`Are you sure you want to ${selectedUser?.isAdmin ? 'remove admin privileges from' : 'grant admin privileges to'} ${selectedUser?.personalDetails?.fullName}? ${selectedUser?.isAdmin ? 'They will lose access to the admin panel.' : 'They will gain full access to the admin panel and system management.'}`}
        confirmText={selectedUser?.isAdmin ? 'Remove Admin' : 'Make Admin'}
        confirmColor="bg-purple-600"
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
        onConfirm={handleResetPassword}
        userName={selectedUser?.personalDetails?.fullName}
      />

      {/* Enhanced User Details Modal */}
      <UserDetailsModal
        isOpen={showUserDetails}
        onClose={() => setShowUserDetails(false)}
        user={selectedUser}
        onManageDocuments={openDocumentManagement}
        onManageNominees={openNomineeManagement}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditUser}
        onClose={() => setShowEditUser(false)}
        onSave={handleUpdateUser}
        user={selectedUser}
        loading={actionLoading?.startsWith('edit-')}
      />

      {/* Document Management Modal */}
      <DocumentManagementModal
        isOpen={showDocumentManagement}
        onClose={() => setShowDocumentManagement(false)}
        onUpdate={handleDocumentUpdate}
        user={selectedUser}
        loading={actionLoading?.startsWith('documents-')}
      />

      {/* Nominee Management Modal */}
      <NomineeManagementModal
        isOpen={showNomineeManagement}
        onClose={() => setShowNomineeManagement(false)}
        user={selectedUser}
        onSaveNominee={handleSaveNominee}
        onDeleteNominee={handleDeleteNominee}
        onUpdateNomineeDocuments={handleUpdateNomineeDocuments}
      />
    </div>
  );
};

export default AdminUsers;