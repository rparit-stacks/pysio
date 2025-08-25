'use server'

import { PrismaClient } from '@prisma/client'
import { getBookingsByPhysiotherapist } from './booking'

const prisma = new PrismaClient()

// Default availability template - available every day 9 AM to 9 PM
const DEFAULT_AVAILABILITY_TEMPLATE = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '21:00', isActive: true }, // Monday
  { dayOfWeek: 2, startTime: '09:00', endTime: '21:00', isActive: true }, // Tuesday
  { dayOfWeek: 3, startTime: '09:00', endTime: '21:00', isActive: true }, // Wednesday
  { dayOfWeek: 4, startTime: '09:00', endTime: '21:00', isActive: true }, // Thursday
  { dayOfWeek: 5, startTime: '09:00', endTime: '21:00', isActive: true }, // Friday
  { dayOfWeek: 6, startTime: '09:00', endTime: '21:00', isActive: true }, // Saturday
  { dayOfWeek: 0, startTime: '09:00', endTime: '21:00', isActive: true }, // Sunday
];

// Generate time slots between start and end time
function generateTimeSlots(startTime, endTime, intervalMinutes = 60) {
  const slots = [];
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  
  while (start < end) {
    slots.push(start.toTimeString().slice(0, 5));
    start.setMinutes(start.getMinutes() + intervalMinutes);
  }
  
  return slots;
}

// Convert 24-hour time to 12-hour format
function convertTo12Hour(time24) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Convert 12-hour time to 24-hour format
function convertTo24Hour(time12) {
  if (!time12) return '';
  const [time, period] = time12.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Ensure therapist has default availability
async function ensureDefaultAvailability(physiotherapistId) {
  try {
    // Check if therapist has any availability templates
    const existingTemplates = await prisma.availabilityTemplate.findMany({
      where: { physiotherapistId }
    });

    if (existingTemplates.length === 0) {
      // Create default availability templates
      const defaultTemplates = DEFAULT_AVAILABILITY_TEMPLATE.map(template => ({
        physiotherapistId,
        dayOfWeek: template.dayOfWeek,
        startTime: template.startTime,
        endTime: template.endTime,
        isActive: template.isActive
      }));

      await prisma.availabilityTemplate.createMany({
        data: defaultTemplates
      });

      console.log(`✅ Created default availability for therapist ${physiotherapistId}`);
    }
  } catch (error) {
    console.error('Error ensuring default availability:', error);
  }
}

// Get therapist's availability for a specific date
export async function getTherapistAvailableSlots(therapistId, date) {
  try {
    // Get therapist profile
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { id: Number(therapistId) },
      include: {
        user: true
      }
    });

    if (!profile) {
      return { success: false, error: 'Therapist not found' };
    }

    // Ensure default availability exists
    await ensureDefaultAvailability(profile.id);

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dateString = selectedDate.toISOString().split('T')[0];

    // Get availability template for this day
    const template = await prisma.availabilityTemplate.findFirst({
      where: {
        physiotherapistId: profile.id,
        dayOfWeek: dayOfWeek,
        isActive: true
      }
    });

    if (!template) {
      return { success: true, data: [] }; // No availability for this day
    }

    // Check for specific availability override
    const specificAvailability = await prisma.specificAvailability.findFirst({
      where: {
        physiotherapistId: profile.id,
        date: selectedDate
      }
    });

    let startTime = template.startTime;
    let endTime = template.endTime;
    let isAvailable = true;

    if (specificAvailability) {
      startTime = specificAvailability.startTime;
      endTime = specificAvailability.endTime;
      isAvailable = specificAvailability.isAvailable;
    }

    if (!isAvailable) {
      return { success: true, data: [] }; // Not available on this day
    }

    // Generate time slots
    const timeSlots = generateTimeSlots(startTime, endTime, 60);
    
    // Convert to display format
    const displaySlots = timeSlots.map(slot => ({
      time: slot,
      displayTime: convertTo12Hour(slot)
    }));

    // Get existing bookings for this date
    const bookingsResult = await getBookingsByPhysiotherapist(profile.id);
    const bookedTimes = new Set();

    if (bookingsResult?.success) {
      bookingsResult.data
        .filter(booking => {
          const bookingDate = new Date(booking.appointmentDate);
          return bookingDate.toISOString().split('T')[0] === dateString &&
                 ['confirmed', 'pending'].includes(booking.status?.toLowerCase());
        })
        .forEach(booking => {
          bookedTimes.add(booking.appointmentTime);
        });
    }

    // Filter out booked slots
    const availableSlots = displaySlots.filter(slot => !bookedTimes.has(slot.time));

    // Apply 3-hour advance booking rule for today
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate.getTime() === today.getTime()) {
      const thresholdTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // now + 3 hours
      
      const filteredSlots = availableSlots.filter(slot => {
        const slotDateTime = new Date(selectedDate);
        const [hours, minutes] = slot.time.split(':').map(Number);
        slotDateTime.setHours(hours, minutes, 0, 0);
        return slotDateTime >= thresholdTime;
      });

      return { success: true, data: filteredSlots };
    }

    return { success: true, data: availableSlots };

  } catch (error) {
    console.error('Error getting therapist available slots:', error);
    return { success: false, error: 'Failed to get available slots', details: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Get available dates for a month
export async function getTherapistAvailableDatesForMonth(therapistId, year, month) {
  try {
    // Get therapist profile
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { id: Number(therapistId) }
    });

    if (!profile) {
      return { success: false, error: 'Therapist not found' };
    }

    // Ensure default availability exists
    await ensureDefaultAvailability(profile.id);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const availableDates = [];

    // Get all availability templates
    const templates = await prisma.availabilityTemplate.findMany({
      where: {
        physiotherapistId: profile.id,
        isActive: true
      }
    });

    // Get specific availability for this month
    const specificAvailability = await prisma.specificAvailability.findMany({
      where: {
        physiotherapistId: profile.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Create a map for quick lookup
    const specificAvailabilityMap = new Map();
    specificAvailability.forEach(sa => {
      const dateKey = sa.date.toISOString().split('T')[0];
      specificAvailabilityMap.set(dateKey, sa);
    });

    // Check each day in the month
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const dateKey = d.toISOString().split('T')[0];
      
      // Check if there's specific availability for this date
      const specific = specificAvailabilityMap.get(dateKey);
      
      if (specific) {
        // Use specific availability
        if (specific.isAvailable) {
          availableDates.push(dateKey);
        }
      } else {
        // Use template availability
        const template = templates.find(t => t.dayOfWeek === dayOfWeek);
        if (template) {
          availableDates.push(dateKey);
        }
      }
    }

    return { success: true, data: availableDates };

  } catch (error) {
    console.error('Error getting available dates for month:', error);
    return { success: false, error: 'Failed to get available dates', details: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Get therapist's availability settings
export async function getTherapistAvailability(userId) {
  try {
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { userId: Number(userId) },
      include: {
        availabilityTemplates: {
          orderBy: { dayOfWeek: 'asc' }
        },
        specificAvailabilities: {
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!profile) {
      return { success: false, error: 'Physiotherapist profile not found' };
    }

    // Ensure default availability exists
    await ensureDefaultAvailability(profile.id);

    // Convert availability templates to weekly format
    const weeklyTemplate = {};
    profile.availabilityTemplates.forEach(template => {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[template.dayOfWeek];
      weeklyTemplate[dayName] = {
        isAvailable: template.isActive,
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
      isAvailable: sa.isAvailable,
      reason: sa.reason
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

// Update availability template
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
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const templates = [];

    dayNames.forEach((dayName, index) => {
      const config = weeklyTemplate[dayName] || { isAvailable: false, startTime: '09:00', endTime: '17:00' };
      templates.push({
      physiotherapistId: profile.id,
        dayOfWeek: index,
      startTime: config.startTime || '09:00',
        endTime: config.endTime || '17:00',
        isActive: config.isAvailable || false
      });
    });

      await prisma.availabilityTemplate.createMany({
        data: templates
      });

    return { success: true, message: 'Availability template updated successfully' };
  } catch (error) {
    console.error('Error updating availability template:', error);
    return { success: false, error: 'Failed to update availability template' };
  } finally {
    await prisma.$disconnect();
  }
}

// Add specific availability
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
      // Update existing record
      await prisma.specificAvailability.update({
        where: { id: existing.id },
        data: {
          startTime: availabilityData.startTime,
          endTime: availabilityData.endTime,
          isAvailable: availabilityData.isAvailable,
          reason: availabilityData.reason
        }
      });
    } else {
      // Create new record
    await prisma.specificAvailability.create({
      data: {
        physiotherapistId: profile.id,
        date: new Date(availabilityData.date),
        startTime: availabilityData.startTime,
        endTime: availabilityData.endTime,
          isAvailable: availabilityData.isAvailable,
          reason: availabilityData.reason
      }
    });
    }

    return { success: true, message: 'Specific availability updated successfully' };
  } catch (error) {
    console.error('Error adding specific availability:', error);
    return { success: false, error: 'Failed to add specific availability' };
  } finally {
    await prisma.$disconnect();
  }
}

// Remove specific availability
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

// Initialize default availability for all therapists
export async function initializeDefaultAvailabilityForAll() {
  try {
    const therapists = await prisma.physiotherapistProfile.findMany({
      select: { id: true }
    });

    let updatedCount = 0;
    for (const therapist of therapists) {
      await ensureDefaultAvailability(therapist.id);
      updatedCount++;
    }

    console.log(`✅ Initialized default availability for ${updatedCount} therapists`);
    return { success: true, message: `Initialized default availability for ${updatedCount} therapists` };
  } catch (error) {
    console.error('Error initializing default availability:', error);
    return { success: false, error: 'Failed to initialize default availability' };
  } finally {
    await prisma.$disconnect();
  }
}

// Legacy function for backward compatibility
export async function getFilteredAvailableSlots(userId, availableSlots, date) {
  const result = await getTherapistAvailableSlots(userId, date);
  if (result.success) {
    return result.data.map(slot => slot.displayTime);
  }
  return [];
}