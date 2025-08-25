import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    // Check if Stripe key is set
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY is not set' },
        { status: 500 }
      );
    }

    // Check if base URL is set
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_BASE_URL is not set' },
        { status: 500 }
      );
    }

    // Test Stripe connection
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { 
      apiVersion: '2022-11-15' 
    });

    // Try to get account info to test connection
    const account = await stripe.accounts.retrieve();

    return NextResponse.json({
      success: true,
      message: 'Stripe is properly configured',
      accountId: account.id,
      environment: process.env.NODE_ENV,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      stripeKeyExists: !!process.env.STRIPE_SECRET_KEY
    });

  } catch (error) {
    console.error('Stripe test error:', error);
    return NextResponse.json(
      { 
        error: 'Stripe configuration error',
        details: error.message,
        stripeKeyExists: !!process.env.STRIPE_SECRET_KEY,
        baseUrlExists: !!process.env.NEXT_PUBLIC_BASE_URL
      },
      { status: 500 }
    );
  }
}



