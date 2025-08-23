import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET single slide
export async function GET(request, { params }) {
  try {
    const slide = await prisma.sliderSlide.findUnique({
      where: {
        id: parseInt(params.id),
      },
    });

    if (!slide) {
      return NextResponse.json(
        { error: 'Slide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ slide });
  } catch (error) {
    console.error('Error fetching slide:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slide' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT (update) slide
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    
    const slide = await prisma.sliderSlide.update({
      where: {
        id: parseInt(params.id),
      },
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

    return NextResponse.json({ slide });
  } catch (error) {
    console.error('Error updating slide:', error);
    return NextResponse.json(
      { error: 'Failed to update slide' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH (partial update) slide
export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    
    const slide = await prisma.sliderSlide.update({
      where: {
        id: parseInt(params.id),
      },
      data: body,
    });

    return NextResponse.json({ slide });
  } catch (error) {
    console.error('Error updating slide:', error);
    return NextResponse.json(
      { error: 'Failed to update slide' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE slide
export async function DELETE(request, { params }) {
  try {
    await prisma.sliderSlide.delete({
      where: {
        id: parseInt(params.id),
      },
    });

    return NextResponse.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting slide:', error);
    return NextResponse.json(
      { error: 'Failed to delete slide' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
