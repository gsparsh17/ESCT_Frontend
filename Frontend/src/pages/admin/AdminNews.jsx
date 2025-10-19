import { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaToggleOn, 
  FaToggleOff,
  FaCalendar,
  FaUser,
  FaTimes,
  FaExclamationTriangle,
  FaUpload,
  FaImage
} from 'react-icons/fa';
import { 
  getNewsBlogs, 
  createNewsBlog, 
  updateNewsBlog, 
  deleteNewsBlog, 
  toggleNewsPublish 
} from '../../lib/api/admin';

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    isPublished: '',
    tag: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    tags: '',
    isPublished: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNewsBlogs(filters);
      setNews(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

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
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      // Create FormData object
      const submitFormData = new FormData();
      submitFormData.append('title', formData.title.trim());
      submitFormData.append('content', formData.content.trim());
      submitFormData.append('summary', formData.summary.trim());
      submitFormData.append('tags', formData.tags);
      submitFormData.append('isPublished', formData.isPublished.toString());
      
      // Append file with correct field name
      if (selectedFile) {
        submitFormData.append('newsImage', selectedFile);
      }

      if (editingNews) {
        await updateNewsBlog(editingNews._id, submitFormData);
        setSuccessMessage('News article updated successfully!');
      } else {
        await createNewsBlog(submitFormData);
        setSuccessMessage('News article created successfully!');
      }

      resetForm();
      await fetchNews();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save news article');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      summary: newsItem.summary || '',
      tags: newsItem.tags?.join(', ') || '',
      isPublished: newsItem.isPublished
    });
    setShowForm(true);
  };

  const handleDelete = async (newsId, title) => {
    try {
      setError(null);
      await deleteNewsBlog(newsId);
      setSuccessMessage(`News article "${title}" deleted successfully!`);
      setDeleteConfirm(null);
      await fetchNews();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete news article');
      setDeleteConfirm(null);
    }
  };

  const handlePublishToggle = async (newsId, currentStatus, title) => {
    try {
      setError(null);
      await toggleNewsPublish(newsId, !currentStatus);
      setSuccessMessage(`News article "${title}" ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
      await fetchNews();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingNews(null);
    setFormData({ 
      title: '', 
      content: '', 
      summary: '', 
      tags: '', 
      isPublished: true 
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News & Blogs Management</h1>
          <p className="text-gray-600">Create and manage news articles and blog posts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <FaPlus className="h-4 w-4" />
          New Article
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
              value={filters.isPublished}
              onChange={(e) => setFilters(prev => ({ ...prev, isPublished: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ page: 1, limit: 10, isPublished: '', tag: '' })}
              className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="text-gray-600">Loading news articles...</p>
          </div>
        ) : news.newsBlogs?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaImage className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No news articles found</h3>
            <p className="text-gray-600 mb-6">
              {filters.isPublished ? 'Try adjusting your filters or' : 'Get started by'} creating your first article.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <FaPlus className="h-4 w-4" />
              Create Article
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {news.newsBlogs?.map((item) => (
                <div key={item._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {item.imageUrl && (
                      <div className="lg:w-48 lg:h-32 flex-shrink-0">
                        <img
                          src={item.signedImageUrl || item.imageUrl}
                          alt={item.title}
                          className="w-full h-32 lg:h-full object-cover rounded-lg"
                          loading="lazy"
                          onError={(e) => {
                            if (item.signedImageUrl && item.imageUrl !== item.signedImageUrl) {
                              e.target.src = item.imageUrl;
                            }
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate" title={item.title}>
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2" title={item.summary}>
                            {item.summary}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handlePublishToggle(item._id, item.isPublished, item.title)}
                            className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              item.isPublished 
                                ? 'text-green-600 hover:text-green-800 focus:ring-green-500' 
                                : 'text-gray-400 hover:text-gray-600 focus:ring-gray-500'
                            }`}
                            title={item.isPublished ? 'Unpublish' : 'Publish'}
                          >
                            {item.isPublished ? <FaToggleOn className="h-5 w-5" /> : <FaToggleOff className="h-5 w-5" />}
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
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaUser className="h-3 w-3" />
                          <span>{item.author?.personalDetails?.fullName || 'Admin'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaCalendar className="h-3 w-3" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {news.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-200 space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-700">
                  Showing {news.newsBlogs?.length} of {news.total} articles
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
                    Page {news.currentPage} of {news.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={filters.page >= news.totalPages}
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

      {/* News Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingNews ? 'Edit News Article' : 'Create New Article'}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Enter article title"
                    required
                    maxLength={200}
                    disabled={uploading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.title.length}/200 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Brief summary of the article (optional)"
                    maxLength={500}
                    disabled={uploading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.summary.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={10}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Write your article content here..."
                    required
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Enter tags separated by commas (optional)"
                    disabled={uploading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate tags with commas (e.g., technology, news, update)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
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
                          disabled={uploading}
                        >
                          Remove
                        </button>
                      </div>
                    ) : editingNews?.imageUrl ? (
                      <div className="space-y-2">
                        <img
                          src={editingNews.imageUrl}
                          alt="Current"
                          className="mx-auto h-32 object-cover rounded"
                        />
                        <p className="text-sm text-gray-600">Current featured image</p>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-sm text-red-600 hover:text-red-700 transition-colors"
                          disabled={uploading}
                        >
                          Remove Current Image
                        </button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <FaUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to select a featured image
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
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    disabled={uploading}
                  />
                  <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                    Publish immediately
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
                    disabled={uploading || !formData.title.trim() || !formData.content.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {editingNews ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {editingNews ? 'Update Article' : 'Create Article'}
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
                    Delete News Article
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

export default AdminNews;