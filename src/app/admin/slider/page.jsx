"use client";
import { useState, useEffect } from 'react';
import AdminDashboardLayout from '../../components/AdminDashboardLayout';

const SliderManagement = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    mediaType: 'image',
    mediaUrl: '',
    mobileMediaUrl: '',
    buttonText: '',
    buttonUrl: '',
    order: 0,
    isActive: true
  });

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setError(null);
      const response = await fetch('/api/slider?admin=true');
      const data = await response.json();
      
      if (response.ok) {
        setSlides(data.slides || []);
      } else {
        setError(data.error || 'Failed to fetch slides');
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
      setError('Failed to fetch slides. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that desktop image is uploaded
    if (!formData.mediaUrl) {
      alert('Please upload a desktop image before saving the slide.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const url = editingSlide ? `/api/slider/${editingSlide.id}` : '/api/slider';
      const method = editingSlide ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setEditingSlide(null);
        setShowForm(false);
        setFormData({
          title: '',
          subtitle: '',
          description: '',
          mediaType: 'image',
          mediaUrl: '',
          mobileMediaUrl: '',
          buttonText: '',
          buttonUrl: '',
          order: 0,
          isActive: true
        });
        fetchSlides();
        alert(editingSlide ? 'Slide updated successfully!' : 'Slide created successfully!');
      } else {
        alert('Error: ' + (data.error || 'Failed to save slide'));
      }
    } catch (error) {
      console.error('Error saving slide:', error);
      alert('Failed to save slide. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setShowForm(true);
    setFormData({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      mediaType: slide.mediaType || 'image',
      mediaUrl: slide.mediaUrl || '',
      mobileMediaUrl: slide.mobileMediaUrl || '',
      buttonText: slide.buttonText || '',
      buttonUrl: slide.buttonUrl || '',
      order: slide.order || 0,
      isActive: slide.isActive !== false
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;
    
    try {
      const response = await fetch(`/api/slider/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSlides();
      }
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/slider/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchSlides();
      }
    } catch (error) {
      console.error('Error updating slide:', error);
    }
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image size should be less than 5MB.');
      return;
    }

    const setUploading = type === 'desktop' ? setUploadingDesktop : setUploadingMobile;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'sliderImage');
      formData.append('folder', 'slider-images');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        if (type === 'desktop') {
          setFormData(prev => ({ ...prev, mediaUrl: result.url }));
        } else {
          setFormData(prev => ({ ...prev, mobileMediaUrl: result.url }));
        }
        alert('Image uploaded successfully!');
      } else {
        alert('Failed to upload image: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchSlides}
                    className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Slider Management</h1>
          <button
            onClick={() => {
              setEditingSlide(null);
              setShowForm(true);
              setFormData({
                title: '',
                subtitle: '',
                description: '',
                mediaType: 'image',
                mediaUrl: '',
                mobileMediaUrl: '',
                buttonText: '',
                buttonUrl: '',
                order: 0,
                isActive: true
              });
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
          >
            Add New Slide
          </button>
        </div>

        {/* Form */}
        {(showForm || editingSlide) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {editingSlide ? 'Edit Slide' : 'Add New Slide'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingSlide(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Media Type
                </label>
                <select
                  value={formData.mediaType}
                  onChange={(e) => setFormData({...formData, mediaType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="gif">GIF</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desktop Image
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'desktop')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={uploadingDesktop}
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: 1920x1080px, max 5MB
                  </p>
                  {uploadingDesktop && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </div>
                  )}
                  {formData.mediaUrl && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Current image:</p>
                      <div className="relative inline-block">
                        <img 
                          src={formData.mediaUrl} 
                          alt="Desktop preview" 
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, mediaUrl: '' }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Image (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'mobile')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={uploadingMobile}
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: 768x1024px, max 5MB
                  </p>
                  {uploadingMobile && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </div>
                  )}
                  {formData.mobileMediaUrl && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Current image:</p>
                      <div className="relative inline-block">
                        <img 
                          src={formData.mobileMediaUrl} 
                          alt="Mobile preview" 
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, mobileMediaUrl: '' }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Leave empty to use desktop image for mobile
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button URL
                </label>
                <input
                  type="url"
                  value={formData.buttonUrl}
                  onChange={(e) => setFormData({...formData, buttonUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

                         <div className="flex justify-end space-x-3">
               <button
                 type="button"
                 onClick={() => {
                   setShowForm(false);
                   setEditingSlide(null);
                 }}
                 className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 disabled={submitting}
                 className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 py-2 rounded-lg flex items-center gap-2"
               >
                 {submitting ? (
                   <>
                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     {editingSlide ? 'Updating...' : 'Adding...'}
                   </>
                 ) : (
                   editingSlide ? 'Update Slide' : 'Add Slide'
                 )}
               </button>
             </div>
           </form>
         </div>
        )}

        {/* Slides List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Current Slides</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Media Type
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Preview
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Status
                   </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {slides.map((slide) => (
                  <tr key={slide.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {slide.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {slide.title || 'No Title'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {slide.subtitle || 'No Subtitle'}
                        </div>
                      </div>
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                         {slide.mediaType}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       {slide.mediaUrl && (
                         <img 
                           src={slide.mediaUrl} 
                           alt="Slide preview" 
                           className="w-16 h-12 object-cover rounded border"
                         />
                       )}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(slide.id, slide.isActive)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          slide.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {slide.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(slide)}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default SliderManagement;