'use client';

import { useState, useEffect } from 'react';
import PatientDashboardLayout from '../../components/PatientDashboardLayout';
import { Calendar, Clock, MapPin, Phone, Star, X } from 'lucide-react';
import Toast from '../../components/ui/Toast';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import { getBookingsByPatient, cancelBooking } from '../../../lib/actions/booking';

const PatientBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [cancelModal, setCancelModal] = useState({ show: false, booking: null });
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        // Get patient ID from session/auth - for now using mock ID
        const patientId = 1; // Replace with actual patient ID from auth
        const result = await getBookingsByPatient(patientId);
        
        if (result.success) {
          setBookings(result.data);
        } else {
          setToast({
            show: true,
            message: result.error || 'Failed to fetch bookings',
            type: 'error'
          });
        }
      } catch (error) {
        setToast({
          show: true,
          message: 'Failed to fetch bookings',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const handleCancelBooking = async (bookingId) => {
    try {
      const patientId = 1; // Replace with actual patient ID from auth
      const result = await cancelBooking(bookingId, patientId);
      
      if (result.success) {
        // Update local state
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        ));
        
        setToast({
          show: true,
          message: 'Booking cancelled successfully',
          type: 'success'
        });
      } else {
        setToast({
          show: true,
          message: result.error || 'Failed to cancel booking',
          type: 'error'
        });
      }
      setCancelModal({ show: false, booking: null });
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to cancel booking',
        type: 'error'
      });
      setCancelModal({ show: false, booking: null });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <PatientDashboardLayout>
        <div className="space-y-6">
          <SkeletonLoader className="h-8 w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <SkeletonLoader key={i} className="h-32 w-full" />
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
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <div className="flex space-x-2">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? 'You haven\'t made any bookings yet.' : `No ${filter} bookings found.`}
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4">
                    <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {booking.physiotherapist.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.physiotherapist}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{booking.treatmentType || 'General Treatment'}</p>
                      <p className="text-xs text-gray-500">Ref: {booking.bookingReference}</p>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(booking.appointmentDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {booking.appointmentTime} ({booking.durationMinutes} minutes)
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {booking.clinic?.name}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {booking.clinic?.addressLine1}, {booking.clinic?.city?.name}
                          </div>
                          {booking.patientNotes && (
                            <div className="text-sm text-gray-600">
                              <strong>Notes:</strong> {booking.patientNotes}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded text-xs ${
                              booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                              booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              Payment: {booking.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">€{booking.totalAmount}</p>
                    <div className="mt-4 space-y-2">
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <>
                          <button
                            onClick={() => setCancelModal({ show: true, booking })}
                            className="block w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                          >
                            Cancel Booking
                          </button>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <button className="block w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
                          Write Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setCancelModal({ show: false, booking: null })} />
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Cancel Booking</h3>
                <button
                  onClick={() => setCancelModal({ show: false, booking: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to cancel your appointment with {cancelModal.booking?.therapistName}?
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setCancelModal({ show: false, booking: null })}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Keep Booking
                </button>
                <button
                  onClick={() => handleCancelBooking(cancelModal.booking.id)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Cancel Booking
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

export default PatientBookingsPage;