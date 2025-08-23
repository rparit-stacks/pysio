"use client";
import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getTherapistAvailability, updateAvailabilityTemplate, addSpecificAvailability, removeSpecificAvailability } from "@/lib/actions/availability";
import { Clock, Calendar, Plus, X, Save, Trash2 } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
];

export default function AvailabilityPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyTemplate, setWeeklyTemplate] = useState({});
  const [specificAvailability, setSpecificAvailability] = useState([]);
  const [showAddSpecific, setShowAddSpecific] = useState(false);
  const [newSpecificDate, setNewSpecificDate] = useState("");
  const [newSpecificStartTime, setNewSpecificStartTime] = useState("");
  const [newSpecificEndTime, setNewSpecificEndTime] = useState("");
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

        // Fetch availability data
        const availabilityRes = await getTherapistAvailability(u.id);
        console.log('Availability response:', availabilityRes);
        
        if (availabilityRes.success) {
          setWeeklyTemplate(availabilityRes.data.weeklyTemplate || {});
          setSpecificAvailability(availabilityRes.data.specificAvailability || []);
        } else {
          console.error('Failed to fetch availability:', availabilityRes.error);
          setMessage(availabilityRes.error || 'Failed to fetch availability data');
        }
              } catch (error) {
          console.error("Error fetching data:", error);
          setMessage("Error loading availability data: " + error.message);
        } finally {
          setLoading(false);
        }
    };

    fetchData();
  }, []);

  const handleTemplateChange = (day, field, value) => {
    setWeeklyTemplate(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSaveTemplate = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      console.log('Saving weekly template:', weeklyTemplate);
      const result = await updateAvailabilityTemplate(user.id, weeklyTemplate);
      console.log('Save result:', result);
      
      if (result.success) {
        setMessage("Weekly availability updated successfully");
      } else {
        setMessage(result.error || "Failed to update availability");
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setMessage("Error updating availability: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSpecific = async () => {
    if (!newSpecificDate || !newSpecificStartTime || !newSpecificEndTime) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const result = await addSpecificAvailability(user.id, {
        date: newSpecificDate,
        startTime: newSpecificStartTime,
        endTime: newSpecificEndTime,
        isAvailable: true
      });
      
      if (result.success) {
        // Refresh specific availability
        const updated = await getTherapistAvailability(user.id);
        if (updated.success) {
          setSpecificAvailability(updated.data.specificAvailability || []);
        }
        setShowAddSpecific(false);
        setNewSpecificDate("");
        setNewSpecificStartTime("");
        setNewSpecificEndTime("");
        setMessage("Specific availability added successfully");
      } else {
        setMessage(result.error || "Failed to add specific availability");
      }
    } catch (error) {
      setMessage("Error adding specific availability");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSpecific = async (id) => {
    if (!confirm("Are you sure you want to remove this specific availability?")) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const result = await removeSpecificAvailability(id);
      if (result.success) {
        // Refresh specific availability
        const updated = await getTherapistAvailability(user.id);
        if (updated.success) {
          setSpecificAvailability(updated.data.specificAvailability || []);
        }
        setMessage("Specific availability removed successfully");
      } else {
        setMessage(result.error || "Failed to remove specific availability");
      }
    } catch (error) {
      setMessage("Error removing specific availability");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading availability...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Availability Management</h1>
              <p className="text-gray-600 mt-1">Set your weekly schedule and specific availability</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddSpecific(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Specific Date
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-lg mb-6 flex justify-between items-center ${
            message.includes('successfully') || message.includes('Success')
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <span>{message}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Weekly Template */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule Template</h2>
            <button
              onClick={handleSaveTemplate}
              disabled={saving}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Template"}
            </button>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {DAYS_OF_WEEK.map((day) => (
                  <tr key={day.key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{day.label}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={weeklyTemplate[day.key]?.isAvailable || false}
                          onChange={(e) => handleTemplateChange(day.key, 'isAvailable', e.target.checked)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Available</span>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={weeklyTemplate[day.key]?.startTime || '09:00'}
                        onChange={(e) => handleTemplateChange(day.key, 'startTime', e.target.value)}
                        disabled={!weeklyTemplate[day.key]?.isAvailable}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                      >
                        {TIME_SLOTS.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={weeklyTemplate[day.key]?.endTime || '17:00'}
                        onChange={(e) => handleTemplateChange(day.key, 'endTime', e.target.value)}
                        disabled={!weeklyTemplate[day.key]?.isAvailable}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                      >
                        {TIME_SLOTS.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.key} className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-3">{day.label}</div>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={weeklyTemplate[day.key]?.isAvailable || false}
                      onChange={(e) => handleTemplateChange(day.key, 'isAvailable', e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available</span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                      <select
                        value={weeklyTemplate[day.key]?.startTime || '09:00'}
                        onChange={(e) => handleTemplateChange(day.key, 'startTime', e.target.value)}
                        disabled={!weeklyTemplate[day.key]?.isAvailable}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                      >
                        {TIME_SLOTS.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">End Time</label>
                      <select
                        value={weeklyTemplate[day.key]?.endTime || '17:00'}
                        onChange={(e) => handleTemplateChange(day.key, 'endTime', e.target.value)}
                        disabled={!weeklyTemplate[day.key]?.isAvailable}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                      >
                        {TIME_SLOTS.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Specific Availability */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Specific Date Availability</h2>
          
          {specificAvailability.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No specific dates set</h3>
              <p className="text-gray-500 mb-4">Add specific availability for dates that differ from your weekly template</p>
            </div>
          ) : (
            <div className="space-y-3">
              {specificAvailability.map((sa) => (
                <div key={sa.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{new Date(sa.date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{sa.startTime} - {sa.endTime}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      sa.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {sa.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveSpecific(sa.id)}
                    disabled={saving}
                    className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                    title="Remove specific availability"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Specific Availability Modal */}
        {showAddSpecific && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Specific Availability</h3>
                <button
                  onClick={() => setShowAddSpecific(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newSpecificDate}
                    onChange={(e) => setNewSpecificDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <select
                      value={newSpecificStartTime}
                      onChange={(e) => setNewSpecificStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select time</option>
                      {TIME_SLOTS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <select
                      value={newSpecificEndTime}
                      onChange={(e) => setNewSpecificEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select time</option>
                      {TIME_SLOTS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddSpecific(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSpecific}
                  disabled={!newSpecificDate || !newSpecificStartTime || !newSpecificEndTime || saving}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
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