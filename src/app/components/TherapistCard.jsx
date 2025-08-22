'use client';

import React, { useState, useTransition } from "react";
import { Phone, Mail, MapPin, X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useRouter } from 'next/navigation'
import { createBookingAndPayment } from "@/lib/actions/stripe";
import { getCurrentUser } from "@/lib/auth";
import AppointmentDatePicker from "./AppointmentDatePicker";
import { getFilteredAvailableSlots } from "@/lib/actions/availability";

export default function TherapistCard({ therapist }) {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [error, setError] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  const clinic = therapist.clinics?.[0];

  async function handleBook() {
    try {
      const priceNumber = Number(therapist.price.replace(/[^\d.]/g, ""));

      const platformFee = priceNumber * 0.2; // 20% extra
      const totalAmount = priceNumber + platformFee;

      const user = await getCurrentUser();

      if (!user) {
        if (confirm("Login First. Do you want to go to the login page?")) {
          router.push("/login");
        }
        return;
      }

      if (!selectedDate) {
        setError("Please select an appointment date");
        return;
      }

      if (!selectedSlot) {
        setError("Please select a time slot");
        return;
      }

      // Ask user to confirm extra fee
      const confirmPayment = confirm(
        `Booking this session will include a 20% platform fee.\n\nOriginal Price: €${priceNumber.toFixed(
          2
        )}\nPlatform Fee: €${platformFee.toFixed(
          2
        )}\nTotal: €${totalAmount.toFixed(2)}\n\nDo you want to continue?`
      );
      if (!confirmPayment) return;

      setLoading(true);
      setError(null);

      startTransition(async () => {
        try {
          const session = await createBookingAndPayment({
            patientId: user.id,
            physiotherapistId: therapist.id,
            clinicId: therapist.clinics?.[0]?.id || 1,
            appointmentDate: selectedDate,
            appointmentTime: selectedSlot,
            totalAmount: totalAmount, // include 20% fee
            currency: "EUR",
            paymentMethodId: 'credit card',
            specialization: therapist.specialization,
          });

          if (session?.checkoutUrl) {
            window.location.href = session.checkoutUrl;
          } else {
            throw new Error("Failed to create payment session");
          }
        } catch (error) {
          console.error("Booking error:", error);
          setError(error.message || "Failed to book appointment");
        } finally {
          setLoading(false);
        }
      });

    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Something went wrong, please try again later.");
    }
  }

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setError(null);
  };

  // Generate calendar days
  const generateCalendarDays = (month) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      days.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === monthIndex,
        isToday: date.getTime() === today.getTime(),
        isPast: date < today,
        isSelected: selectedDate && date.getTime() === new Date(selectedDate).setHours(0, 0, 0, 0)
      });
    }

    return days;
  };

  // Initialize calendar when modal opens
  React.useEffect(() => {
    if (showBookingModal) {
      setCalendarDays(generateCalendarDays(currentMonth));
    }
  }, [showBookingModal, currentMonth, selectedDate]);

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setError(null);

    setFetchingSlots(true);

    // Get all slots from your API or function
    let slots = await getFilteredAvailableSlots(therapist.id, therapist.availableSlots, date);
    console.log('slots', slots);
    console.log('date', date);

    const now = new Date();
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) {

      slots = [];
    } else if (selected.getTime() === today.getTime()) {

      const thresholdTime = new Date(now.getTime() + 30 * 60 * 1000); // now + 30 min

      slots = slots.filter(slot => {

        const [time, meridian] = slot.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (meridian === 'PM' && hours !== 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;

        const slotDateTime = new Date(selected);
        slotDateTime.setHours(hours, minutes, 0, 0);

        return slotDateTime >= thresholdTime;
      });
    }
    // else future date - keep all slots as is

    setAvailableSlots(slots);
    setFetchingSlots(false);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };


  return (
    <>
      {/* Main Therapist Card - Clean and Compact */}
      <div className="bg-white border border-emerald-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 w-full max-w-sm">

        {/* Therapist Info Section */}
        <div className="flex items-start gap-4 mb-4">
          <img
            src={therapist.image || '/placeholder.png'}
            alt={therapist.name || 'Therapist'}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {therapist.name || 'Therapist Name'}
            </h3>
            <p className="text-sm text-emerald-600 font-medium mb-2">
              {therapist.specialization || 'Specialization'}
            </p>
            {clinic?.city && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{clinic.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating and Experience */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span className="text-gray-700 font-medium">{therapist.rating || '4.5'}</span>
            <span className="text-gray-500">({therapist.reviews || 0})</span>
          </div>
          <span className="text-gray-600">{therapist.experience || 0} years exp</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-emerald-600">
            {therapist.price || '€50'}
          </span>
          <span className="text-sm text-gray-500">per session</span>
        </div>

        {/* Qualifications - Compact */}
        {therapist.qualifications?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {therapist.qualifications.slice(0, 2).map((q, i) => (
              <span
                key={i}
                className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-full"
              >
                {q}
              </span>
            ))}
            {therapist.qualifications.length > 2 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{therapist.qualifications.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Contact Icons - Compact */}
        <div className="flex items-center gap-2 mb-4">
          {therapist.phone && (
            <a
              href={`tel:${therapist.phone}`}
              className="p-2 border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
              title="Call"
            >
              <Phone size={16} />
            </a>
          )}
          {therapist.email && (
            <a
              href={`mailto:${therapist.email}`}
              className="p-2 border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
              title="Email"
            >
              <Mail size={16} />
            </a>
          )}
        </div>

        {/* Single Book Now Button */}
        <button
          onClick={() => setShowBookingModal(true)}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
        >
          Book Now
        </button>
      </div>

      {/* Booking Modal - Floating Card - Responsive */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Book Appointment</h3>
                <p className="text-sm text-gray-600">with {therapist.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedDate(null);
                  setSelectedSlot(null);
                  setError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

              {/* Custom Beautiful Calendar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select Date
                </label>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <ChevronLeft size={20} className="text-gray-600" />
                    </button>

                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>

                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <ChevronRight size={20} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Days of Week */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => !day.isPast && day.isCurrentMonth && handleDateChange(day.date)}
                        disabled={day.isPast || !day.isCurrentMonth}
                        className={`
                          h-8 w-8 sm:h-10 sm:w-10 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                          ${day.isSelected
                            ? 'bg-emerald-500 text-white shadow-md'
                            : day.isToday
                              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                              : day.isCurrentMonth && !day.isPast
                                ? 'hover:bg-white hover:shadow-sm text-gray-700'
                                : 'text-gray-300 cursor-not-allowed'
                          }
                        `}
                      >
                        {day.date.getDate()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Beautiful Time Slots */}
              {selectedDate && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={18} className="text-emerald-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Available Time Slots
                    </label>
                  </div>

                  {fetchingSlots ? (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                      <div className="text-sm text-gray-500">Loading available slots...</div>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {availableSlots.map((slot, i) => (
                          <button
                            key={i}
                            onClick={() => handleSlotSelect(slot)}
                            className={`
                              relative py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200
                              ${selectedSlot === slot
                                ? 'bg-emerald-500 text-white shadow-lg transform scale-105'
                                : 'bg-white border border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:shadow-md hover:bg-emerald-50'
                              }
                            `}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Clock size={14} />
                              <span>{slot}</span>
                            </div>
                            {selectedSlot === slot && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-600 rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock size={20} className="text-gray-400" />
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {selectedDate && new Date(selectedDate).toDateString() === new Date().toDateString()
                          ? "No slots available today (need 3+ hours advance booking)"
                          : "No available slots for this date"
                        }
                      </div>
                      {selectedDate && new Date(selectedDate).toDateString() === new Date().toDateString() && (
                        <div className="text-xs text-emerald-600 font-medium">
                          Try selecting tomorrow or a future date
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Booking Summary */}
              {selectedDate && selectedSlot && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-medium text-emerald-900 mb-2">Booking Summary</h4>
                  <div className="text-sm text-emerald-700 space-y-1">
                    <div>Date: {new Date(selectedDate).toLocaleDateString()}</div>
                    <div>Time: {selectedSlot}</div>
                    <div>Price: {therapist.price} + 20% platform fee</div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedDate(null);
                    setSelectedSlot(null);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBook}
                  disabled={!selectedDate || !selectedSlot || loading || isPending}
                  className={`flex-1 px-4 py-2.5 sm:py-2 bg-emerald-500 text-white rounded-lg font-medium transition-colors text-sm sm:text-base ${(!selectedDate || !selectedSlot || loading || isPending)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-emerald-600'
                    }`}
                >
                  {loading || isPending ? "Processing..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}