'use client';

import { useState, useEffect } from 'react';
import PatientDashboardLayout from '../../components/PatientDashboardLayout';
import { Star, Calendar, User, Edit2, Trash2 } from 'lucide-react';
import Toast from '../../components/ui/Toast';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
// Note: Patient reviews functionality would need to be implemented in database

const PatientReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [editModal, setEditModal] = useState({ show: false, review: null });
  const [editData, setEditData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // Patient reviews functionality not implemented in database yet
        // This would require a separate patient reviews table
        setReviews([]);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleEditReview = (review) => {
    setEditData({ rating: review.rating, comment: review.comment });
    setEditModal({ show: true, review });
  };

  const handleUpdateReview = async () => {
    try {
      setReviews(prev => prev.map(review => 
        review.id === editModal.review.id 
          ? { ...review, ...editData, date: new Date().toISOString().split('T')[0] }
          : review
      ));
      
      setToast({
        show: true,
        message: 'Review updated successfully',
        type: 'success'
      });
      setEditModal({ show: false, review: null });
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to update review',
        type: 'error'
      });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        setReviews(prev => prev.filter(review => review.id !== reviewId));
        setToast({
          show: true,
          message: 'Review deleted successfully',
          type: 'success'
        });
      } catch (error) {
        setToast({
          show: true,
          message: 'Failed to delete review',
          type: 'error'
        });
      }
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <PatientDashboardLayout>
        <div className="space-y-6">
          <SkeletonLoader className="h-8 w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <SkeletonLoader key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </PatientDashboardLayout>
    );
  }

  return (
    <PatientDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
          <div className="text-sm text-gray-600">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Reviews Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '0.0'}
              </div>
              <div className="flex justify-center mt-1">
                {renderStars(reviews.length > 0 ? Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) : 0)}
              </div>
              <p className="text-sm text-gray-600 mt-1">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{reviews.length}</div>
              <p className="text-sm text-gray-600 mt-1">Total Reviews</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {reviews.filter(r => r.rating >= 4).length}
              </div>
              <p className="text-sm text-gray-600 mt-1">Positive Reviews</p>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Complete your appointments to leave reviews for your therapists.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4 flex-1">
                    <img
                      src={review.therapistImage}
                      alt={review.therapistName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {review.therapistName}
                          </h3>
                          <p className="text-sm text-gray-600">{review.specialization} • {review.clinic}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">
                          Session: {new Date(review.sessionDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="mt-3 text-gray-700">{review.comment}</p>
                      
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        Reviewed on {new Date(review.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Review Modal */}
      {editModal.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setEditModal({ show: false, review: null })} />
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Review for {editModal.review?.therapistName}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  {renderStars(editData.rating, true, (rating) => setEditData(prev => ({ ...prev, rating })))}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                  </label>
                  <textarea
                    value={editData.comment}
                    onChange={(e) => setEditData(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your experience..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEditModal({ show: false, review: null })}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateReview}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Update Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </PatientDashboardLayout>
  );
};

export default PatientReviewsPage;