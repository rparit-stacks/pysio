"use client";
import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import DashboardLayout from "../../components/DashboardLayout";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { Calendar, Clock, MapPin, User, Phone, Mail } from "lucide-react";

export default function TherapistBookingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [updatingBooking, setUpdatingBooking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const u = await getCurrentUser();
        if (!u || u.role.name !== "physiotherapist") {
          window.location.href = "/login";
          return;
        }
        setUser(u);

        // Fetch therapist's bookings from database
        try {
          const { getBookingsByTherapistUserId } = await import("@/lib/actions/booking");
          const bookingsResult = await getBookingsByTherapistUserId(u.id);
          if (bookingsResult.success) {
            setBookings(bookingsResult.data || []);
          } else {
            console.log("No bookings found:", bookingsResult.error);
            setBookings([]);
          }
        } catch (bookingError) {
          console.log("Error fetching bookings:", bookingError);
          setBookings([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    // Re-run fetch logic here
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      setUpdatingBooking(bookingId);
      
      const { confirmBooking, declineBooking, completeBooking } = await import("@/lib/actions/booking");
      
      let result;
      switch (action) {
        case 'confirm':
          result = await confirmBooking(bookingId);
          break;
        case 'decline':
          result = await declineBooking(bookingId);
          break;
        case 'complete':
          result = await completeBooking(bookingId);
          break;
        default:
          throw new Error('Invalid action');
      }

      if (result.success) {
        // Update the booking in the local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: result.data.status.name }
              : booking
          )
        );
        
        // Show success message
        alert(`Booking ${action}ed successfully!`);
      } else {
        alert(`Failed to ${action} booking: ${result.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      alert(`Error ${action}ing booking. Please try again.`);
    } finally {
      setUpdatingBooking(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Loading patient bookings...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <ErrorMessage message={error} onRetry={retryFetch} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Bookings</h1>
              <p className="text-gray-600 mt-1">Manage your patient appointments</p>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-6">You don't have any patient appointments yet</p>
              <div className="text-sm text-gray-500">
                <p>Patients can book appointments with you through the platform.</p>
                <p>Make sure your availability is set up in the Availability section.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="font-semibold text-gray-900 text-lg">{booking.patient.firstName} {booking.patient.lastName}</span>
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          <strong>Booking Ref:</strong> {booking.bookingReference}
                          {booking.treatmentType && (
                            <span className="ml-4">
                              <strong>Treatment:</strong> {booking.treatmentType}
                            </span>
                          )}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(booking.appointmentDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{booking.appointmentTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.clinic?.name || 'Unknown Clinic'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{booking.patient.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-emerald-600 font-bold">€</span>
                          <span>€{booking.totalAmount || '0'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Payment: {booking.paymentStatus || 'unpaid'}
                          </span>
                        </div>
                      </div>

                      {booking.patientNotes && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700">
                            <strong>Patient Notes:</strong> {booking.patientNotes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleBookingAction(booking.id, 'confirm')}
                            disabled={updatingBooking === booking.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingBooking === booking.id ? 'Confirming...' : 'Confirm'}
                          </button>
                          <button 
                            onClick={() => handleBookingAction(booking.id, 'decline')}
                            disabled={updatingBooking === booking.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingBooking === booking.id ? 'Declining...' : 'Decline'}
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button 
                          onClick={() => handleBookingAction(booking.id, 'complete')}
                          disabled={updatingBooking === booking.id}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingBooking === booking.id ? 'Completing...' : 'Mark Complete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}