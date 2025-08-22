'use client';

import { useState, useEffect } from 'react';
import PatientDashboardLayout from '../../components/PatientDashboardLayout';
import { Heart, Star, MapPin, Phone, Calendar, Trash2 } from 'lucide-react';
import Toast from '../../components/ui/Toast';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

const PatientFavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        // Favorites feature not implemented in database yet
        // For now, show empty state
        setFavorites([]);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      setToast({
        show: true,
        message: 'Removed from favorites',
        type: 'success'
      });
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to remove from favorites',
        type: 'error'
      });
    }
  };

  const handleBookAppointment = (therapist) => {
    // Redirect to booking page with therapist pre-selected
    window.location.href = `/patient/book?therapist=${therapist.therapistId}`;
  };

  if (loading) {
    return (
      <PatientDashboardLayout>
        <div className="space-y-6">
          <SkeletonLoader className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <SkeletonLoader key={i} className="h-64 w-full" />
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
          <h1 className="text-2xl font-bold text-gray-900">My Favorite Therapists</h1>
          <div className="text-sm text-gray-600">
            {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No favorite therapists yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add therapists to your favorites to easily book with them again.
            </p>
            <button
              onClick={() => window.location.href = '/patient/book'}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Find Therapists
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((therapist) => (
              <div key={therapist.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={therapist.image}
                      alt={therapist.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{therapist.name}</h3>
                      <p className="text-sm text-gray-600">{therapist.specialization}</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {therapist.rating} ({therapist.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(therapist.id)}
                    className="p-2 text-red-400 hover:text-red-600"
                    title="Remove from favorites"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {therapist.clinic}, {therapist.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {therapist.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Last visit: {new Date(therapist.lastVisit).toLocaleDateString()}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Sessions:</span>
                    <span className="font-medium">{therapist.totalSessions}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">{therapist.experience}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">${therapist.price}/session</span>
                  <button
                    onClick={() => handleBookAppointment(therapist)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Book Again
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </PatientDashboardLayout>
  );
};

export default PatientFavoritesPage;