import { NextResponse } from 'next/server';
import { getTherapistAvailableSlots } from '../../../../../lib/actions/availability';

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const therapistId = params?.id;

    console.log('API Debug - params:', params);
    console.log('API Debug - therapistId:', therapistId);
    console.log('API Debug - date:', date);

    if (!date || !therapistId) {
      return NextResponse.json(
        { error: 'Date and therapist ID are required', debug: { date, therapistId, params } },
        { status: 400 }
      );
    }

    const result = await getTherapistAvailableSlots(therapistId, date);
    
    if (result.success) {
      return NextResponse.json({ slots: result.data });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in availability API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

