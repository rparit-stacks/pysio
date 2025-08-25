import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendBookingNotifications, sendPaymentSuccessNotification } from '../../../lib/services/email.js';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test 1: Check environment variables
    const envCheck = {
      SMTP_HOST: process.env.SMTP_HOST ? 'SET' : 'NOT SET',
      SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT SET',
      SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'NOT SET'
    };

    // Test 2: Check database connection
    let dbConnection = false;
    try {
      await prisma.$connect();
      dbConnection = true;
    } catch (error) {
      console.error('Database connection failed:', error);
    }

    // Test 3: Check if booking statuses exist
    let bookingStatuses = [];
    try {
      bookingStatuses = await prisma.bookingStatus.findMany();
    } catch (error) {
      console.error('Failed to fetch booking statuses:', error);
    }

    // Test 4: Check if users exist
    let users = [];
    try {
      users = await prisma.user.findMany({
        take: 5,
        include: {
          role: true
        }
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }

    // Test 5: Check if therapists exist
    let therapists = [];
    try {
      therapists = await prisma.physiotherapistProfile.findMany({
        take: 5,
        include: {
          user: true,
          clinics: true
        }
      });
    } catch (error) {
      console.error('Failed to fetch therapists:', error);
    }

    // Test 6: Check if clinics exist
    let clinics = [];
    try {
      clinics = await prisma.clinic.findMany({
        take: 5,
        include: {
          city: true
        }
      });
    } catch (error) {
      console.error('Failed to fetch clinics:', error);
    }

    // Test 7: Check recent bookings
    let recentBookings = [];
    try {
      recentBookings = await prisma.booking.findMany({
        take: 5,
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
          payments: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      console.error('Failed to fetch recent bookings:', error);
    }

    // Test 8: Check recent notifications
    let recentNotifications = [];
    try {
      recentNotifications = await prisma.notification.findMany({
        take: 5,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      console.error('Failed to fetch recent notifications:', error);
    }

    // Test 9: Check recent payments
    let recentPayments = [];
    try {
      recentPayments = await prisma.payment.findMany({
        take: 5,
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
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      console.error('Failed to fetch recent payments:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Booking flow test completed',
      results: {
        environment: envCheck,
        databaseConnection: dbConnection,
        bookingStatuses: {
          count: bookingStatuses.length,
          statuses: bookingStatuses.map(s => ({ id: s.id, name: s.name }))
        },
        users: {
          count: users.length,
          sample: users.map(u => ({ id: u.id, email: u.email, role: u.role.name }))
        },
        therapists: {
          count: therapists.length,
          sample: therapists.map(t => ({ 
            id: t.id, 
            name: `${t.user.firstName} ${t.user.lastName}`,
            email: t.user.email,
            clinics: t.clinics.length
          }))
        },
        clinics: {
          count: clinics.length,
          sample: clinics.map(c => ({ id: c.id, name: c.name, city: c.city.name }))
        },
        recentBookings: {
          count: recentBookings.length,
          sample: recentBookings.map(b => ({
            id: b.id,
            bookingReference: b.bookingReference,
            status: b.status.name,
            patient: `${b.patient.firstName} ${b.patient.lastName}`,
            therapist: `${b.physiotherapist.user.firstName} ${b.physiotherapist.user.lastName}`,
            clinic: b.clinic.name,
            payments: b.payments.length
          }))
        },
        recentNotifications: {
          count: recentNotifications.length,
          sample: recentNotifications.map(n => ({
            id: n.id,
            title: n.title,
            type: n.type,
            isRead: n.isRead,
            user: `${n.user.firstName} ${n.user.lastName}`
          }))
        },
        recentPayments: {
          count: recentPayments.length,
          sample: recentPayments.map(p => ({
            id: p.id,
            amount: p.amount,
            status: p.status,
            bookingReference: p.booking.bookingReference,
            patient: `${p.booking.patient.firstName} ${p.booking.patient.lastName}`
          }))
        }
      }
    });

  } catch (error) {
    console.error('Test booking flow error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
