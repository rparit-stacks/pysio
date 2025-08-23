"use client";
import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import DashboardLayout from "../../components/DashboardLayout";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { Calendar, Clock, MapPin, User } from "lucide-react";

export default function MyBookingsPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setError(null);
                const u = await getCurrentUser();
                if (!u) {
                    window.location.href = "/login";
                    return;
                }
                setUser(u);

                // Fetch user's bookings from database
                try {
                    const { getBookingsByPatient } = await import("@/lib/actions/booking");
                    const bookingsResult = await getBookingsByPatient(u.id);
                    if (bookingsResult.success) {
                        console.log("Bookings data:", bookingsResult.data);
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

    if (loading) {
        return (
            <DashboardLayout>
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <LoadingSpinner size="lg" />
                            <p className="mt-4 text-gray-600">Loading your bookings...</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="max-w-4xl mx-auto">
                    <ErrorMessage message={error} onRetry={retryFetch} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                            <p className="text-gray-600 mt-1">View and manage your appointments</p>
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {bookings.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                            <p className="text-gray-500 mb-6">You haven't made any appointments yet</p>
                            <a
                                href="/find-therapist"
                                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
                            >
                                <Calendar className="h-4 w-4" />
                                Book an Appointment
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.filter(booking => booking && booking.physiotherapist).map((booking) => (
                                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="font-semibold text-gray-900">{booking.physiotherapist}</span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{new Date(booking.appointmentDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{booking.appointmentTime}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{booking.clinic?.name || 'Clinic not specified'}</span>
                                                </div>
                                            </div>
                                            {booking.totalAmount && (
                                                <div className="mt-2 text-sm text-gray-600">
                                                    <span className="font-medium">Amount: €{booking.totalAmount}</span>
                                                    {booking.paymentStatus && (
                                                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                                            booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                            booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {booking.paymentStatus}
                                                        </span>
                                                    )}
                                                </div>
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
}