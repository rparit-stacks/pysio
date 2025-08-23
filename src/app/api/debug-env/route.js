import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    };

    return NextResponse.json({
      success: true,
      environment: envVars,
      message: 'Environment variables check'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Environment check failed', details: error.message },
      { status: 500 }
    );
  }
}

