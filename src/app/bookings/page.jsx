"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  CreditCard,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import Footer from "../components/footer";
import { getBookingsByPatient, cancelBooking } from "@/lib/actions/booking";
import { getCurrentUser } from "@/lib/auth";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (!currentUser) {
          setError('Please log in to view your bookings');
          return;
        }
        
        // Redirect physiotherapists to their own panel
        if (currentUser.role?.name === 'physiotherapist') {
          window.location.href = '/therapist-bookings';
          return;
        }
        
        // Only allow patients to view this page
        if (currentUser.role?.name !== 'patient') {
          setError('Access denied. This page is for patients only.');
          return;
        }
        
        const result = await getBookingsByPatient(currentUser.id);
        
        if (result.success) {
          setBookings(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to fetch bookings');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBookings();
  }, []);

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    if (!user) return;
    
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this booking? This action cannot be undone.'
    );
    
    if (!confirmCancel) return;

    setCancellingBookingId(bookingId);
    
    try {
      const result = await cancelBooking(bookingId, user.id);
      
      if (result.success) {
        // Update the booking status in the local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: 'cancelled' }
              : booking
          )
        );
        alert('Booking cancelled successfully');
      } else {
        alert(result.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      alert('An error occurred while cancelling the booking');
    } finally {
      setCancellingBookingId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString("en-US", {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  // Get payment status display
  const getPaymentStatusDisplay = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return {
          color: 'text-green-600 bg-green-100',
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Paid',
          bgColor: 'bg-green-50 border-green-200'
        };
      case 'pending':
        return {
          color: 'text-yellow-600 bg-yellow-100',
          icon: <AlertCircle className="h-4 w-4" />,
          label: 'Payment Pending',
          bgColor: 'bg-yellow-50 border-yellow-200'
        };
      case 'failed':
        return {
          color: 'text-red-600 bg-red-100',
          icon: <XCircle className="h-4 w-4" />,
          label: 'Payment Failed',
          bgColor: 'bg-red-50 border-red-200'
        };
      case 'unpaid':
      default:
        return {
          color: 'text-orange-600 bg-orange-100',
          icon: <AlertTriangle className="h-4 w-4" />,
          label: 'Payment Required',
          bgColor: 'bg-orange-50 border-orange-200'
        };
    }
  };

  // Get status color and icon
  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          color: 'text-yellow-600 bg-yellow-100',
          icon: <AlertCircle className="h-4 w-4" />,
          label: 'Pending'
        };
      case 'confirmed':
        return {
          color: 'text-green-600 bg-green-100',
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Confirmed'
        };
      case 'cancelled':
        return {
          color: 'text-red-600 bg-red-100',
          icon: <XCircle className="h-4 w-4" />,
          label: 'Cancelled'
        };
      case 'completed':
        return {
          color: 'text-blue-600 bg-blue-100',
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Completed'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-100',
          icon: <AlertCircle className="h-4 w-4" />,
          label: status || 'Unknown'
        };
    }
  };

  // Sort bookings by date (newest first)
  const sortedBookings = bookings.sort((a, b) => {
    const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
    const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
    return dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            View and manage your physiotherapy appointments
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-gray-600">Loading your bookings...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Bookings
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && (
          <>
            {sortedBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Bookings Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't made any appointments yet. Start by finding a therapist.
                </p>
                <a
                  href="/"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold inline-block"
                >
                  Find Therapists
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedBookings.map((booking) => {
                  const statusDisplay = getStatusDisplay(booking.status);
                  const paymentDisplay = getPaymentStatusDisplay(booking.paymentStatus);
                  
                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        {/* Booking Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {booking.physiotherapist}
                              </h3>
                              <p className="text-emerald-600 font-medium">
                                {booking.treatmentType}
                              </p>
                              <p className="text-sm text-gray-500">
                                Ref: {booking.bookingReference}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusDisplay.color}`}>
                              {statusDisplay.icon}
                              <span className="text-sm font-medium">
                                {statusDisplay.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Booking Details */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-medium">
                                  {formatDate(booking.appointmentDate)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Time</p>
                                <p className="font-medium">
                                  {formatTime(booking.appointmentTime)} ({booking.durationMinutes} mins)
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <MapPin className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="font-medium">
                                  {booking.clinic?.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {booking.clinic?.addressLine1}, {booking.clinic?.city?.name}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 flex items-center justify-center">
                                <span className="text-emerald-600 font-bold">€</span>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Cost</p>
                                <p className="font-medium">€{booking.totalAmount}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment Alert for Unpaid Bookings */}
                        {booking.paymentStatus === 'unpaid' && (
                          <div className={`rounded-lg p-4 mb-4 border-2 ${paymentDisplay.bgColor}`}>
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="font-semibold text-orange-800 mb-1">Payment Required</p>
                                <p className="text-sm text-orange-700">
                                  This booking has not been paid for yet. Please complete your payment to confirm your appointment.
                                </p>
                                <p className="text-sm text-orange-600 mt-1">
                                  Amount due: <strong>€{booking.totalAmount}</strong>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Payment Failed Alert */}
                        {booking.paymentStatus === 'failed' && (
                          <div className="rounded-lg p-4 mb-4 border-2 bg-red-50 border-red-200">
                            <div className="flex items-start gap-3">
                              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="font-semibold text-red-800 mb-1">Payment Failed</p>
                                <p className="text-sm text-red-700">
                                  Your previous payment attempt failed. Please try again to secure your appointment.
                                </p>
                                <p className="text-sm text-red-600 mt-1">
                                  Amount due: <strong>€{booking.totalAmount}</strong>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {(booking.patientNotes || booking.therapistNotes) && (
                          <div className="border-t border-gray-100 pt-4 mb-4">
                            {booking.patientNotes && (
                              <div className="mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Your Notes
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 pl-6">
                                  {booking.patientNotes}
                                </p>
                              </div>
                            )}
                            
                            {booking.therapistNotes && (
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Therapist Notes
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 pl-6">
                                  {booking.therapistNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                          {/* Payment Button for Unpaid/Failed */}
                          {(booking.paymentStatus === 'unpaid' || booking.paymentStatus === 'failed') && (
                            <button className="flex-1 min-w-[200px] bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span>Pay Now - €{booking.totalAmount}</span>
                            </button>
                          )}

                          {/* Cancel Button for Pending Status */}
                          {booking.status === 'pending' && booking.paymentStatus !== 'paid' && (
                            <button 
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={cancellingBookingId === booking.id}
                              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                            </button>
                          )}
                          
                          {/* Contact Button */}
                          <button className="px-4 py-2 border border-emerald-300 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>Contact</span>
                          </button>
                          
                          {/* Review Button for Completed */}
                          {booking.status === 'completed' && (
                            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors">
                              Leave Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BookingsPage;