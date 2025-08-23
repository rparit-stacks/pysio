"use client";
import { useState, useEffect } from 'react';
import AdminDashboardLayout from '../../components/AdminDashboardLayout';

const SliderManagement = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/slider');
      const data = await response.json();
      setSlides(data.slides || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      }
    } catch (error) {
      console.error('Error saving slide:', error);
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

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
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
                   Media URL (Desktop)
                 </label>
                 <input
                   type="url"
                   value={formData.mediaUrl}
                   onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                   placeholder="https://example.com/image.jpg or /slider/image.jpg"
                   required
                 />
                 <p className="text-xs text-gray-500 mt-1">
                   Supports both external URLs and local paths
                 </p>
               </div>
              
                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Media URL (Mobile) - Optional
                 </label>
                 <input
                   type="url"
                   value={formData.mobileMediaUrl}
                   onChange={(e) => setFormData({...formData, mobileMediaUrl: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                   placeholder="https://example.com/mobile-image.jpg"
                 />
                 <p className="text-xs text-gray-500 mt-1">
                   Leave empty to use desktop image for mobile
                 </p>
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
                 className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
               >
                 {editingSlide ? 'Update Slide' : 'Add Slide'}
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
