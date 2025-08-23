import { NextResponse } from 'next/server';
import { searchTherapists } from '../../../../lib/actions/physiotherapist';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit')) || 50;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ therapists: [] });
    }

    const result = await searchTherapists(query, limit);
    
    if (result.success) {
      return NextResponse.json({ therapists: result.data });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

