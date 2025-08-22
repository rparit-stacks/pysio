'use client';

import { useState, useEffect } from 'react';
import PatientDashboardLayout from '../components/PatientDashboardLayout';
import { Calendar, Clock, Star, TrendingUp, Heart, CreditCard, User, Plus } from 'lucide-react';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { getBookingsByPatient } from '../lib/actions/booking';

const PatientDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const patientId = 1; // Replace with actual patient ID from auth
        const bookingsResult = await getBookingsByPatient(patientId);
        
        if (bookingsResult.success) {
          const bookings = bookingsResult.data;
          
          // Calculate stats
          const totalBookings = bookings.length;
          const upcomingBookings = bookings.filter(b => 
            ['pending', 'confirmed'].includes(b.status) && 
            new Date(b.appointmentDate) >= new Date()
          ).length;
          const completedSessions = bookings.filter(b => b.status === 'completed').length;
          const totalSpent = bookings
            .filter(b => b.paymentStatus === 'paid')
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

          // Get upcoming appointments
          const upcomingAppointments = bookings
            .filter(b => 
              ['pending', 'confirmed'].includes(b.status) && 
              new Date(b.appointmentDate) >= new Date()
            )
            .slice(0, 3)
            .map(b => ({
              id: b.id,
              therapistName: b.physiotherapist,
              date: b.appointmentDate,
              time: b.appointmentTime,
              clinic: b.clinic?.name,
              sessionType: 'In-person'
            }));

          // Recent activity from bookings
          const recentActivity = bookings
            .slice(0, 3)
            .map(b => ({
              id: b.id,
              type: 'booking',
              message: `Appointment ${b.status} with ${b.physiotherapist}`,
              date: b.appointmentDate,
              icon: Calendar
            }));

          setDashboardData({
            stats: {
              totalBookings,
              upcomingBookings,
              completedSessions,
              favoriteTherapists: 0, // Will implement favorites later
              totalSpent
            },
            upcomingAppointments,
            recentActivity,
            favoriteTherapists: [] // Will implement favorites later
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty data on error
        setDashboardData({
          stats: { totalBookings: 0, upcomingBookings: 0, completedSessions: 0, favoriteTherapists: 0, totalSpent: 0 },
          upcomingAppointments: [],
          recentActivity: [],
          favoriteTherapists: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <PatientDashboardLayout>
        <div className="space-y-6">
          <SkeletonLoader className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <SkeletonLoader key={i} className="h-24 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonLoader className="h-64 w-full" />
            <SkeletonLoader className="h-64 w-full" />
          </div>
        </div>
      </PatientDashboardLayout>
    );
  }

  return (
    <PatientDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600">Here's an overview of your health journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalBookings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.upcomingBookings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.completedSessions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.favoriteTherapists}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">€{dashboardData.stats.totalSpent}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <button
                onClick={() => window.location.href = '/patient/book'}
                className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Book New
              </button>
            </div>
            
            {dashboardData.upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={appointment.therapistImage}
                      alt={appointment.therapistName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{appointment.therapistName}</h3>
                      <p className="text-sm text-gray-600">{appointment.specialization}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.sessionType === 'Online' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.sessionType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Favorite Therapists */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Favorite Therapists</h2>
            <button
              onClick={() => window.location.href = '/patient/favorites'}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          
          {dashboardData.favoriteTherapists.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No favorite therapists yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.favoriteTherapists.map((therapist) => (
                <div key={therapist.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={therapist.image}
                    alt={therapist.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{therapist.name}</h3>
                    <p className="text-sm text-gray-600">{therapist.specialization}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{therapist.rating}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {therapist.totalSessions} sessions
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.href = `/patient/book?therapist=${therapist.id}`}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Book
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/patient/book'}
              className="flex items-center justify-center px-4 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book Appointment
            </button>
            <button
              onClick={() => window.location.href = '/patient/bookings'}
              className="flex items-center justify-center px-4 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            >
              <Clock className="h-5 w-5 mr-2" />
              View Bookings
            </button>
            <button
              onClick={() => window.location.href = '/patient/profile'}
              className="flex items-center justify-center px-4 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            >
              <User className="h-5 w-5 mr-2" />
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </PatientDashboardLayout>
  );
};

export default PatientDashboardPage;