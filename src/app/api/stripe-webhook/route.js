export const runtime = 'nodejs';
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { sendPaymentSuccessNotification, sendPaymentFailedNotification } from '../../../lib/services/email.js'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

// Define your BookingStatus IDs
const BOOKING_STATUS = {
  PENDING: 1,
  CONFIRMED: 2,
  CANCELLED: 3,
  PAYMENT_FAILED: 4,
}

// Helper function to send notifications to all parties
async function sendPaymentSuccessNotifications(bookingData) {
  try {
    // Send confirmation email to patient
    await sendPaymentSuccessNotification(bookingData, 'patient');
    
    // Send notification to therapist
    await sendPaymentSuccessNotification(bookingData, 'therapist');
    
    // Send notification to admin
    await sendPaymentSuccessNotification(bookingData, 'admin');
    
    console.log('✅ Payment success notifications sent to all parties');
  } catch (error) {
    console.error('❌ Error sending payment success notifications:', error);
  }
}

// Helper function to send payment failed notifications
async function sendPaymentFailedNotifications(bookingData) {
  try {
    // Send payment failed email to patient
    await sendPaymentFailedNotification(bookingData, 'patient');
    
    // Send notification to therapist
    await sendPaymentFailedNotification(bookingData, 'therapist');
    
    // Send notification to admin
    await sendPaymentFailedNotification(bookingData, 'admin');
    
    console.log('❌ Payment failed notifications sent to all parties');
  } catch (error) {
    console.error('❌ Error sending payment failed notifications:', error);
  }
}

// Helper function to create notifications in database
async function createNotifications(bookingId, title, message, type = 'payment') {
  try {
    // Get booking with patient and therapist info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        patient: { select: { id: true } },
        physiotherapist: { 
          include: { 
            user: { select: { id: true } } 
          } 
        }
      }
    });

    if (!booking) return;

    // Get admin users
    const adminRole = await prisma.userRole.findFirst({ where: { name: 'admin' } });
    const admins = adminRole ? await prisma.user.findMany({ 
      where: { roleId: adminRole.id }, 
      select: { id: true } 
    }) : [];

    // Create notifications for all parties
    const notifications = [
      { userId: booking.patient.id, title, message, type },
      { userId: booking.physiotherapist.user.id, title, message, type },
      ...admins.map(admin => ({ userId: admin.id, title, message, type }))
    ];

    await prisma.notification.createMany({
      data: notifications
    });

    console.log(`✅ Created ${notifications.length} notifications for booking ${bookingId}`);
  } catch (error) {
    console.error('❌ Error creating notifications:', error);
  }
}

export async function POST(req) {
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    const bodyBuffer = Buffer.from(await req.arrayBuffer())
    event = stripe.webhooks.constructEvent(bodyBuffer, sig, endpointSecret)
  } catch (err) {
    console.error('❌ Webhook signature verification failed.', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const bookingId = session.metadata?.bookingId
        const paymentIntentId = session.payment_intent

        if (!bookingId) {
          console.warn('⚠️ Missing bookingId in metadata')
          break
        }

        // 1️⃣ Update payment record
        await prisma.payment.updateMany({
          where: { bookingId: Number(bookingId) },
          data: {
            stripePaymentIntentId: paymentIntentId,
            status: 'completed',
            processedAt: new Date(),
          },
        })

        // 2️⃣ Update booking status to CONFIRMED
        await prisma.booking.update({
          where: { id: Number(bookingId) },
          data: { statusId: BOOKING_STATUS.CONFIRMED },
        })

        // 3️⃣ Get booking data for notifications
        const booking = await prisma.booking.findUnique({
          where: { id: Number(bookingId) },
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
        });

        if (booking) {
          // 4️⃣ Prepare booking data for emails
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

          // 5️⃣ Send success notifications to all parties
          await sendPaymentSuccessNotifications(bookingDataForEmail);

          // 6️⃣ Create database notifications
          await createNotifications(
            Number(bookingId),
            'Payment Successful',
            `Payment completed for booking ${booking.bookingReference}. Amount: €${booking.totalAmount}`,
            'payment_success'
          );
        }

        console.log(`✅ Payment completed & booking confirmed for booking ${bookingId}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object

        // 1️⃣ Update payment record
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: {
            status: 'failed',
            processedAt: new Date(),
          },
        })

        // 2️⃣ Find booking by payment intent and mark as PAYMENT_FAILED
        const failedPayment = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id },
          select: { bookingId: true },
        })

        if (failedPayment?.bookingId) {
          await prisma.booking.update({
            where: { id: failedPayment.bookingId },
            data: { statusId: BOOKING_STATUS.PAYMENT_FAILED },
          })

          // 3️⃣ Get booking data for notifications
          const booking = await prisma.booking.findUnique({
            where: { id: failedPayment.bookingId },
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
          });

          if (booking) {
            // 4️⃣ Prepare booking data for emails
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

            // 5️⃣ Send payment failed notifications to all parties
            await sendPaymentFailedNotifications(bookingDataForEmail);

            // 6️⃣ Create database notifications
            await createNotifications(
              failedPayment.bookingId,
              'Payment Failed',
              `Payment failed for booking ${booking.bookingReference}. Amount: €${booking.totalAmount}`,
              'payment_failed'
            );
          }
        }

        console.log(`❌ Payment failed & booking updated for intent ${paymentIntent.id}`)
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error('❌ Webhook processing error:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
