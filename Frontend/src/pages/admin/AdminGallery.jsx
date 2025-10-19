import { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaToggleOn, 
  FaToggleOff,
  FaUpload,
  FaImage,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';
import { 
  getGalleryPhotos, 
  uploadGalleryPhoto, 
  updateGalleryStatus, 
  deleteGalleryPhoto 
} from '../../lib/api/admin';

const AdminGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: '',
    isActive: ''
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'general'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getGalleryPhotos(filters);
      setGallery(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // Auto-dismiss messages after 5 seconds
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
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        event.target.value = ''; // Reset file input
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (PNG, JPG, JPEG, GIF)');
        event.target.value = ''; // Reset file input
        return;
      }
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadData.title.trim()) {
      setError('Please provide a title and select an image');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('title', uploadData.title.trim());
      formData.append('description', uploadData.description.trim());
      formData.append('category', uploadData.category);
      formData.append('galleryImage', selectedFile);

      await uploadGalleryPhoto(formData);
      setSuccessMessage('Image uploaded successfully!');
      setShowUploadModal(false);
      resetUploadForm();
      await fetchGallery();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadData({ title: '', description: '', category: 'general' });
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  };

  const handleStatusToggle = async (galleryId, currentStatus, title) => {
    try {
      setError(null);
      await updateGalleryStatus(galleryId, !currentStatus);
      setSuccessMessage(`Image "${title}" ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      await fetchGallery();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (galleryId, title) => {
    try {
      setError(null);
      await deleteGalleryPhoto(galleryId);
      setSuccessMessage(`Image "${title}" deleted successfully!`);
      setDeleteConfirm(null);
      await fetchGallery();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete image');
      setDeleteConfirm(null);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    resetUploadForm();
  };

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'events', label: 'Events' },
    { value: 'meetings', label: 'Meetings' },
    { value: 'activities', label: 'Activities' }
  ];

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600">Manage platform gallery and images</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <FaPlus className="h-4 w-4" />
          Upload Image
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
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
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
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ page: 1, limit: 12, category: '', isActive: '' })}
              className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="text-gray-600">Loading gallery images...</p>
          </div>
        ) : gallery.galleryItems?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaImage className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gallery images found</h3>
            <p className="text-gray-600 mb-6">
              {filters.category || filters.isActive ? 'Try adjusting your filters or' : 'Get started by'} uploading your first image.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <FaPlus className="h-4 w-4" />
              Upload Image
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {gallery.galleryItems?.map((item) => (
                <div 
                  key={item._id} 
                  className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    {!item.isActive && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-medium text-sm bg-gray-800 px-2 py-1 rounded">
                          Inactive
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate" title={item.title}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2" title={item.description}>
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span 
                        className="inline-flex px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full capitalize"
                        title={item.category}
                      >
                        {item.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStatusToggle(item._id, item.isActive, item.title)}
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
                          onClick={() => setDeleteConfirm(item)}
                          className="p-2 text-red-600 hover:text-red-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          title="Delete"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {gallery.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-200 space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-700">
                  Showing {gallery.galleryItems?.length} of {gallery.totalItems} images
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
                    Page {gallery.currentPage} of {gallery.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={filters.page >= gallery.totalPages}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Upload Gallery Image</h2>
                <button
                  onClick={closeUploadModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full p-1"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Title *
                  </label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Enter image title"
                    required
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadData.title.length}/100 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Enter image description (optional)"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadData.description.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Image *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-colors hover:border-teal-400 relative">
                    {filePreview ? (
                      <div className="space-y-2">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="mx-auto h-32 object-cover rounded"
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
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <FaUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to select an image
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required={!selectedFile}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeUploadModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile || !uploadData.title.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaUpload className="h-4 w-4" />
                        Upload
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
                    Delete Image
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "<strong>{deleteConfirm.title}</strong>"? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm._id, deleteConfirm.title)}
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

export default AdminGallery;