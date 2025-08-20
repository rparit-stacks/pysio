"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Euro,
  Filter,
  Search,
  Download,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getBookingsByTherapistUserId } from "@/lib/actions/booking";
import { therapistAcceptBooking, therapistRejectBooking, therapistRescheduleBooking, therapistDeleteBooking } from "@/lib/actions/booking";
import Link from "next/link";

const TherapistBookingsPanel = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [actionBusyId, setActionBusyId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setAuthChecking(true);
        const user = await getCurrentUser();
        
        if (!user || user.role.name !== "physiotherapist") {
          window.location.href = "/login";
          return;
        }
        
        setCurrentUser(user);
        setAuthChecking(false);
        
        setLoading(true);
        // Get bookings for this therapist using their user ID
        const result = await getBookingsByTherapistUserId(user.id);
        if (result.success) {
          setBookings(result.data);
          setFilteredBookings(result.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setAuthChecking(false);
      }
    };

    fetchData();
  }, []);

  // Filter bookings based on search and filters
  useEffect(() => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(booking => booking.paymentStatus === paymentFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.appointmentDate);
        const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
        
        switch (dateFilter) {
          case "today":
            return bookingDay.getTime() === today.getTime();
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return bookingDay >= weekAgo;
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return bookingDay >= monthAgo;
          case "upcoming":
            return bookingDay >= today;
          case "past":
            return bookingDay < today;
          default:
            return true;
        }
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, paymentFilter, dateFilter]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPaymentStatusDisplay = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case "paid":
        return {
          color: "text-green-600 bg-green-100",
          icon: <CheckCircle className="h-4 w-4" />,
          label: "Paid"
        };
      case "unpaid":
        return {
          color: "text-orange-600 bg-orange-100",
          icon: <AlertTriangle className="h-4 w-4" />,
          label: "Unpaid"
        };
      case "pending":
        return {
          color: "text-yellow-600 bg-yellow-100",
          icon: <Clock className="h-4 w-4" />,
          label: "Processing"
        };
      case "failed":
        return {
          color: "text-red-600 bg-red-100",
          icon: <XCircle className="h-4 w-4" />,
          label: "Failed"
        };
      default:
        return {
          color: "text-gray-600 bg-gray-100",
          icon: <AlertTriangle className="h-4 w-4" />,
          label: "Unknown"
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const handleAccept = async (bookingId) => {
    if (!currentUser) return;
    setActionBusyId(bookingId);
    try {
      const res = await therapistAcceptBooking(bookingId, currentUser.id);
      if (res.success) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
      } else {
        alert(res.error || 'Failed to accept booking');
      }
    } finally {
      setActionBusyId(null);
    }
  };

  const handleReject = async (bookingId) => {
    if (!currentUser) return;
    const reason = window.prompt('Reason for rejection/cancellation?', 'Scheduling conflict');
    if (reason === null) return;
    setActionBusyId(bookingId);
    try {
      const res = await therapistRejectBooking(bookingId, currentUser.id, reason);
      if (res.success) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      } else {
        alert(res.error || 'Failed to reject booking');
      }
    } finally {
      setActionBusyId(null);
    }
  };

  const handleReschedule = async (booking) => {
    if (!currentUser) return;
    const newDate = window.prompt('New date (YYYY-MM-DD):', booking.appointmentDate?.slice(0,10));
    if (!newDate) return;
    const newTime = window.prompt('New time (HH:MM, 24h):', booking.appointmentTime || '09:00');
    if (!newTime) return;
    setActionBusyId(booking.id);
    try {
      const res = await therapistRescheduleBooking(booking.id, currentUser.id, newDate, newTime);
      if (res.success) {
        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, appointmentDate: newDate, appointmentTime: newTime } : b));
      } else {
        alert(res.error || 'Failed to reschedule');
      }
    } finally {
      setActionBusyId(null);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!currentUser) return;
    const ok = window.confirm('Delete this cancelled booking permanently?');
    if (!ok) return;
    setActionBusyId(bookingId);
    try {
      const res = await therapistDeleteBooking(bookingId, currentUser.id);
      if (res.success) {
        setBookings(prev => prev.filter(b => b.id !== bookingId));
      } else {
        alert(res.error || 'Failed to delete booking');
      }
    } finally {
      setActionBusyId(null);
    }
  };

  // Show loading screen while checking authentication or loading data
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Don't render the panel content until we have a verified user
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Appointments
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, Dr. {currentUser?.firstName} {currentUser?.lastName}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-600">
                {loading ? (
                  <div className="animate-pulse bg-emerald-200 h-8 w-12 rounded"></div>
                ) : (
                  filteredBookings.length
                )}
              </div>
              <div className="text-sm text-gray-500">Total Bookings</div>
              <div className="mt-3">
                <Link href="/dashboard/profile" className="inline-block px-4 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700">Edit Profile</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? (
                    <div className="animate-pulse bg-green-200 h-6 w-8 rounded"></div>
                  ) : (
                    bookings.filter(b => {
                      const today = new Date().toDateString();
                      return new Date(b.appointmentDate).toDateString() === today;
                    }).length
                  )}
                </div>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? (
                    <div className="animate-pulse bg-blue-200 h-6 w-8 rounded"></div>
                  ) : (
                    bookings.filter(b => b.status === 'confirmed').length
                  )}
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <div className="text-2xl font-bold text-yellow-600">
                  {loading ? (
                    <div className="animate-pulse bg-yellow-200 h-6 w-8 rounded"></div>
                  ) : (
                    bookings.filter(b => b.status === 'pending').length
                  )}
                </div>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <div className="text-2xl font-bold text-emerald-600">
                  {loading ? (
                    <div className="animate-pulse bg-emerald-200 h-6 w-16 rounded"></div>
                  ) : (
                    '€' + bookings.filter(b => b.paymentStatus === 'paid')
                      .reduce((sum, b) => sum + (b.totalAmount || 0), 0).toFixed(2)
                  )}
                </div>
              </div>
              <Euro className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Patient name or booking ref..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actions
              </label>
              <button className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading your bookings...</h3>
              <p className="text-gray-500">Please wait while we fetch your appointments.</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" || paymentFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "You don't have any appointments scheduled yet."}
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const paymentDisplay = getPaymentStatusDisplay(booking.paymentStatus);
              
              return (
                <div key={booking.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.patient.firstName} {booking.patient.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Ref: {booking.bookingReference}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${paymentDisplay.color}`}>
                        {paymentDisplay.icon}
                        {paymentDisplay.label}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{formatDate(booking.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{formatTime(booking.appointmentTime)} ({booking.durationMinutes} min)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{booking.clinic.name}</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{booking.patient.phone || "No phone"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{booking.patient.email}</span>
                    </div>
                  </div>

                  {booking.patientNotes && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">Patient Notes:</span>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {booking.patientNotes}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-lg font-semibold text-gray-900">
                      €{booking.totalAmount?.toFixed(2) || "0.00"}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {booking.status === 'pending' && (
                        <button disabled={actionBusyId===booking.id} onClick={() => handleAccept(booking.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50">{actionBusyId===booking.id? 'Working...' : 'Accept'}</button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button disabled={actionBusyId===booking.id} onClick={() => handleReject(booking.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50">{actionBusyId===booking.id? 'Working...' : 'Reject'}</button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button disabled={actionBusyId===booking.id} onClick={() => handleReschedule(booking)} className="px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm disabled:opacity-50">Reschedule</button>
                      )}
                      {booking.status === 'cancelled' && (
                        <button disabled={actionBusyId===booking.id} onClick={() => handleDelete(booking.id)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50">Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistBookingsPanel;