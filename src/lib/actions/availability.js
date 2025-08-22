'use server'

import { getBookingsByPhysiotherapist } from '@/lib/actions/booking'

export async function getFilteredAvailableSlots(userId, availableSlots, date) {
  try {
    if (!userId || !date) {
      return [];
    }

    const selectedDate = new Date(date);
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // Generate full day slots from 9 AM to 9 PM (every hour)
    const fullDaySlots = [
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
      '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'
    ];

    let availableSlotsToFilter = fullDaySlots;

    // If selected date is today, apply 3-hour advance booking rule
    if (selectedDate.getTime() === today.getTime()) {
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      
      // If it's 7 PM (19:00) or later, no slots available for today
      if (currentHour >= 19) {
        return [];
      }

      // Calculate minimum booking time (current time + 3 hours)
      const minBookingTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      const minBookingHour = minBookingTime.getHours();

      // Filter slots to only show those 3+ hours from now
      availableSlotsToFilter = fullDaySlots.filter(slot => {
        const [time, meridian] = slot.split(' ');
        let [hours] = time.split(':').map(Number);
        
        // Convert to 24-hour format
        if (meridian === 'PM' && hours !== 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;
        
        return hours >= minBookingHour;
      });

      // If no slots available after filtering, return empty
      if (availableSlotsToFilter.length === 0) {
        return [];
      }
    }

    // Get existing bookings for the selected date
    const bookingsResult = await getBookingsByPhysiotherapist(userId);
    if (!bookingsResult?.success) {
      return availableSlotsToFilter;
    }

    const bookedTimes = bookingsResult.data
      .filter(b => {
        const apptDate = new Date(b.appointmentDate);
        const sameDay =
          apptDate.getUTCFullYear() === selectedDate.getUTCFullYear() &&
          apptDate.getUTCMonth() === selectedDate.getUTCMonth() &&
          apptDate.getUTCDate() === selectedDate.getUTCDate();

        return sameDay && ['confirmed', 'pending'].includes(b.status?.toLowerCase());
      })
      .map(b => convertTo12Hour(b.appointmentTime));

    const bookedTimeSet = new Set(bookedTimes);

    // Return available slots after removing booked ones
    return availableSlotsToFilter.filter(slot => !bookedTimeSet.has(slot));

  } catch (error) {
    console.error('Error filtering available slots:', error);
    return [];
  }
}


function convertTo12Hour(time24) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}
