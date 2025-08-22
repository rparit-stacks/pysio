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

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getTherapistAvailability(userId) {
  try {
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { userId: Number(userId) },
      include: {
        availabilityTemplates: true,
        specificAvailabilities: {
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!profile) {
      return { success: false, error: 'Physiotherapist profile not found' };
    }

    // Convert availability templates to weekly format
    const weeklyTemplate = {};
    profile.availabilityTemplates.forEach(template => {
      weeklyTemplate[template.dayOfWeek.toLowerCase()] = {
        isAvailable: template.isAvailable,
        startTime: template.startTime,
        endTime: template.endTime
      };
    });

    // Format specific availability
    const specificAvailability = profile.specificAvailabilities.map(sa => ({
      id: sa.id,
      date: sa.date.toISOString().split('T')[0],
      startTime: sa.startTime,
      endTime: sa.endTime,
      isAvailable: sa.isAvailable
    }));

    return { 
      success: true, 
      data: { 
        weeklyTemplate,
        specificAvailability
      } 
    };
  } catch (error) {
    console.error('Error fetching therapist availability:', error);
    return { success: false, error: 'Failed to fetch availability' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateAvailabilityTemplate(userId, weeklyTemplate) {
  try {
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { userId: Number(userId) },
      select: { id: true }
    });

    if (!profile) {
      return { success: false, error: 'Physiotherapist profile not found' };
    }

    // Delete existing templates
    await prisma.availabilityTemplate.deleteMany({
      where: { physiotherapistId: profile.id }
    });

    // Create new templates
    const templates = Object.entries(weeklyTemplate).map(([day, config]) => ({
      physiotherapistId: profile.id,
      dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
      isAvailable: config.isAvailable || false,
      startTime: config.startTime || '09:00',
      endTime: config.endTime || '17:00'
    }));

    if (templates.length > 0) {
      await prisma.availabilityTemplate.createMany({
        data: templates
      });
    }

    return { success: true, message: 'Availability template updated successfully' };
  } catch (error) {
    console.error('Error updating availability template:', error);
    return { success: false, error: 'Failed to update availability template' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function addSpecificAvailability(userId, availabilityData) {
  try {
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { userId: Number(userId) },
      select: { id: true }
    });

    if (!profile) {
      return { success: false, error: 'Physiotherapist profile not found' };
    }

    // Check if specific availability already exists for this date
    const existing = await prisma.specificAvailability.findFirst({
      where: {
        physiotherapistId: profile.id,
        date: new Date(availabilityData.date)
      }
    });

    if (existing) {
      return { success: false, error: 'Specific availability already exists for this date' };
    }

    await prisma.specificAvailability.create({
      data: {
        physiotherapistId: profile.id,
        date: new Date(availabilityData.date),
        startTime: availabilityData.startTime,
        endTime: availabilityData.endTime,
        isAvailable: availabilityData.isAvailable
      }
    });

    return { success: true, message: 'Specific availability added successfully' };
  } catch (error) {
    console.error('Error adding specific availability:', error);
    return { success: false, error: 'Failed to add specific availability' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function removeSpecificAvailability(availabilityId) {
  try {
    await prisma.specificAvailability.delete({
      where: { id: Number(availabilityId) }
    });

    return { success: true, message: 'Specific availability removed successfully' };
  } catch (error) {
    console.error('Error removing specific availability:', error);
    return { success: false, error: 'Failed to remove specific availability' };
  } finally {
    await prisma.$disconnect();
  }
}