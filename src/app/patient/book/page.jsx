'use client';

import { useState, useEffect, useCallback } from 'react';
import PatientDashboardLayout from '../../components/PatientDashboardLayout';
import { Search, MapPin, Star, Calendar, Clock, Filter, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Toast from '../../components/ui/Toast';
import { getAllAvailablePhysiotherapists, getAllSpecializations, getAllCities } from '../../../lib/actions/physiotherapist';
import { getTherapistAvailableSlots, getTherapistAvailableDatesForMonth } from '../../../lib/actions/availability';
import { createBooking } from '../../../lib/actions/booking';
import { getCurrentUser } from '../../../lib/auth';

const BookAppointmentPage = () => {
  const [therapists, setTherapists] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [bookingModal, setBookingModal] = useState({ show: false, therapist: null });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Fast data fetching with error handling
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user data first
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setCurrentUser(user);

      // Fetch all data in parallel for better performance
      const [therapistsResult, specializationsResult, locationsResult] = await Promise.allSettled([
        getAllAvailablePhysiotherapists(),
        getAllSpecializations(),
        getAllCities()
      ]);

      // Handle therapists data
      if (therapistsResult.status === 'fulfilled' && therapistsResult.value.success) {
        setTherapists(therapistsResult.value.data);
      } else {
        console.error('Failed to fetch therapists:', therapistsResult.reason);
        setToast({
          show: true,
          message: 'Failed to load therapists. Please refresh the page.',
          type: 'error'
        });
      }

      // Handle specializations data
      if (specializationsResult.status === 'fulfilled' && specializationsResult.value.success) {
        setSpecializations(['All Specializations', ...specializationsResult.value.data.map(s => s.name)]);
      }

      // Handle locations data
      if (locationsResult.status === 'fulfilled' && locationsResult.value.success) {
        setLocations(['All Locations', ...locationsResult.value.data.map(c => c.name)]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({
        show: true,
        message: 'Failed to load data. Please check your connection and try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter therapists based on search criteria
  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !selectedSpecialization || 
                                 selectedSpecialization === 'All Specializations' ||
                                 therapist.specialization === selectedSpecialization;
    const matchesLocation = !selectedLocation || 
                           selectedLocation === 'All Locations' ||
                           therapist.location === selectedLocation;
    
    return matchesSearch && matchesSpecialization && matchesLocation;
  });

  // Fetch available slots for a therapist and date
  const fetchAvailableSlots = useCallback(async (therapistId, date) => {
    if (!therapistId || !date) return;
    
    setLoadingSlots(true);
    try {
      const result = await getTherapistAvailableSlots(therapistId, date);
      if (result.success) {
        setAvailableSlots(result.data);
      } else {
        setToast({
          show: true,
          message: result.error || 'Failed to fetch available slots',
          type: 'error'
        });
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      setToast({
        show: true,
        message: 'Failed to fetch available slots',
        type: 'error'
      });
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // Fetch available dates for a month
  const fetchAvailableDates = useCallback(async (therapistId) => {
    if (!therapistId) return;
    
    try {
      const now = new Date();
      const result = await getTherapistAvailableDatesForMonth(therapistId, now.getFullYear(), now.getMonth() + 1);
      if (result.success) {
        setAvailableDates(result.data);
      }
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  }, []);

  // Handle booking modal open
  const handleBookAppointment = useCallback(async (therapist) => {
    setBookingModal({ show: true, therapist });
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
    
    // Pre-fetch available dates for this therapist
    await fetchAvailableDates(therapist.id);
  }, [fetchAvailableDates]);

  // Handle date selection
  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
    setSelectedTime('');
    if (date && bookingModal.therapist) {
      fetchAvailableSlots(bookingModal.therapist.id, date);
    }
  }, [bookingModal.therapist, fetchAvailableSlots]);

  // Handle time selection
  const handleTimeSelect = useCallback((time) => {
    setSelectedTime(time);
  }, []);

  // Handle booking confirmation
  const confirmBooking = useCallback(async () => {
    if (!selectedDate || !selectedTime || !bookingModal.therapist || !currentUser) {
      setToast({
        show: true,
        message: 'Please select date and time',
        type: 'error'
      });
      return;
    }

    setBookingInProgress(true);
    try {
      const therapist = bookingModal.therapist;
      const clinicId = therapist.clinics?.[0]?.id || 1;

      const bookingData = {
        patientId: currentUser.id,
        physiotherapistId: therapist.id,
        clinicId,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        durationMinutes: 60,
        totalAmount: parseFloat(therapist.price.replace('€', ''))
      };

      const result = await createBooking(bookingData);
      
      if (result.success) {
        setToast({
          show: true,
          message: `Appointment booked successfully with ${therapist.name} for ${selectedDate} at ${selectedTime}`,
          type: 'success'
        });
        setBookingModal({ show: false, therapist: null });
        setSelectedDate('');
        setSelectedTime('');
        setAvailableSlots([]);
        
        // Refresh therapists data to update availability
        fetchData();
      } else {
        setToast({
          show: true,
          message: result.error || 'Failed to book appointment',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      setToast({
        show: true,
        message: 'Failed to book appointment. Please try again.',
        type: 'error'
      });
    } finally {
      setBookingInProgress(false);
    }
  }, [selectedDate, selectedTime, bookingModal.therapist, currentUser, fetchData]);

  // Close modal
  const closeModal = useCallback(() => {
    setBookingModal({ show: false, therapist: null });
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
  }, []);

  // Check if a date is available
  const isDateAvailable = useCallback((date) => {
    const dateString = date.toISOString().split('T')[0];
    return availableDates.includes(dateString);
  }, [availableDates]);

  // Get minimum date (today)
  const getMinDate = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  return (
    <PatientDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600">Find and book appointments with qualified therapists</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search therapists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
            
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            
            <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Filter className="h-5 w-5 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Therapists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-16 w-16 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))
          ) : filteredTherapists.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No therapists found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredTherapists.map((therapist) => (
              <div key={therapist.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={therapist.image || '/profile.png'}
                    alt={therapist.name}
                    className="h-16 w-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/profile.png';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{therapist.name}</h3>
                    <p className="text-sm text-gray-600">{therapist.specialization}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {therapist.rating || '4.5'} ({therapist.reviewCount || '0'} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {therapist.clinic}, {therapist.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Experience: {therapist.experience || '5+'} years
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Available for booking
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">{therapist.price || '€60'}/session</span>
                  <button
                    onClick={() => handleBookAppointment(therapist)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Enhanced Booking Modal with High Z-Index and No Scroll */}
      {bookingModal.show && bookingModal.therapist && (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Book with {bookingModal.therapist.name}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={getMinDate().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {selectedDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available dates are highlighted
                    </p>
                  )}
                </div>
                
                {/* Time Slots */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Available Time Slots
                    </label>
                    
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading available slots...</span>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No available slots for this date</p>
                        <p className="text-xs text-gray-500 mt-1">Try selecting a different date</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {availableSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleTimeSelect(slot.time)}
                            className={`px-4 py-3 text-sm border rounded-lg transition-all ${
                              selectedTime === slot.time 
                                ? 'bg-blue-100 border-blue-300 text-blue-700 ring-2 ring-blue-200'
                                : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300 text-gray-700'
                            }`}
                          >
                            {slot.displayTime}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Booking Summary */}
                {selectedDate && selectedTime && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-gray-900">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Therapist:</span>
                        <span className="font-medium">{bookingModal.therapist.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">60 minutes</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-900 font-medium">Total:</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {bookingModal.therapist.price || '€60'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  disabled={!selectedDate || !selectedTime || bookingInProgress}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {bookingInProgress ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
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
    </PatientDashboardLayout>
  );
};

export default BookAppointmentPage;