'use client';

import React, { useState, useTransition } from "react";
import { Phone, Mail, MapPin, Calendar as CalendarIcon } from "lucide-react";
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
  const [showCalendar, setShowCalendar] = useState(false);
  const [error, setError] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

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
  selected.setHours(0,0,0,0);

  const today = new Date();
  today.setHours(0,0,0,0);

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


  return (
<div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-md space-y-4 w-full max-w-lg mx-auto">
  {/* Header Row */}
  <div className="flex justify-between items-start min-h-[70px]">
    <div className="flex items-center gap-4">
      <img
        src={therapist.image || '/placeholder.png'}
        alt={therapist.name || 'Therapist'}
        className="w-14 h-14 rounded-full object-cover border border-gray-200"
      />
      <div className="flex flex-col justify-between">
        <h3 className="text-lg font-bold text-gray-900 min-h-[24px]">{therapist.name || '-'}</h3>
        <p className="text-sm text-emerald-600 font-medium min-h-[18px]">{therapist.specialization || '-'}</p>
        {clinic?.city ? (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin className="w-4 h-4" />
            <span>{clinic.city}</span>
          </div>
        ) : (
          <div className="text-xs text-gray-500 mt-1 min-h-[16px]">-</div>
        )}
      </div>
    </div>

    <div className="text-right min-w-[80px]">
      <p className="text-emerald-600 text-lg font-semibold">{therapist.price || '-'}</p>
      <p className="text-xs text-gray-400">per session</p>
    </div>
  </div>

  {/* Rating + Experience */}
  <div className="flex items-center gap-4 text-sm text-gray-500 min-h-[24px]">
    <span>⭐ {therapist.rating || '-'} ({therapist.reviews || 0} reviews)</span>
    <span>•</span>
    <span>{therapist.experience || 0} years</span>
  </div>

  {/* Qualifications */}
  <div className="space-x-2 flex flex-wrap min-h-[32px]">
    {therapist.qualifications?.length ? (
      therapist.qualifications.map((q, i) => (
        <span
          key={i}
          className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2 py-1 rounded-full"
        >
          {q}
        </span>
      ))
    ) : (
      <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2 py-1 rounded-full">
        -
      </span>
    )}
  </div>

  {/* Date Picker */}
  {showCalendar && (
    <AppointmentDatePicker
      selectedDate={selectedDate}
      onDateChange={handleDateChange}
    />
  )}

  {/* Available Slots */}
  {showCalendar && (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">Available Slots</p>

      {fetchingSlots ? (
        <p className="text-xs text-gray-500 italic">Loading slots...</p>
      ) : availableSlots.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {availableSlots.map((slot, i) => (
            <button
              key={i}
              onClick={() => handleSlotSelect(slot)}
              className={`border text-sm px-3 py-1 rounded-md ${
                selectedSlot === slot 
                  ? 'bg-emerald-500 text-white border-emerald-500' 
                  : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
              }`}
              type="button"
            >
              {slot}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 italic">
          No available slots for this date.
        </p>
      )}
    </div>
  )}

  {/* Error message */}
  {error && (
    <div className="text-red-500 text-sm mt-2">
      {error}
    </div>
  )}

  {/* Actions */}
  <div className="flex items-center gap-3 mt-4">
    {!showCalendar ? (
      <button
        onClick={() => setShowCalendar(true)}
        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2 rounded-md"
      >
        <CalendarIcon className="inline-block mr-2 w-4 h-4" /> Choose Date
      </button>
    ) : (
      <button
        onClick={handleBook}
        disabled={loading || isPending}
        className={`flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2 rounded-md ${
          (loading || isPending) ? 'opacity-75 cursor-not-allowed' : ''
        }`}
      >
        {loading || isPending ? "Processing..." : "Book Appointment"}
      </button>
    )}

    {therapist.phone ? (
      <a
        href={`tel:${therapist.phone}`}
        className="border border-emerald-500 text-emerald-500 p-2 rounded-md hover:bg-emerald-50"
        title={`Call ${therapist.name || 'Therapist'}`}
      >
        <Phone size={18} />
      </a>
    ) : (
      <div className="w-10 h-10"></div> 
    )}

    {therapist.email ? (
      <a
        href={`mailto:${therapist.email}`}
        className="border border-emerald-500 text-emerald-500 p-2 rounded-md hover:bg-emerald-50"
        title={`Email ${therapist.name || 'Therapist'}`}
      >
        <Mail size={18} />
      </a>
    ) : (
      <div className="w-10 h-10"></div> 
    )}
  </div>
</div>

  );
}
