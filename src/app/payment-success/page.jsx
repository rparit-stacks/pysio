import Stripe from 'stripe';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

// Force dynamic rendering since this page uses Stripe API calls
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export default async function PaymentSuccess({ searchParams }) {
  const sessionId = searchParams?.session_id;
  const bookingId = searchParams?.booking_id;

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-center text-red-600 text-lg font-semibold">
          Missing payment session or booking information.
        </p>
      </div>
    );
  }

  let session = null;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-center text-red-600 text-lg font-semibold">
          Unable to retrieve payment details.
        </p>
      </div>
    );
  }

  const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : 'N/A';
  const status = session.payment_status || 'N/A';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 px-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
        <CheckCircle2 size={56} className="mx-auto mb-6 text-emerald-600" strokeWidth={1.5} />
        <h1 className="text-4xl font-extrabold text-emerald-700 mb-3">Payment Successful!</h1>
        <p className="text-gray-700 mb-6">Thank you for booking your appointment.</p>

        <div className="text-left space-y-2 max-w-xs mx-auto mb-8">
          <p className='text-gray-700' >
            <span className="font-semibold text-gray-700">Amount Paid:</span> €{amount}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Status:</span>{' '}
            <span
              className={`capitalize font-semibold ${
                status === 'paid' ? 'text-emerald-600' : 'text-yellow-600'
              }`}
            >
              {status}
            </span>
          </p>
          <p className='text-gray-700'>
            <span className="font-semibold text-gray-700">Booking Reference Number:</span> {bookingId}
          </p>
        </div>

        <Link
          href="/my-bookings"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md px-6 py-3 transition"
        >
          Your Bookings
        </Link>
      </div>
    </div>
  );
}
