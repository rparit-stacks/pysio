"use client";
import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getTherapistClinics, addTherapistClinic, removeTherapistClinic, updateTherapistClinic, getAllClinics } from "@/lib/actions/clinics";
import { Plus, X, MapPin, Trash2, Edit, Building } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { ListSkeleton } from "../../components/ui/SkeletonLoader";
import { ToastProvider, useToast } from "../../components/ui/Toast";

function ClinicsPageContent() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [therapistClinics, setTherapistClinics] = useState([]);
    const [allClinics, setAllClinics] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState("");
    const [isPrimary, setIsPrimary] = useState(false);
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

                // Fetch therapist's current clinics
                const therapistClinicsRes = await getTherapistClinics(u.id);
                if (therapistClinicsRes.success) {
                    setTherapistClinics(therapistClinicsRes.data);
                } else {
                    setError(therapistClinicsRes.error || "Failed to load clinic associations");
                }

                // Fetch all available clinics
                const allClinicsRes = await getAllClinics();
                if (allClinicsRes.success) {
                    setAllClinics(allClinicsRes.data);
                } else {
                    setError(allClinicsRes.error || "Failed to load available clinics");
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
        const fetchData = async () => {
            try {
                const u = await getCurrentUser();
                if (!u || u.role.name !== "physiotherapist") {
                    window.location.href = "/login";
                    return;
                }
                setUser(u);

                const therapistClinicsRes = await getTherapistClinics(u.id);
                if (therapistClinicsRes.success) {
                    setTherapistClinics(therapistClinicsRes.data);
                } else {
                    setError(therapistClinicsRes.error || "Failed to load clinic associations");
                }

                const allClinicsRes = await getAllClinics();
                if (allClinicsRes.success) {
                    setAllClinics(allClinicsRes.data);
                } else {
                    setError(allClinicsRes.error || "Failed to load available clinics");
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

    const handleAddClinic = async () => {
        if (!selectedClinic) return;

        setSaving(true);

        try {
            const result = await addTherapistClinic(user.id, parseInt(selectedClinic), isPrimary);
            if (result.success) {
                // Refresh clinics
                const updated = await getTherapistClinics(user.id);
                if (updated.success) {
                    setTherapistClinics(updated.data);
                }
                setShowAddModal(false);
                setSelectedClinic("");
                setIsPrimary(false);
                success("Clinic association added successfully");
            } else {
                showError(result.error || "Failed to add clinic");
            }
        } catch (error) {
            showError("Error adding clinic");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveClinic = async (clinicId) => {
        if (!confirm("Are you sure you want to remove this clinic association?")) return;

        setSaving(true);

        try {
            const result = await removeTherapistClinic(user.id, clinicId);
            if (result.success) {
                // Refresh clinics
                const updated = await getTherapistClinics(user.id);
                if (updated.success) {
                    setTherapistClinics(updated.data);
                }
                success("Clinic association removed successfully");
            } else {
                showError(result.error || "Failed to remove clinic");
            }
        } catch (error) {
            showError("Error removing clinic");
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePrimary = async (clinicId, currentPrimary) => {
        setSaving(true);

        try {
            const result = await updateTherapistClinic(user.id, clinicId, { isPrimary: !currentPrimary });
            if (result.success) {
                // Refresh clinics
                const updated = await getTherapistClinics(user.id);
                if (updated.success) {
                    setTherapistClinics(updated.data);
                }
                success("Primary clinic updated successfully");
            } else {
                showError(result.error || "Failed to update clinic");
            }
        } catch (error) {
            showError("Error updating clinic");
        } finally {
            setSaving(false);
        }
    };

    // Filter out already associated clinics
    const availableClinics = allClinics.filter(
        clinic => !therapistClinics.some(tc => tc.clinic.id === clinic.id)
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
                                <h1 className="text-2xl font-bold text-gray-900">My Clinics</h1>
                                <p className="text-gray-600 mt-1">Manage your clinic associations</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Clinic
                            </button>
                        </div>
                    </div>



                    {/* Current Clinics */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Associated Clinics</h2>

                        {therapistClinics.length === 0 ? (
                            <div className="text-center py-8">
                                <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No clinic associations</h3>
                                <p className="text-gray-500 mb-4">Add clinics where you practice to help patients find you</p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    Add Your First Clinic
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {therapistClinics.map((tc) => (
                                    <div key={tc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{tc.clinic.name}</h3>
                                                    {tc.isPrimary && (
                                                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                                                            Primary
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                                    <MapPin className="h-4 w-4" />
                                                    <span className="text-sm">
                                                        {tc.clinic.addressLine1}, {tc.clinic.city.name}, {tc.clinic.city.county}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    <p>Phone: {tc.clinic.phone || "Not provided"}</p>
                                                    <p>Email: {tc.clinic.email || "Not provided"}</p>
                                                    <p>Associated since: {new Date(tc.startDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleTogglePrimary(tc.clinic.id, tc.isPrimary)}
                                                    disabled={saving}
                                                    className="text-emerald-600 hover:text-emerald-800 p-1 disabled:opacity-50"
                                                    title={tc.isPrimary ? "Remove as primary" : "Set as primary"}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveClinic(tc.clinic.id)}
                                                    disabled={saving}
                                                    className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                                                    title="Remove clinic association"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add Clinic Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-96 overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Add Clinic Association</h3>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Clinic
                                    </label>
                                    <select
                                        value={selectedClinic}
                                        onChange={(e) => setSelectedClinic(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">Choose a clinic</option>
                                        {availableClinics.map((clinic) => (
                                            <option key={clinic.id} value={clinic.id}>
                                                {clinic.name} - {clinic.city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={isPrimary}
                                            onChange={(e) => setIsPrimary(e.target.checked)}
                                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Set as primary clinic</span>
                                    </label>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddClinic}
                                        disabled={!selectedClinic || saving}
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

export default function ClinicsPage() {
    return (
        <ToastProvider>
            <ClinicsPageContent />
        </ToastProvider>
    );
}