import { NextResponse } from 'next/server';
import { getTherapistAvailableDatesForMonth } from '../../../../../../lib/actions/availability';

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const therapistId = params.id;

    if (!year || !month || !therapistId) {
      return NextResponse.json(
        { error: 'Year, month and therapist ID are required' },
        { status: 400 }
      );
    }

    const result = await getTherapistAvailableDatesForMonth(therapistId, parseInt(year), parseInt(month));
    
    if (result.success) {
      return NextResponse.json({ availableDates: result.data });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in monthly availability API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

