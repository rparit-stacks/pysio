'use client';

import Link from 'next/link';

export default function PaymentErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Payment Failed</h1>
        <p className="text-gray-700 mb-6">
          Unfortunately, your payment could not be processed at this time.
          Please try again or contact support if the problem persists.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/find-therapist"
            className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
