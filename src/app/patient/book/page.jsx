'use client';

import { useState, useEffect } from 'react';
import PatientDashboardLayout from '../../components/PatientDashboardLayout';
import { Search, MapPin, Star, Calendar, Clock, Filter } from 'lucide-react';
import Toast from '../../components/ui/Toast';
import { getAllAvailablePhysiotherapists, getAllSpecializations, getAllCities } from '../../lib/actions/physiotherapist';
import { createBooking } from '../../lib/actions/booking';

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch therapists, specializations, and locations
        const [therapistsResult, specializationsResult, locationsResult] = await Promise.all([
          getAllAvailablePhysiotherapists(),
          getAllSpecializations(),
          getAllCities()
        ]);

        if (therapistsResult.success) {
          setTherapists(therapistsResult.data);
        }

        if (specializationsResult.success) {
          setSpecializations(['All Specializations', ...specializationsResult.data.map(s => s.name)]);
        }

        if (locationsResult.success) {
          setLocations(['All Locations', ...locationsResult.data.map(c => c.name)]);
        }

      } catch (error) {
        setToast({
          show: true,
          message: 'Failed to load data',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleBookAppointment = (therapist) => {
    setBookingModal({ show: true, therapist });
  };

  const confirmBooking = async () => {
    if (!selectedDate || !selectedTime || !bookingModal.therapist) {
      setToast({
        show: true,
        message: 'Please select date and time',
        type: 'error'
      });
      return;
    }

    try {
      const patientId = 1; // Replace with actual patient ID from auth
      const therapist = bookingModal.therapist;
      const clinicId = therapist.clinics?.[0]?.id || 1; // Use first clinic or default

      const bookingData = {
        patientId,
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
          message: `Appointment booked with ${therapist.name} for ${selectedDate} at ${selectedTime}`,
          type: 'success'
        });
        setBookingModal({ show: false, therapist: null });
        setSelectedDate('');
        setSelectedTime('');
      } else {
        setToast({
          show: true,
          message: result.error || 'Failed to book appointment',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to book appointment',
        type: 'error'
      });
    }
  };

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
                    src={therapist.image}
                    alt={therapist.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{therapist.name}</h3>
                    <p className="text-sm text-gray-600">{therapist.specialization}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {therapist.rating} ({therapist.reviewCount} reviews)
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
                    Experience: {therapist.experience}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {therapist.experience} experience
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">{therapist.price}/session</span>
                  <button
                    onClick={() => handleBookAppointment(therapist)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModal.show && bookingModal.therapist && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setBookingModal({ show: false, therapist: null })} />
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Book Appointment with {bookingModal.therapist.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {bookingModal.therapist.availableSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`px-3 py-2 text-sm border rounded-lg ${
                          selectedTime === slot 
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Session Fee:</span>
                    <span className="font-medium">{bookingModal.therapist.price}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setBookingModal({ show: false, therapist: null })}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Confirm Booking
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