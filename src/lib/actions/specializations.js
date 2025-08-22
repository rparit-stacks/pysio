'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getTherapistSpecializations(userId) {
  try {
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { userId: Number(userId) },
      include: {
        specializations: {
          include: {
            specialization: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    if (!profile) {
      return { success: false, error: 'Physiotherapist profile not found' };
    }

    const specializations = profile.specializations.map(ps => ({
      id: ps.id,
      createdAt: ps.createdAt.toISOString(),
      specialization: ps.specialization
    }));

    return { success: true, data: specializations };
  } catch (error) {
    console.error('Error fetching therapist specializations:', error);
    return { success: false, error: 'Failed to fetch specializations' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAllSpecializations() {
  try {
    const specializations = await prisma.specialization.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: { name: 'asc' }
    });

    return { success: true, data: specializations };
  } catch (error) {
    console.error('Error fetching all specializations:', error);
    return { success: false, error: 'Failed to fetch specializations' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function addTherapistSpecialization(userId, specializationId) {
  try {
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { userId: Number(userId) },
      select: { id: true }
    });

    if (!profile) {
      return { success: false, error: 'Physiotherapist profile not found' };
    }

    // Check if already exists
    const existing = await prisma.physiotherapistSpecialization.findFirst({
      where: {
        physiotherapistId: profile.id,
        specializationId: Number(specializationId)
      }
    });

    if (existing) {
      return { success: false, error: 'Specialization already added' };
    }

    await prisma.physiotherapistSpecialization.create({
      data: {
        physiotherapistId: profile.id,
        specializationId: Number(specializationId)
      }
    });

    return { success: true, message: 'Specialization added successfully' };
  } catch (error) {
    console.error('Error adding therapist specialization:', error);
    return { success: false, error: 'Failed to add specialization' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function removeTherapistSpecialization(userId, specializationId) {
  try {
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { userId: Number(userId) },
      select: { id: true }
    });

    if (!profile) {
      return { success: false, error: 'Physiotherapist profile not found' };
    }

    await prisma.physiotherapistSpecialization.deleteMany({
      where: {
        physiotherapistId: profile.id,
        specializationId: Number(specializationId)
      }
    });

    return { success: true, message: 'Specialization removed successfully' };
  } catch (error) {
    console.error('Error removing therapist specialization:', error);
    return { success: false, error: 'Failed to remove specialization' };
  } finally {
    await prisma.$disconnect();
  }
}