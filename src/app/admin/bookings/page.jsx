'use client';

import { useState, useEffect } from 'react';
import AdminDashboardLayout from '../../components/AdminDashboardLayout';
import { Search, Eye, Calendar, MapPin, Clock, User, UserCheck } from 'lucide-react';
import Toast from '../../components/ui/Toast';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import { getAllBookings } from '../../../lib/actions/admin';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [viewModal, setViewModal] = useState({ show: false, booking: null });

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const result = await getAllBookings();
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
        console.error('Error fetching bookings:', error);
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
    const matchesSearch = booking.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.therapistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.clinicName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <SkeletonLoader className="h-8 w-48" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <SkeletonLoader key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  const totalBookings = filteredBookings.length;
  const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = filteredBookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled').length;

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
          <div className="text-sm text-gray-600">
            {filteredBookings.length} of {bookings.length} bookings
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{confirmedBookings}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedBookings}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{cancelledBookings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by patient, therapist, booking reference, or clinic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient & Therapist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clinic & Treatment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.bookingReference}</div>
                          <div className="text-sm text-gray-500">
                            Created {new Date(booking.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.patientName}</div>
                          <div className="text-sm text-gray-500">{booking.therapistName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(booking.appointmentDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.appointmentTime} ({booking.duration} min)
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.clinicName}</div>
                          <div className="text-sm text-gray-500">{booking.treatmentType}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <div className="text-sm font-medium text-gray-900">
                            €{booking.totalAmount.toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setViewModal({ show: true, booking })}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Booking Modal */}
      {viewModal.show && viewModal.booking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setViewModal({ show: false, booking: null })} />
            <div className="relative bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
                <button
                  onClick={() => setViewModal({ show: false, booking: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Booking Information</h5>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-500">Booking Reference</label>
                        <p className="text-sm text-gray-900">{viewModal.booking.bookingReference}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(viewModal.booking.status)}`}>
                          {viewModal.booking.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Created</label>
                        <p className="text-sm text-gray-900">
                          {new Date(viewModal.booking.createdAt).toLocaleDateString()} at{' '}
                          {new Date(viewModal.booking.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Appointment Details</h5>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-500">Date & Time</label>
                        <p className="text-sm text-gray-900">
                          {new Date(viewModal.booking.appointmentDate).toLocaleDateString()} at {viewModal.booking.appointmentTime}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Duration</label>
                        <p className="text-sm text-gray-900">{viewModal.booking.duration} minutes</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Treatment Type</label>
                        <p className="text-sm text-gray-900">{viewModal.booking.treatmentType}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Patient Information</h5>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-500">Name</label>
                        <p className="text-sm text-gray-900">{viewModal.booking.patientName}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Email</label>
                        <p className="text-sm text-gray-900">{viewModal.booking.patientEmail}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Therapist Information</h5>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-500">Name</label>
                        <p className="text-sm text-gray-900">{viewModal.booking.therapistName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Clinic Information</h5>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{viewModal.booking.clinicName}</p>
                      <p className="text-xs text-gray-500">{viewModal.booking.clinicCity}</p>
                    </div>
                  </div>
                </div>

                {viewModal.booking.patientNotes && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Patient Notes</h5>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{viewModal.booking.patientNotes}</p>
                  </div>
                )}

                {viewModal.booking.therapistNotes && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Therapist Notes</h5>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{viewModal.booking.therapistNotes}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Payment Information</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Amount:</span>
                      <span className="text-sm font-medium text-gray-900">€{viewModal.booking.totalAmount.toFixed(2)}</span>
                    </div>
                    {viewModal.booking.payments.length > 0 && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-2">Payment History</label>
                        {viewModal.booking.payments.map((payment, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="text-sm text-gray-900">€{payment.amount.toFixed(2)}</span>
                              <span className="text-xs text-gray-500 ml-2">via {payment.method}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
    </AdminDashboardLayout>
  );
};

export default AdminBookingsPage;