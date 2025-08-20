export const runtime = 'nodejs';
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

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
