import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const notificationId = params.id;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.update({
      where: { id: parseInt(notificationId) },
      data: { isRead: true }
    });

    return NextResponse.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

