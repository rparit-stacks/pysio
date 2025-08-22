"use client";
import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getTherapistReviews, respondToReview } from "@/lib/actions/reviews";
import { Star, MessageCircle, Calendar, User, Reply } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";

export default function ReviewsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedReview, setSelectedReview] = useState(null);
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const u = await getCurrentUser();
        if (!u || u.role.name !== "physiotherapist") {
          window.location.href = "/login";
          return;
        }
        setUser(u);

        // Fetch reviews
        const reviewsRes = await getTherapistReviews(u.id);
        if (reviewsRes.success) {
          setReviews(reviewsRes.data.reviews);
          setStats(reviewsRes.data.stats);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRespondToReview = async () => {
    if (!selectedReview || !response.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      const result = await respondToReview(selectedReview.id, response.trim());
      if (result.success) {
        // Refresh reviews
        const updated = await getTherapistReviews(user.id);
        if (updated.success) {
          setReviews(updated.data.reviews);
        }
        setSelectedReview(null);
        setResponse("");
        setMessage("Response added successfully");
      } else {
        setMessage(result.error || "Failed to add response");
      }
    } catch (error) {
      setMessage("Error adding response");
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
      />
    ));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient Reviews</h1>
                <p className="text-gray-600 mt-1">View and respond to patient feedback</p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getRatingColor(stats.averageRating || 0)}`}>
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </div>
                <div className="flex items-center justify-end gap-1 mb-1">
                  {renderStars(Math.round(stats.averageRating || 0))}
                </div>
                <div className="text-sm text-gray-500">{stats.totalReviews || 0} reviews</div>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
              {message}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.fiveStarCount || 0}</div>
              <div className="text-sm text-gray-600">5 Star Reviews</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">{stats.fourStarCount || 0}</div>
              <div className="text-sm text-gray-600">4 Star Reviews</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{stats.threeStarCount || 0}</div>
              <div className="text-sm text-gray-600">3 Star Reviews</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-600">{(stats.twoStarCount || 0) + (stats.oneStarCount || 0)}</div>
              <div className="text-sm text-gray-600">Low Ratings</div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All Reviews</h2>

            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Patient reviews will appear here once you start receiving feedback</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {review.patient.firstName} {review.patient.lastName}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="ml-1 text-sm font-medium text-gray-700">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>

                    {review.comment && (
                      <div className="mb-3">
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    )}

                    {review.therapistResponse ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Reply className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-800">Your Response</span>
                        </div>
                        <p className="text-emerald-700 text-sm">{review.therapistResponse}</p>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="text-emerald-600 hover:text-emerald-800 text-sm font-medium flex items-center gap-1"
                        >
                          <Reply className="h-3 w-3" />
                          Respond to this review
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Response Modal */}
          {selectedReview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Respond to Review</h3>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{selectedReview.patient.firstName}</span>
                    <div className="flex items-center gap-1">
                      {renderStars(selectedReview.rating)}
                    </div>
                  </div>
                  {selectedReview.comment && (
                    <p className="text-sm text-gray-600">{selectedReview.comment}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Thank you for your feedback..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRespondToReview}
                    disabled={!response.trim() || saving}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Sending..." : "Send Response"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}