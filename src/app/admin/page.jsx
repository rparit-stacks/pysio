'use client';

import { useState, useEffect } from 'react';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { Users, UserCheck, Calendar, CreditCard, TrendingUp, Activity } from 'lucide-react';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { getAdminDashboardStats } from '../../lib/actions/admin';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const result = await getAdminDashboardStats();
        if (result.success) {
          setStats({
            totalUsers: result.data.totalUsers,
            totalTherapists: result.data.totalTherapists,
            totalBookings: result.data.totalBookings,
            totalRevenue: result.data.totalRevenue,
            monthlyGrowth: 12.5, // This would be calculated from monthly stats
            activeBookings: result.data.totalBookings // For now, using total bookings
          });

          // Convert recent bookings to activity format
          const activities = result.data.recentBookings.map((booking, index) => ({
            id: booking.id,
            type: 'booking',
            message: `${booking.status === 'completed' ? 'Completed' : 'New'} booking by ${booking.patientName} with ${booking.therapistName}`,
            time: new Date(booking.createdAt).toLocaleDateString()
          }));

          setRecentActivity(activities);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to empty data
        setStats({
          totalUsers: 0,
          totalTherapists: 0,
          totalBookings: 0,
          totalRevenue: 0,
          monthlyGrowth: 0,
          activeBookings: 0
        });
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers?.toLocaleString() || '0',
      icon: Users,
      color: 'bg-blue-500',
      change: '+8.2%'
    },
    {
      title: 'Total Therapists',
      value: stats.totalTherapists?.toLocaleString() || '0',
      icon: UserCheck,
      color: 'bg-green-500',
      change: '+3.1%'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings?.toLocaleString() || '0',
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+15.3%'
    },
    {
      title: 'Total Revenue',
      value: `€${stats.totalRevenue?.toLocaleString() || '0'}`,
      icon: CreditCard,
      color: 'bg-yellow-500',
      change: '+12.5%'
    }
  ];

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <SkeletonLoader className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <SkeletonLoader key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of your platform's performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">{card.change}</span>
                      <span className="text-sm text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'booking' ? 'bg-blue-500' :
                    activity.type === 'therapist' ? 'bg-green-500' :
                      activity.type === 'user' ? 'bg-purple-500' :
                        'bg-yellow-500'
                    }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Bookings</span>
                <span className="text-sm font-medium text-gray-900">{stats.activeBookings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Approvals</span>
                <span className="text-sm font-medium text-gray-900">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Registrations (Today)</span>
                <span className="text-sm font-medium text-gray-900">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue (This Month)</span>
                <span className="text-sm font-medium text-gray-900">€{(stats.totalRevenue / 12).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Platform Growth</span>
                <span className="text-sm font-medium text-green-600">+{stats.monthlyGrowth}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Booking analytics chart would go here</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Revenue analytics chart would go here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboardPage;