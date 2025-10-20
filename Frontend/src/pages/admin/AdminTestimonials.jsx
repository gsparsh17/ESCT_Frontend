import { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaStar,
  FaToggleOn, 
  FaToggleOff,
  FaCalendar,
  FaUser,
  FaTimes,
  FaExclamationTriangle,
  FaUpload,
  FaImage,
  FaQuoteLeft
} from 'react-icons/fa';
import { 
  getTestimonials, 
  createTestimonial, 
  updateTestimonial, 
  deleteTestimonial, 
  toggleTestimonialStatus 
} from '../../lib/api/admin';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    isActive: '',
    rating: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    company: '',
    content: '',
    rating: 5,
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTestimonials(filters);
      setTestimonials(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        event.target.value = '';
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (PNG, JPG, JPEG, GIF)');
        event.target.value = '';
        return;
      }
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) {
      setError('Name and testimonial content are required');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      // Create FormData object
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name.trim());
      submitFormData.append('position', formData.position.trim());
      submitFormData.append('company', formData.company.trim());
      submitFormData.append('content', formData.content.trim());
      submitFormData.append('rating', formData.rating.toString());
      submitFormData.append('isActive', formData.isActive.toString());
      
      // Append file with correct field name
      if (selectedFile) {
        submitFormData.append('testimonialImage', selectedFile);
      }

      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial._id, submitFormData);
        setSuccessMessage('Testimonial updated successfully!');
      } else {
        await createTestimonial(submitFormData);
        setSuccessMessage('Testimonial created successfully!');
      }

      resetForm();
      await fetchTestimonials();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save testimonial');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      position: testimonial.position || '',
      company: testimonial.company || '',
      content: testimonial.content,
      rating: testimonial.rating,
      isActive: testimonial.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (testimonialId, name) => {
    try {
      setError(null);
      await deleteTestimonial(testimonialId);
      setSuccessMessage(`Testimonial from "${name}" deleted successfully!`);
      setDeleteConfirm(null);
      await fetchTestimonials();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete testimonial');
      setDeleteConfirm(null);
    }
  };

  const handleStatusToggle = async (testimonialId, currentStatus, name) => {
    try {
      setError(null);
      await toggleTestimonialStatus(testimonialId, !currentStatus);
      setSuccessMessage(`Testimonial from "${name}" ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      await fetchTestimonials();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTestimonial(null);
    setFormData({ 
      name: '', 
      position: '', 
      company: '', 
      content: '', 
      rating: 5, 
      isActive: true 
    });
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials Management</h1>
          <p className="text-gray-600">Manage customer testimonials and reviews</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <FaPlus className="h-4 w-4" />
          Add Testimonial
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start">
            <FaExclamationTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors ml-4"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-green-800 font-medium">Success</p>
              <p className="text-green-700 mt-1">{successMessage}</p>
            </div>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="text-green-400 hover:text-green-600 transition-colors ml-4"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ page: 1, limit: 10, isActive: '', rating: '' })}
              className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="text-gray-600">Loading testimonials...</p>
          </div>
        ) : testimonials.testimonials?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaQuoteLeft className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
            <p className="text-gray-600 mb-6">
              {filters.isActive || filters.rating ? 'Try adjusting your filters or' : 'Get started by'} adding your first testimonial.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <FaPlus className="h-4 w-4" />
              Add Testimonial
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {testimonials.testimonials?.map((item) => (
                <div 
                  key={item._id} 
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col h-full">
                    {/* Quote Icon and Content */}
                    <div className="flex-1">
                      <FaQuoteLeft className="h-6 w-6 text-teal-500 mb-4" />
                      <p className="text-gray-700 italic line-clamp-4 mb-4">
                        "{item.content}"
                      </p>
                    </div>

                    {/* Author Info */}
                    <div className="flex items-start gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.signedImageUrl || item.imageUrl}
                            alt={item.name}
                            className="h-12 w-12 rounded-full object-cover"
                            onError={(e) => {
                              if (item.signedImageUrl && item.imageUrl !== item.signedImageUrl) {
                                e.target.src = item.imageUrl;
                              } else {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                            <FaUser className="h-6 w-6 text-teal-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {item.name}
                            </h4>
                            {(item.position || item.company) && (
                              <p className="text-sm text-gray-600 truncate">
                                {[item.position, item.company].filter(Boolean).join(', ')}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              {renderStars(item.rating)}
                              <span className="text-sm text-gray-500 ml-1">
                                ({item.rating}.0)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                            <button
                              onClick={() => handleStatusToggle(item._id, item.isActive, item.name)}
                              className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                item.isActive 
                                  ? 'text-green-600 hover:text-green-800 focus:ring-green-500' 
                                  : 'text-gray-400 hover:text-gray-600 focus:ring-gray-500'
                              }`}
                              title={item.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {item.isActive ? <FaToggleOn className="h-5 w-5" /> : <FaToggleOff className="h-5 w-5" />}
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-teal-600 hover:text-teal-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                              title="Edit"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(item)}
                              className="p-2 text-red-600 hover:text-red-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              title="Delete"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {testimonials.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-200 space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-700">
                  Showing {testimonials.testimonials?.length} of {testimonials.total} testimonials
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={filters.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Page {testimonials.currentPage} of {testimonials.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={filters.page >= testimonials.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Testimonial Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full p-1"
                  disabled={uploading}
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      placeholder="Enter person's name"
                      required
                      maxLength={100}
                      disabled={uploading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.name.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating *
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      required
                      disabled={uploading}
                    >
                      <option value={5}>5 Stars - Excellent</option>
                      <option value={4}>4 Stars - Very Good</option>
                      <option value={3}>3 Stars - Good</option>
                      <option value={2}>2 Stars - Fair</option>
                      <option value={1}>1 Star - Poor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      placeholder="e.g., CEO, Manager"
                      maxLength={100}
                      disabled={uploading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      placeholder="Company name"
                      maxLength={100}
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Testimonial Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="What did they say about your service/product?"
                    required
                    maxLength={500}
                    disabled={uploading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.content.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-colors hover:border-teal-400 relative">
                    {filePreview ? (
                      <div className="space-y-2">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="mx-auto h-24 w-24 rounded-full object-cover"
                        />
                        <p className="text-sm text-gray-600 truncate">
                          {selectedFile?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            URL.revokeObjectURL(filePreview);
                            setFilePreview(null);
                          }}
                          className="text-sm text-red-600 hover:text-red-700 transition-colors"
                          disabled={uploading}
                        >
                          Remove
                        </button>
                      </div>
                    ) : editingTestimonial?.imageUrl ? (
                      <div className="space-y-2">
                        <img
                          src={editingTestimonial.imageUrl}
                          alt="Current"
                          className="mx-auto h-24 w-24 rounded-full object-cover"
                        />
                        <p className="text-sm text-gray-600">Current profile photo</p>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-sm text-red-600 hover:text-red-700 transition-colors"
                          disabled={uploading}
                        >
                          Remove Current Photo
                        </button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <FaUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to select a profile photo
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 2MB
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    disabled={uploading}
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active testimonial
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !formData.name.trim() || !formData.content.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {editingTestimonial ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Delete Testimonial
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the testimonial from "<strong>{deleteConfirm.name}</strong>"? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm._id, deleteConfirm.name)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;