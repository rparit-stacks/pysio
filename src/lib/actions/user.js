'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all users for admin view
export async function getAllUsersForAdmin() {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const transformedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    }));

    return {
      success: true,
      data: transformedUsers
    };
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    return {
      success: false,
      error: 'Failed to fetch users'
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Get user count
export async function getUserCount() {
  try {
    const count = await prisma.user.count();
    return {
      success: true,
      data: count
    };
  } catch (error) {
    console.error('Error getting user count:', error);
    return {
      success: false,
      error: 'Failed to get user count'
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Get therapist count
export async function getTherapistCount() {
  try {
    const count = await prisma.physiotherapistProfile.count();
    return {
      success: true,
      data: count
    };
  } catch (error) {
    console.error('Error getting therapist count:', error);
    return {
      success: false,
      error: 'Failed to get therapist count'
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Get users by role
export async function getUsersByRole(roleName) {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          name: roleName
        }
      },
      include: {
        role: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const transformedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    }));

    return {
      success: true,
      data: transformedUsers
    };
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return {
      success: false,
      error: 'Failed to fetch users by role'
    };
  } finally {
    await prisma.$disconnect();
  }
}