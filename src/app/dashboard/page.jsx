"use client";
import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import DashboardLayout from "../components/DashboardLayout";
import { 
  Calendar, 
  Users, 
  Star, 
  TrendingUp, 
  Clock,
  Activity
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const u = await getCurrentUser();
        if (!u) {
          window.location.href = "/login";
          return;
        }
        setUser(u);
        
        // Fetch real stats from database
        if (u.role.name === "physiotherapist") {
          try {
            // Import actions dynamically to avoid circular dependencies
            const { getTherapistReviews } = await import("@/lib/actions/reviews");
            const { getBookingsByTherapistUserId } = await import("@/lib/actions/booking");
            
            // Fetch reviews for rating stats
            const reviewsResult = await getTherapistReviews(u.id);
            let averageRating = 0;
            let totalReviews = 0;
            
            if (reviewsResult.success && reviewsResult.data.stats) {
              averageRating = reviewsResult.data.stats.averageRating || 0;
              totalReviews = reviewsResult.data.stats.totalReviews || 0;
            }
            
            // Fetch bookings for booking stats
            let totalBookings = 0;
            let pendingBookings = 0;
            let completedBookings = 0;
            let totalRevenue = 0;
            
            try {
              const bookingsResult = await getBookingsByTherapistUserId(u.id);
              if (bookingsResult.success && bookingsResult.data) {
                const bookings = bookingsResult.data;
                totalBookings = bookings.length;
                pendingBookings = bookings.filter(b => b.status?.toLowerCase() === 'pending').length;
                completedBookings = bookings.filter(b => b.status?.toLowerCase() === 'completed').length;
                
                // Calculate revenue from completed bookings (assuming each booking has a fee)
                totalRevenue = completedBookings * 65; // Average session fee
              }
            } catch (bookingError) {
              console.log("Booking data not available:", bookingError);
            }
            
            setStats({
              totalBookings,
              pendingBookings,
              completedBookings,
              totalRevenue,
              averageRating: Math.round(averageRating * 10) / 10,
              totalReviews
            });
          } catch (error) {
            console.log("Error fetching stats:", error);
            // Set empty stats if there's an error
            setStats({
              totalBookings: 0,
              pendingBookings: 0,
              completedBookings: 0,
              totalRevenue: 0,
              averageRating: 0,
              totalReviews: 0
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isTherapist = user?.role?.name === "physiotherapist";

  const quickActions = [
    {
      name: "View Bookings",
      href: isTherapist ? "/dashboard/bookings" : "/dashboard/my-bookings",
      icon: Calendar,
      color: "bg-blue-500",
      description: isTherapist ? "Manage patient appointments" : "View your appointments"
    },
    {
      name: "Edit Profile",
      href: "/dashboard/profile",
      icon: Users,
      color: "bg-emerald-500",
      description: "Update your profile information"
    },
    ...(isTherapist ? [
      {
        name: "Set Availability",
        href: "/dashboard/availability",
        icon: Clock,
        color: "bg-purple-500",
        description: "Manage your schedule"
      },
      {
        name: "View Reviews",
        href: "/dashboard/reviews",
        icon: Star,
        color: "bg-yellow-500",
        description: "See patient feedback"
      }
    ] : [])
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 h-full">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome back, {isTherapist ? 'Dr. ' : ''}{user?.firstName}! 👋
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {isTherapist 
                ? "Here's an overview of your practice and patient interactions."
                : "Here's your appointment overview and account details."
              }
            </p>
          </div>

          {/* Stats Grid - Only for therapists */}
          {isTherapist && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">All time bookings</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">Awaiting your response</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600">€{stats.totalRevenue}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">Estimated total</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-3xl font-bold text-yellow-500">{stats.averageRating}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">{stats.totalReviews} reviews</span>
              </div>
            </div>
          </div>
        )}

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.name}
                  href={action.href}
                  className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{action.name}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </a>
              );
            })}
          </div>
        </div>

        {/* Recent Activity - Only for therapists */}
        {isTherapist && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                <p className="text-gray-500">Your recent bookings and interactions will appear here</p>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 