"use client";
import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getTherapistSpecializations, addTherapistSpecialization, removeTherapistSpecialization, getAllSpecializations } from "@/lib/actions/specializations";
import { Plus, X, BookOpen, Trash2 } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { ListSkeleton } from "../../components/ui/SkeletonLoader";
import { ToastProvider, useToast } from "../../components/ui/Toast";

function SpecializationsPageContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [therapistSpecializations, setTherapistSpecializations] = useState([]);
  const [allSpecializations, setAllSpecializations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { success, error: showError } = useToast();

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

        // Fetch therapist's current specializations
        const therapistSpecs = await getTherapistSpecializations(u.id);
        if (therapistSpecs.success) {
          setTherapistSpecializations(therapistSpecs.data);
        } else {
          setError(therapistSpecs.error || "Failed to load specializations");
        }

        // Fetch all available specializations
        const allSpecs = await getAllSpecializations();
        if (allSpecs.success) {
          setAllSpecializations(allSpecs.data);
        } else {
          setError(allSpecs.error || "Failed to load available specializations");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    // Re-run the fetch logic
    const fetchData = async () => {
      try {
        const u = await getCurrentUser();
        if (!u || u.role.name !== "physiotherapist") {
          window.location.href = "/login";
          return;
        }
        setUser(u);

        const therapistSpecs = await getTherapistSpecializations(u.id);
        if (therapistSpecs.success) {
          setTherapistSpecializations(therapistSpecs.data);
        } else {
          setError(therapistSpecs.error || "Failed to load specializations");
        }

        const allSpecs = await getAllSpecializations();
        if (allSpecs.success) {
          setAllSpecializations(allSpecs.data);
        } else {
          setError(allSpecs.error || "Failed to load available specializations");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  const handleAddSpecialization = async () => {
    if (!selectedSpecialization) return;
    
    setSaving(true);
    
    try {
      const result = await addTherapistSpecialization(user.id, parseInt(selectedSpecialization));
      if (result.success) {
        // Refresh specializations
        const updated = await getTherapistSpecializations(user.id);
        if (updated.success) {
          setTherapistSpecializations(updated.data);
        }
        setShowAddModal(false);
        setSelectedSpecialization("");
        success("Specialization added successfully");
      } else {
        showError(result.error || "Failed to add specialization");
      }
    } catch (error) {
      showError("Error adding specialization");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSpecialization = async (specializationId) => {
    if (!confirm("Are you sure you want to remove this specialization?")) return;
    
    setSaving(true);
    
    try {
      const result = await removeTherapistSpecialization(user.id, specializationId);
      if (result.success) {
        // Refresh specializations
        const updated = await getTherapistSpecializations(user.id);
        if (updated.success) {
          setTherapistSpecializations(updated.data);
        }
        success("Specialization removed successfully");
      } else {
        showError(result.error || "Failed to remove specialization");
      }
    } catch (error) {
      showError("Error removing specialization");
    } finally {
      setSaving(false);
    }
  };

  // Filter out already added specializations
  const availableSpecializations = allSpecializations.filter(
    spec => !therapistSpecializations.some(ts => ts.specialization.id === spec.id)
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <ListSkeleton count={3} />
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
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Specializations</h1>
              <p className="text-gray-600 mt-1">Manage your areas of expertise</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Specialization
            </button>
          </div>
        </div>



        {/* Current Specializations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Specializations</h2>
          
          {therapistSpecializations.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No specializations added</h3>
              <p className="text-gray-500 mb-4">Add your areas of expertise to help patients find you</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add Your First Specialization
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {therapistSpecializations.map((ts) => (
                <div key={ts.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{ts.specialization.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{ts.specialization.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Added: {new Date(ts.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveSpecialization(ts.specialization.id)}
                      disabled={saving}
                      className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                      title="Remove specialization"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Specialization Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Specialization</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Specialization
                </label>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Choose a specialization</option>
                  {availableSpecializations.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSpecialization}
                  disabled={!selectedSpecialization || saving}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <LoadingSpinner size="sm" />}
                  {saving ? "Adding..." : "Add"}
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

export default function SpecializationsPage() {
  return (
    <ToastProvider>
      <SpecializationsPageContent />
    </ToastProvider>
  );
}