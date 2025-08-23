'use server'

import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { createBooking } from './booking.js'

const prisma = new PrismaClient()

// Check if Stripe key is available (only log, don't throw)
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })

export async function createBookingAndPayment({
  patientId,
  physiotherapistId,
  clinicId,
  appointmentTime,
  appointmentDate,
  totalAmount,
  currency = 'EUR',
  paymentMethodId,
  specialization,
  durationMinutes = 60,
  patientNotes = '',
}) {
  try {
    if (!patientId || !physiotherapistId || !clinicId || !appointmentTime || !totalAmount || !paymentMethodId) {
      throw new Error('Missing required booking or payment details')
    }

    const treatmentTypeId = null

    // 1️⃣ Create booking
    const booking = await createBooking({
      patientId,
      physiotherapistId,
      clinicId,
      appointmentDate,
      appointmentTime,
      durationMinutes,
      treatmentTypeId,
      patientNotes,
      totalAmount,
    })

    if (!booking?.success) {
      throw new Error(booking.error || 'Booking creation failed')
    }

    // 2️⃣ Create Stripe Checkout Session with timeout
    const sessionPromise = stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Therapy with ${specialization || 'Physiotherapist'}`,
              description: `Booking Ref: ${booking.data.bookingReference}`,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.data.bookingReference}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-cancel`,
      metadata: {
        bookingId: booking.data.id.toString(),
      },
    });

    // Add 10 second timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Stripe session creation timeout')), 10000)
    );

    const session = await Promise.race([sessionPromise, timeoutPromise]);

    // 3️⃣ Save payment as pending with both IDs (async, don't wait)
    prisma.payment.create({
      data: {
        bookingId: booking.data.id,
        paymentMethodId: 1,
        amount: totalAmount,
        currency,
        stripePaymentIntentId: session.payment_intent, // ✅ Store PI here
        transactionId: session.id, // ✅ Store session ID
        status: 'pending',
        processedAt: null,
      },
    }).catch(err => console.error('Payment record creation error:', err))

    return {
      success: true,
      checkoutUrl: session.url,
      bookingId: booking.data.id,
    }
  } catch (error) {
    console.error('Booking & Payment error:', error)
    
    // Provide more specific error messages
    if (error.message?.includes('Stripe')) {
      return { success: false, error: 'Payment gateway error: ' + error.message }
    } else if (error.message?.includes('booking')) {
      return { success: false, error: 'Booking error: ' + error.message }
    } else if (error.message?.includes('Missing required')) {
      return { success: false, error: 'Missing booking details: ' + error.message }
    } else {
      return { success: false, error: 'Payment session creation failed: ' + error.message }
    }
  }
}



export async function createPayment({
  bookingId,
  amount,
  currency = 'EUR',
  paymentMethodId = 1,
}) {
  try {
    if (!bookingId || !amount) {
      throw new Error('Missing required payment details')
    }

    // Fetch booking for metadata
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })
    if (!booking) throw new Error('Booking not found')

    // 1️⃣ Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Therapy Session`,
              description: `Booking Ref: ${booking.bookingReference}`,
            },
            unit_amount: Math.round(amount * 100), // cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-cancel`,
      metadata: {
        bookingId: bookingId.toString(),
      },
    })

    // 2️⃣ Save payment with pending status
    await prisma.payment.create({
      data: {
        bookingId,
        paymentMethodId,
        amount,
        currency,
        stripePaymentIntentId: '', // will be updated via webhook
        transactionId: session.id, // checkout session ID
        status: 'pending',
        processedAt: null,
      },
    })

    // 3️⃣ Return checkout URL
    return { success: true, checkoutUrl: session.url }
  } catch (error) {
    console.error('Payment creation error:', error)
    return { success: false, error: error.message }
  }
}