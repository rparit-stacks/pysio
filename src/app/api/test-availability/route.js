import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { initializeDefaultAvailabilityForAll } from '../../../lib/actions/availability';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check current availability status
    const therapists = await prisma.physiotherapistProfile.findMany({
      select: { 
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        availabilityTemplates: {
          select: { id: true }
        }
      }
    });

    const withAvailability = therapists.filter(t => t.availabilityTemplates.length > 0);
    const withoutAvailability = therapists.filter(t => t.availabilityTemplates.length === 0);

    return NextResponse.json({
      success: true,
      message: 'Availability status check completed',
      results: {
        totalTherapists: therapists.length,
        withAvailability: withAvailability.length,
        withoutAvailability: withoutAvailability.length,
        therapistsWithoutAvailability: withoutAvailability.map(t => ({
          id: t.id,
          name: `${t.user.firstName} ${t.user.lastName}`,
          email: t.user.email
        }))
      }
    });

  } catch (error) {
    console.error('Error checking availability status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check availability status', 
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST() {
  try {
    // Initialize default availability for all therapists
    const result = await initializeDefaultAvailabilityForAll();
    
    return NextResponse.json({
      success: true,
      message: 'Default availability initialization completed',
      result
    });

  } catch (error) {
    console.error('Error initializing default availability:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize default availability', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
