'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get all users with their details
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        addresses: {
          include: {
            city: true
          }
        },
        bookingsAsPatient: {
          include: {
            status: true,
            payments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate user statistics
    const usersWithStats = users.map(user => {
      const bookings = user.bookingsAsPatient;
      const completedBookings = bookings.filter(b => b.status.name === 'completed');
      const cancelledBookings = bookings.filter(b => b.status.name === 'cancelled');
      const totalSpent = bookings.reduce((sum, booking) => {
        const completedPayments = booking.payments.filter(p => p.status === 'completed');
        return sum + completedPayments.reduce((paySum, payment) => paySum + Number(payment.amount), 0);
      }, 0);

      const lastBooking = bookings.length > 0 ? 
        bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;

      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.addresses.find(addr => addr.isPrimary) || user.addresses[0],
        joinDate: user.createdAt,
        totalBookings: bookings.length,
        completedBookings: completedBookings.length,
        cancelledBookings: cancelledBookings.length,
        totalSpent: totalSpent,
        lastBooking: lastBooking?.appointmentDate || null,
        status: user.isActive ? 'active' : 'inactive',
        role: user.role.name
      };
    });

    return { success: true, data: usersWithStats };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  } finally {
    await prisma.$disconnect();
  }
}

// Get all therapists with their details
export async function getAllTherapists() {
  try {
    const therapists = await prisma.physiotherapistProfile.findMany({
      include: {
        user: {
          include: {
            role: true
          }
        },
        specializations: {
          include: {
            specialization: true
          }
        },
        clinicAssociations: {
          include: {
            clinic: {
              include: {
                city: true
              }
            }
          }
        },
        bookings: {
          include: {
            status: true,
            payments: true
          }
        },
        reviews: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const therapistsWithStats = therapists.map(therapist => {
      const bookings = therapist.bookings;
      const completedBookings = bookings.filter(b => b.status.name === 'completed');
      const cancelledBookings = bookings.filter(b => b.status.name === 'cancelled');
      const totalEarnings = bookings.reduce((sum, booking) => {
        const completedPayments = booking.payments.filter(p => p.status === 'completed');
        return sum + completedPayments.reduce((paySum, payment) => paySum + Number(payment.amount), 0);
      }, 0);

      const avgRating = therapist.reviews.length > 0 ? 
        therapist.reviews.reduce((sum, review) => sum + review.rating, 0) / therapist.reviews.length : 0;

      return {
        id: therapist.id,
        userId: therapist.userId,
        name: `${therapist.user.firstName} ${therapist.user.lastName}`,
        email: therapist.user.email,
        phone: therapist.user.phone,
        coruRegistration: therapist.coruRegistration,
        qualification: therapist.qualification,
        yearsExperience: therapist.yearsExperience,
        hourlyRate: Number(therapist.hourlyRate) || 0,
        bio: therapist.bio,
        specializations: therapist.specializations.map(s => s.specialization.name),
        clinics: therapist.clinicAssociations.map(ca => ({
          name: ca.clinic.name,
          city: ca.clinic.city.name,
          isPrimary: ca.isPrimary
        })),
        isVerified: therapist.isVerified,
        isAvailable: therapist.isAvailable,
        totalBookings: bookings.length,
        completedBookings: completedBookings.length,
        cancelledBookings: cancelledBookings.length,
        totalEarnings: totalEarnings,
        avgRating: avgRating,
        totalReviews: therapist.reviews.length,
        joinDate: therapist.createdAt,
        status: therapist.user.isActive ? 'active' : 'inactive'
      };
    });

    return { success: true, data: therapistsWithStats };
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return { success: false, error: 'Failed to fetch therapists' };
  } finally {
    await prisma.$disconnect();
  }
}

// Get all bookings with details
export async function getAllBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        patient: true,
        physiotherapist: {
          include: {
            user: true
          }
        },
        clinic: {
          include: {
            city: true
          }
        },
        status: true,
        treatmentType: true,
        payments: {
          include: {
            paymentMethod: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const bookingsWithDetails = bookings.map(booking => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      patientName: `${booking.patient.firstName} ${booking.patient.lastName}`,
      patientEmail: booking.patient.email,
      therapistName: `${booking.physiotherapist.user.firstName} ${booking.physiotherapist.user.lastName}`,
      clinicName: booking.clinic.name,
      clinicCity: booking.clinic.city.name,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      duration: booking.durationMinutes,
      treatmentType: booking.treatmentType?.name || 'General',
      status: booking.status.name,
      totalAmount: Number(booking.totalAmount) || 0,
      patientNotes: booking.patientNotes,
      therapistNotes: booking.therapistNotes,
      payments: booking.payments.map(payment => ({
        id: payment.id,
        amount: Number(payment.amount),
        status: payment.status,
        method: payment.paymentMethod.name,
        transactionId: payment.transactionId,
        processedAt: payment.processedAt
      })),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    return { success: true, data: bookingsWithDetails };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { success: false, error: 'Failed to fetch bookings' };
  } finally {
    await prisma.$disconnect();
  }
}

// Get all payments with details
export async function getAllPayments() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: {
            patient: true,
            physiotherapist: {
              include: {
                user: true
              }
            }
          }
        },
        paymentMethod: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const paymentsWithDetails = payments.map(payment => ({
      id: payment.id,
      bookingId: payment.bookingId,
      bookingReference: payment.booking.bookingReference,
      patientName: `${payment.booking.patient.firstName} ${payment.booking.patient.lastName}`,
      therapistName: `${payment.booking.physiotherapist.user.firstName} ${payment.booking.physiotherapist.user.lastName}`,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod.name,
      transactionId: payment.transactionId,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      sessionDate: payment.booking.appointmentDate,
      description: `Physical Therapy Session - ${payment.booking.treatmentType?.name || 'General Treatment'}`,
      date: payment.createdAt,
      processedAt: payment.processedAt
    }));

    return { success: true, data: paymentsWithDetails };
  } catch (error) {
    console.error('Error fetching payments:', error);
    return { success: false, error: 'Failed to fetch payments' };
  } finally {
    await prisma.$disconnect();
  }
}

// Get admin dashboard stats
export async function getAdminDashboardStats() {
  try {
    const [
      totalUsers,
      totalTherapists,
      totalBookings,
      totalRevenue,
      recentBookings,
      monthlyStats
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: {
            name: 'patient'
          }
        }
      }),
      prisma.physiotherapistProfile.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({
        where: {
          status: 'completed'
        },
        _sum: {
          amount: true
        }
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          patient: true,
          physiotherapist: {
            include: {
              user: true
            }
          },
          status: true
        }
      }),
      prisma.booking.groupBy({
        by: ['createdAt'],
        _count: {
          id: true
        },
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
          }
        }
      })
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        totalTherapists,
        totalBookings,
        totalRevenue: Number(totalRevenue._sum.amount) || 0,
        recentBookings: recentBookings.map(booking => ({
          id: booking.id,
          patientName: `${booking.patient.firstName} ${booking.patient.lastName}`,
          therapistName: `${booking.physiotherapist.user.firstName} ${booking.physiotherapist.user.lastName}`,
          date: booking.appointmentDate,
          status: booking.status.name,
          createdAt: booking.createdAt
        })),
        monthlyStats
      }
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return { success: false, error: 'Failed to fetch admin statistics' };
  } finally {
    await prisma.$disconnect();
  }
}

// Delete user
export async function deleteUser(userId) {
  try {
    await prisma.user.delete({
      where: {
        id: Number(userId)
      }
    });

    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  } finally {
    await prisma.$disconnect();
  }
}

// Delete multiple users
export async function deleteMultipleUsers(userIds) {
  try {
    const deletedCount = await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds.map(id => Number(id))
        }
      }
    });

    return { 
      success: true, 
      message: `${deletedCount.count} users deleted successfully`,
      deletedCount: deletedCount.count
    };
  } catch (error) {
    console.error('Error deleting multiple users:', error);
    return { success: false, error: 'Failed to delete users' };
  } finally {
    await prisma.$disconnect();
  }
}

// Delete multiple therapists
export async function deleteMultipleTherapists(therapistIds) {
  try {
    // First get the user IDs associated with these therapist profiles
    const therapistProfiles = await prisma.physiotherapistProfile.findMany({
      where: {
        id: {
          in: therapistIds.map(id => Number(id))
        }
      },
      select: {
        userId: true
      }
    });

    const userIds = therapistProfiles.map(profile => profile.userId);

    // Delete the users (this will cascade delete the therapist profiles)
    const deletedCount = await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds
        }
      }
    });

    return { 
      success: true, 
      message: `${deletedCount.count} therapists deleted successfully`,
      deletedCount: deletedCount.count
    };
  } catch (error) {
    console.error('Error deleting multiple therapists:', error);
    return { success: false, error: 'Failed to delete therapists' };
  } finally {
    await prisma.$disconnect();
  }
}

// Update user status
export async function updateUserStatus(userId, isActive) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(userId)
      },
      data: {
        isActive: isActive
      }
    });

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('Error updating user status:', error);
    return { success: false, error: 'Failed to update user status' };
  } finally {
    await prisma.$disconnect();
  }
}