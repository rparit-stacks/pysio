'use server'

import { getBookingsByPhysiotherapist } from '@/lib/actions/booking'

export async function getFilteredAvailableSlots(userId, availableSlots, date) {
  try {
    if (!userId || !availableSlots || availableSlots.length === 0 || !date) {
      return [];
    }

    const selectedDate = new Date(date);

    const bookingsResult = await getBookingsByPhysiotherapist(userId);
    if (!bookingsResult?.success) {
      return availableSlots;
    }
    console.log(bookingsResult)

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

    return availableSlots.filter(slot => !bookedTimeSet.has(slot));

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
