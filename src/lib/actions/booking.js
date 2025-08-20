'use server'

import { PrismaClient } from '@prisma/client'
import { sendBookingNotifications, sendBookingCancellationNotification, sendBookingConfirmationNotification, sendBookingRescheduleNotification } from '../services/email.js'

const prisma = new PrismaClient()

// Helper function to get specialization ID by name
async function getSpecializationIdByName(specializationName) {
  try {
    const specialization = await prisma.specialization.findFirst({
      where: { 
        name: specializationName,
        isActive: true 
      },
      select: { id: true }
    })
    return specialization?.id || null
  } catch (error) {
    console.error('Error finding specialization:', error)
    return null
  }
}

// Helper function to initialize booking statuses
async function initializeBookingStatuses() {
  const statuses = [
    { name: 'pending', description: 'Booking is pending confirmation' },
    { name: 'confirmed', description: 'Booking has been confirmed' },
    { name: 'cancelled', description: 'Booking has been cancelled' },
    { name: 'completed', description: 'Booking session has been completed' }
  ]

  for (const status of statuses) {
    try {
      await prisma.bookingStatus.upsert({
        where: { name: status.name },
        update: {},
        create: status
      })
    } catch (error) {
      console.error(`Error creating booking status ${status.name}:`, error)
    }
  }
}

 function generateBookingReference() {
  // Generate a shorter reference that fits in 20 characters
  const timestamp = Date.now().toString(36).slice(-6) // Last 6 chars of timestamp
  const random = Math.random().toString(36).substr(2, 6) // 6 random chars
  return `BK${timestamp}${random}`.toUpperCase().slice(0, 20) // Ensure max 20 chars
}

export async function createBooking({
  patientId,
  physiotherapistId,
  clinicId,
  appointmentDate,
  appointmentTime,
  durationMinutes = 60,
  treatmentTypeId,
  patientNotes,
  totalAmount
}) {
  try {
    // Initialize booking statuses first
    await initializeBookingStatuses()

    // Validate required fields
    if (!patientId || !physiotherapistId || !clinicId || !appointmentDate || !appointmentTime) {
      return { 
        success: false, 
        error: 'Missing required fields: patientId, physiotherapistId, clinicId, appointmentDate, appointmentTime' 
      }
    }

    // Check if physiotherapist exists and is available
    const physiotherapist = await prisma.physiotherapistProfile.findUnique({
      where: { id: physiotherapistId },
      select: { id: true, isAvailable: true, hourlyRate: true }
    })

    if (!physiotherapist) {
      return { success: false, error: 'Physiotherapist not found' }
    }

    if (!physiotherapist.isAvailable) {
      return { success: false, error: 'Physiotherapist is not available' }
    }

    // Check if patient exists
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, roleId: true }
    })

    if (!patient) {
      return { success: false, error: 'Patient not found' }
    }

    // Check if clinic exists
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true, isActive: true }
    })

    if (!clinic || !clinic.isActive) {
      return { success: false, error: 'Clinic not found or inactive' }
    }

    // Check for existing booking at the same time slot
    const existingBooking = await prisma.booking.findFirst({
      where: {
        physiotherapistId,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        status: {
          name: {
            not: 'cancelled'
          }
        }
      }
    })

    if (existingBooking) {
      return { success: false, error: 'Time slot already booked' }
    }

    // Get default booking status (pending) - should exist after initialization
    const pendingStatus = await prisma.bookingStatus.findFirst({
      where: { name: 'pending' }
    })

    if (!pendingStatus) {
      return { success: false, error: 'Booking status configuration error' }
    }

    // Calculate total amount if not provided
    const calculatedAmount = totalAmount || (physiotherapist.hourlyRate * (durationMinutes / 60))

    // Generate unique booking reference
    let bookingReference
    let isUnique = false
    let attempts = 0
    
    while (!isUnique && attempts < 10) {
      bookingReference = generateBookingReference()
      console.log(`Generated booking reference: "${bookingReference}" (length: ${bookingReference.length})`)
      const existing = await prisma.booking.findUnique({
        where: { bookingReference }
      })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return { success: false, error: 'Failed to generate unique booking reference' }
    }
const timeWithoutAmPm = appointmentTime.replace(/(AM|PM)/, '').trim();

    // Prepare booking data
    const bookingData = {
      bookingReference,
      patientId,
      physiotherapistId,
      clinicId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime :timeWithoutAmPm,
      durationMinutes,
      statusId: pendingStatus.id,
      treatmentTypeId,
      totalAmount: calculatedAmount,
      patientNotes
    }

    console.log('Creating booking with data:', bookingData)

    // Create the booking
    const booking = await prisma.booking.create({
      data: bookingData,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        physiotherapist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        clinic: {
          select: {
            name: true,
            addressLine1: true,
            city: {
              select: {
                name: true
              }
            }
          }
        },
        status: {
          select: {
            name: true
          }
        },
        treatmentType: {
          select: {
            name: true
          }
        }
      }
    })

    // Prepare booking data for email notifications
    const bookingDataForEmail = {
      bookingReference: booking.bookingReference,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      durationMinutes: booking.durationMinutes,
      totalAmount: booking.totalAmount ? parseFloat(booking.totalAmount.toString()) : null,
      patient: booking.patient,
      physiotherapist: {
        name: `Dr. ${booking.physiotherapist.user.firstName} ${booking.physiotherapist.user.lastName}`,
        email: booking.physiotherapist.user.email
      },
      clinic: booking.clinic,
      treatmentType: booking.treatmentType?.name,
      patientNotes: booking.patientNotes
    };

    // Send email notifications (non-blocking)
    try {
      const emailResults = await sendBookingNotifications(bookingDataForEmail);
      console.log('Email notification results:', emailResults);
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError);
      // Don't fail the booking creation if emails fail
    }

    return { 
      success: true, 
      data: {
        id: booking.id,
        bookingReference: booking.bookingReference,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        durationMinutes: booking.durationMinutes,
        totalAmount: booking.totalAmount ? parseFloat(booking.totalAmount.toString()) : null,
        status: booking.status.name,
        patient: booking.patient,
        physiotherapist: {
          name: `Dr. ${booking.physiotherapist.user.firstName} ${booking.physiotherapist.user.lastName}`,
          email: booking.physiotherapist.user.email
        },
        clinic: booking.clinic,
        treatmentType: booking.treatmentType?.name,
        patientNotes: booking.patientNotes
      }
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    return { success: false, error: `Failed to create booking: ${error.message}` }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getBookingsByPatient(patientId) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { patientId },
      include: {
        physiotherapist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        clinic: {
          select: {
            name: true,
            addressLine1: true,
            city: {
              select: {
                name: true
              }
            }
          }
        },
        status: {
          select: {
            name: true
          }
        },
        treatmentType: {
          select: {
            name: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            processedAt: true
          }
        }
      },
      orderBy: [
        { appointmentDate: 'desc' },
        { appointmentTime: 'desc' }
      ]
    })

    const formattedBookings = bookings.map(booking => {
      // Determine payment status
      const hasPayment = booking.payments && booking.payments.length > 0;
      const paidPayment = booking.payments?.find(payment => payment.status === 'completed');
      
      let paymentStatus = 'unpaid';
      let paymentAmount = null;
      
      if (hasPayment) {
        if (paidPayment) {
          paymentStatus = 'paid';
          paymentAmount = parseFloat(paidPayment.amount.toString());
        } else {
          // Has payment records but none completed
          const latestPayment = booking.payments[booking.payments.length - 1];
          paymentStatus = latestPayment.status; // pending, failed, etc.
          paymentAmount = parseFloat(latestPayment.amount.toString());
        }
      }

      return {
        id: booking.id,
        bookingReference: booking.bookingReference,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        durationMinutes: booking.durationMinutes,
        totalAmount: booking.totalAmount ? parseFloat(booking.totalAmount.toString()) : null,
        status: booking.status.name,
        physiotherapist: `Dr. ${booking.physiotherapist.user.firstName} ${booking.physiotherapist.user.lastName}`,
        clinic: booking.clinic,
        treatmentType: booking.treatmentType?.name,
        patientNotes: booking.patientNotes,
        therapistNotes: booking.therapistNotes,
        paymentStatus: paymentStatus,
        paymentAmount: paymentAmount,
        payments: booking.payments || []
      };
    })

    return { success: true, data: formattedBookings }
  } catch (error) {
    console.error('Error fetching patient bookings:', error)
    return { success: false, error: 'Failed to fetch bookings' }
  } finally {
    await prisma.$disconnect()
  }
}

export { getSpecializationIdByName };

// Helper function to get physiotherapist profile ID by user ID
async function getPhysiotherapistProfileId(userId) {
  try {
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { userId: parseInt(userId) },
      select: { id: true }
    });
    return profile?.id || null;
  } catch (error) {
    console.error('Error finding physiotherapist profile:', error);
    return null;
  }
}

export async function getBookingsByTherapistUserId(userId) {
  try {
    const profileId = await getPhysiotherapistProfileId(userId);
    if (!profileId) {
      return { success: false, error: 'Physiotherapist profile not found' };
    }
    return await getBookingsByPhysiotherapist(profileId);
  } catch (error) {
    console.error('Error fetching therapist bookings by user ID:', error);
    return { success: false, error: 'Failed to fetch bookings' };
  }
}

export async function getBookingsByPhysiotherapist(physiotherapistId) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { physiotherapistId },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true
          }
        },
        clinic: {
          select: {
            name: true,
            addressLine1: true,
            city: {
              select: {
                name: true
              }
            }
          }
        },
        status: {
          select: {
            name: true
          }
        },
        treatmentType: {
          select: {
            name: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            processedAt: true
          }
        }
      },
      orderBy: [
        { appointmentDate: 'desc' },
        { appointmentTime: 'desc' }
      ]
    })

    const formattedBookings = bookings.map(booking => {
      // Determine payment status
      const hasPayment = booking.payments && booking.payments.length > 0;
      const paidPayment = booking.payments?.find(payment => payment.status === 'completed');
      
      let paymentStatus = 'unpaid';
      let paymentAmount = null;
      
      if (hasPayment) {
        if (paidPayment) {
          paymentStatus = 'paid';
          paymentAmount = parseFloat(paidPayment.amount.toString());
        } else {
          const latestPayment = booking.payments[booking.payments.length - 1];
          paymentStatus = latestPayment.status;
          paymentAmount = parseFloat(latestPayment.amount.toString());
        }
      }

      return {
        id: booking.id,
        bookingReference: booking.bookingReference,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        durationMinutes: booking.durationMinutes,
        totalAmount: booking.totalAmount ? parseFloat(booking.totalAmount.toString()) : null,
        status: booking.status.name,
        patient: booking.patient,
        clinic: booking.clinic,
        treatmentType: booking.treatmentType?.name,
        patientNotes: booking.patientNotes,
        therapistNotes: booking.therapistNotes,
        paymentStatus: paymentStatus,
        paymentAmount: paymentAmount,
        payments: booking.payments || []
      };
    })

    return { success: true, data: formattedBookings }
  } catch (error) {
    console.error('Error fetching physiotherapist bookings:', error)
    return { success: false, error: 'Failed to fetch bookings' }
  } finally {
    await prisma.$disconnect()
  }
}

export async function cancelBooking(bookingId, userId) {
  try {
    // First, verify the booking belongs to the user and is cancellable
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        physiotherapist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        clinic: {
          select: {
            name: true,
            addressLine1: true,
            city: {
              select: {
                name: true
              }
            }
          }
        },
        status: true,
        payments: true
      }
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    // Check if the booking belongs to the user
    if (booking.patient.id !== userId) {
      return { success: false, error: 'Unauthorized: This booking does not belong to you' };
    }

    // Check if booking is already cancelled
    if (booking.status.name === 'cancelled') {
      return { success: false, error: 'Booking is already cancelled' };
    }

    // Check if booking can be cancelled (not completed or paid)
    const hasSuccessfulPayment = booking.payments?.some(payment => payment.status === 'completed');
    if (booking.status.name === 'completed') {
      return { success: false, error: 'Cannot cancel a completed booking' };
    }

    if (hasSuccessfulPayment) {
      return { success: false, error: 'Cannot cancel a paid booking. Please contact support for refunds.' };
    }

    // Enforce 24-hour cancellation policy
    try {
      const [hoursStr, minutesStr] = (booking.appointmentTime || '00:00').split(':');
      const appointmentDateTime = new Date(booking.appointmentDate);
      appointmentDateTime.setHours(parseInt(hoursStr || '0'), parseInt(minutesStr || '0'), 0, 0);
      const now = new Date();
      const twentyFourHoursMs = 24 * 60 * 60 * 1000;
      if (appointmentDateTime.getTime() - now.getTime() < twentyFourHoursMs) {
        return { success: false, error: 'Bookings can only be cancelled at least 24 hours before the appointment.' };
      }
    } catch (e) {
      // If time parsing fails, proceed without the time restriction rather than blocking the user unexpectedly
    }

    // Get the cancelled status ID
    const cancelledStatus = await prisma.bookingStatus.findUnique({
      where: { name: 'cancelled' }
    });

    if (!cancelledStatus) {
      return { success: false, error: 'System error: Cannot find cancelled status' };
    }

    // Update the booking status to cancelled
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        statusId: cancelledStatus.id,
        updatedAt: new Date()
      },
      include: {
        status: true
      }
    });

    // Prepare booking data for email notifications
    const bookingDataForEmail = {
      bookingReference: booking.bookingReference,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      durationMinutes: booking.durationMinutes,
      totalAmount: booking.totalAmount ? parseFloat(booking.totalAmount.toString()) : null,
      patient: booking.patient,
      physiotherapist: {
        name: `Dr. ${booking.physiotherapist.user.firstName} ${booking.physiotherapist.user.lastName}`,
        email: booking.physiotherapist.user.email
      },
      clinic: booking.clinic,
      treatmentType: booking.treatmentType?.name,
      patientNotes: booking.patientNotes
    };

    // Send cancellation email notifications (non-blocking)
    try {
      const emailResults = await sendBookingCancellationNotification(bookingDataForEmail, 'Patient');
      console.log('Cancellation email notification results:', emailResults);
    } catch (emailError) {
      console.error('Error sending cancellation email notifications:', emailError);
      // Don't fail the cancellation if emails fail
    }

    return { 
      success: true, 
      message: 'Booking cancelled successfully',
      data: {
        id: updatedBooking.id,
        status: updatedBooking.status.name
      }
    };

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { success: false, error: 'Failed to cancel booking' };
  } finally {
    await prisma.$disconnect();
  }
}

// Helper: get booking status id by name
async function getStatusIdByName(statusName) {
  const status = await prisma.bookingStatus.findFirst({ where: { name: statusName } });
  return status?.id || null;
}

// Helper: create notification for a user
async function createNotification(userId, title, message, type = 'booking') {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type }
    });
  } catch (e) {
    console.error('Failed to create notification:', e);
  }
}

// Helper: notify all admins
async function notifyAdmins(title, message, type = 'booking') {
  try {
    const adminRole = await prisma.userRole.findFirst({ where: { name: 'admin' } });
    if (!adminRole) return;
    const admins = await prisma.user.findMany({ where: { roleId: adminRole.id }, select: { id: true } });
    if (!admins.length) return;
    await prisma.notification.createMany({
      data: admins.map(a => ({ userId: a.id, title, message, type }))
    });
  } catch (e) {
    console.error('Failed to notify admins:', e);
  }
}

// Helper: get physiotherapist profile id for a user id
async function getPhysioProfileIdForUser(userId) {
  const profile = await prisma.physiotherapistProfile.findUnique({ where: { userId: parseInt(userId) }, select: { id: true } });
  return profile?.id || null;
}

// Therapist: accept booking (set status to confirmed)
export async function therapistAcceptBooking(bookingId, therapistUserId) {
  try {
    const physioId = await getPhysioProfileIdForUser(therapistUserId);
    if (!physioId) return { success: false, error: 'Physiotherapist profile not found' };

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        status: true, 
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        physiotherapist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        clinic: {
          select: {
            name: true,
            addressLine1: true,
            city: {
              select: {
                name: true
              }
            }
          }
        },
        treatmentType: {
          select: {
            name: true
          }
        }
      }
    });
    if (!booking) return { success: false, error: 'Booking not found' };
    if (booking.physiotherapistId !== physioId) return { success: false, error: 'Unauthorized' };
    if (booking.status.name !== 'pending') return { success: false, error: 'Only pending bookings can be accepted' };

    const confirmedStatusId = await getStatusIdByName('confirmed');
    if (!confirmedStatusId) return { success: false, error: 'Status configuration missing' };

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { statusId: confirmedStatusId, updatedAt: new Date() },
      include: { status: true }
    });

    await createNotification(
      booking.patient.id,
      'Booking Confirmed',
      `Your booking ${booking.bookingReference} has been confirmed.`,
      'booking'
    );

    // Prepare booking data for email notifications
    const bookingDataForEmail = {
      bookingReference: booking.bookingReference,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      durationMinutes: booking.durationMinutes,
      totalAmount: booking.totalAmount ? parseFloat(booking.totalAmount.toString()) : null,
      patient: booking.patient,
      physiotherapist: {
        name: `Dr. ${booking.physiotherapist.user.firstName} ${booking.physiotherapist.user.lastName}`,
        email: booking.physiotherapist.user.email
      },
      clinic: booking.clinic,
      treatmentType: booking.treatmentType?.name,
      patientNotes: booking.patientNotes
    };

    // Send confirmation email notifications (non-blocking)
    try {
      const emailResults = await sendBookingConfirmationNotification(bookingDataForEmail);
      console.log('Confirmation email notification results:', emailResults);
    } catch (emailError) {
      console.error('Error sending confirmation email notifications:', emailError);
      // Don't fail the confirmation if emails fail
    }

    return { success: true, data: { id: updated.id, status: updated.status.name } };
  } catch (error) {
    console.error('Error accepting booking:', error);
    return { success: false, error: 'Failed to accept booking' };
  } finally {
    await prisma.$disconnect();
  }
}

// Therapist: reject booking (set status to cancelled with reason)
export async function therapistRejectBooking(bookingId, therapistUserId, reason = 'Not specified') {
  try {
    const physioId = await getPhysioProfileIdForUser(therapistUserId);
    if (!physioId) return { success: false, error: 'Physiotherapist profile not found' };

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        status: true, 
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        physiotherapist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        clinic: {
          select: {
            name: true,
            addressLine1: true,
            city: {
              select: {
                name: true
              }
            }
          }
        },
        treatmentType: {
          select: {
            name: true
          }
        }
      }
    });
    if (!booking) return { success: false, error: 'Booking not found' };
    if (booking.physiotherapistId !== physioId) return { success: false, error: 'Unauthorized' };
    if (booking.status.name === 'cancelled') return { success: false, error: 'Booking already cancelled' };
    if (booking.status.name === 'completed') return { success: false, error: 'Cannot reject completed booking' };

    const cancelledStatusId = await getStatusIdByName('cancelled');
    if (!cancelledStatusId) return { success: false, error: 'Status configuration missing' };

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { statusId: cancelledStatusId, cancellationReason: reason, cancelledAt: new Date(), updatedAt: new Date() },
      include: { status: true }
    });

    await createNotification(
      booking.patient.id,
      'Booking Cancelled',
      `Your booking ${booking.bookingReference} was cancelled by the therapist. Reason: ${reason}`,
      'booking'
    );

    // Prepare booking data for email notifications
    const bookingDataForEmail = {
      bookingReference: booking.bookingReference,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      durationMinutes: booking.durationMinutes,
      totalAmount: booking.totalAmount ? parseFloat(booking.totalAmount.toString()) : null,
      patient: booking.patient,
      physiotherapist: {
        name: `Dr. ${booking.physiotherapist.user.firstName} ${booking.physiotherapist.user.lastName}`,
        email: booking.physiotherapist.user.email
      },
      clinic: booking.clinic,
      treatmentType: booking.treatmentType?.name,
      patientNotes: booking.patientNotes
    };

    // Send cancellation email notifications (non-blocking)
    try {
      const emailResults = await sendBookingCancellationNotification(bookingDataForEmail, 'Therapist');
      console.log('Rejection email notification results:', emailResults);
    } catch (emailError) {
      console.error('Error sending rejection email notifications:', emailError);
      // Don't fail the rejection if emails fail
    }

    return { success: true, data: { id: updated.id, status: updated.status.name } };
  } catch (error) {
    console.error('Error rejecting booking:', error);
    return { success: false, error: 'Failed to reject booking' };
  } finally {
    await prisma.$disconnect();
  }
}

// Therapist: reschedule booking (update date/time)
export async function therapistRescheduleBooking(bookingId, therapistUserId, newAppointmentDate, newAppointmentTime) {
  try {
    const physioId = await getPhysioProfileIdForUser(therapistUserId);
    if (!physioId) return { success: false, error: 'Physiotherapist profile not found' };

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        status: true, 
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        physiotherapist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        clinic: {
          select: {
            name: true,
            addressLine1: true,
            city: {
              select: {
                name: true
              }
            }
          }
        },
        treatmentType: {
          select: {
            name: true
          }
        }
      }
    });
    if (!booking) return { success: false, error: 'Booking not found' };
    if (booking.physiotherapistId !== physioId) return { success: false, error: 'Unauthorized' };
    if (booking.status.name === 'cancelled' || booking.status.name === 'completed') return { success: false, error: 'Cannot reschedule cancelled or completed booking' };

    // Validate time slot availability (simple check: no conflicting non-cancelled booking for same physio)
    const conflict = await prisma.booking.findFirst({
      where: {
        id: { not: bookingId },
        physiotherapistId: physioId,
        appointmentDate: new Date(newAppointmentDate),
        appointmentTime: newAppointmentTime,
        status: { name: { not: 'cancelled' } }
      }
    });
    if (conflict) return { success: false, error: 'The selected time slot is not available' };

    const sanitizedTime = newAppointmentTime.replace(/(AM|PM)/, '').trim();
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        appointmentDate: new Date(newAppointmentDate),
        appointmentTime: sanitizedTime,
        updatedAt: new Date()
      },
      include: { status: true }
    });

    await createNotification(
      booking.patient.id,
      'Booking Rescheduled',
      `Your booking ${booking.bookingReference} was rescheduled to ${newAppointmentDate} at ${sanitizedTime}.`,
      'booking'
    );

    // Prepare booking data for email notifications
    const bookingDataForEmail = {
      bookingReference: booking.bookingReference,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      durationMinutes: booking.durationMinutes,
      totalAmount: booking.totalAmount ? parseFloat(booking.totalAmount.toString()) : null,
      patient: booking.patient,
      physiotherapist: {
        name: `Dr. ${booking.physiotherapist.user.firstName} ${booking.physiotherapist.user.lastName}`,
        email: booking.physiotherapist.user.email
      },
      clinic: booking.clinic,
      treatmentType: booking.treatmentType?.name,
      patientNotes: booking.patientNotes
    };

    // Send reschedule email notifications (non-blocking)
    try {
      const emailResults = await sendBookingRescheduleNotification(bookingDataForEmail, newAppointmentDate, sanitizedTime);
      console.log('Reschedule email notification results:', emailResults);
    } catch (emailError) {
      console.error('Error sending reschedule email notifications:', emailError);
      // Don't fail the reschedule if emails fail
    }

    return { success: true, data: { id: updated.id, appointmentDate: updated.appointmentDate, appointmentTime: updated.appointmentTime } };
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    return { success: false, error: 'Failed to reschedule booking' };
  } finally {
    await prisma.$disconnect();
  }
}

// Therapist: delete booking (hard delete when necessary)
export async function therapistDeleteBooking(bookingId, therapistUserId) {
  try {
    const physioId = await getPhysioProfileIdForUser(therapistUserId);
    if (!physioId) return { success: false, error: 'Physiotherapist profile not found' };

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { patient: true }
    });
    if (!booking) return { success: false, error: 'Booking not found' };
    if (booking.physiotherapistId !== physioId) return { success: false, error: 'Unauthorized' };

    // Only allow delete for cancelled bookings to prevent data loss of active bookings
    const bookingWithStatus = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { status: true }
    });
    if (bookingWithStatus.status.name !== 'cancelled') {
      return { success: false, error: 'Only cancelled bookings can be deleted' };
    }

    await prisma.payment.deleteMany({ where: { bookingId } });
    await prisma.review.deleteMany({ where: { bookingId } });
    await prisma.treatmentSession.deleteMany({ where: { bookingId } });
    await prisma.booking.delete({ where: { id: bookingId } });

    await createNotification(
      booking.patient.id,
      'Booking Deleted',
      `Your cancelled booking ${booking.bookingReference} was removed by the therapist.`,
      'booking'
    );
    await notifyAdmins(
      'Booking Deleted',
      `Cancelled booking ${booking.bookingReference} was permanently removed by a therapist.`,
      'booking'
    );

    return { success: true };
  } catch (error) {
    console.error('Error deleting booking:', error);
    return { success: false, error: 'Failed to delete booking' };
  } finally {
    await prisma.$disconnect();
  }
}