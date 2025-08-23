import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await prisma.notification.updateMany({
      where: { 
        userId: parseInt(userId),
        isRead: false
      },
      data: { isRead: true }
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

