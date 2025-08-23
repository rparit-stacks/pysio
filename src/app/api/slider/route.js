import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const slides = await prisma.sliderSlide.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        mediaType: true,
        mediaUrl: true,
        mobileMediaUrl: true,
        buttonText: true,
        buttonUrl: true,
        order: true,
      },
    });

    return NextResponse.json({ slides });
  } catch (error) {
    console.error('Error fetching slider slides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slider slides' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const slide = await prisma.sliderSlide.create({
      data: {
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        mediaType: body.mediaType,
        mediaUrl: body.mediaUrl,
        mobileMediaUrl: body.mobileMediaUrl,
        buttonText: body.buttonText,
        buttonUrl: body.buttonUrl,
        order: body.order,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({ slide }, { status: 201 });
  } catch (error) {
    console.error('Error creating slide:', error);
    return NextResponse.json(
      { error: 'Failed to create slide' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
