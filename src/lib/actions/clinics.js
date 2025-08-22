'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getTherapistClinics(userId) {
  try {
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { userId: Number(userId) },
      include: {
        clinicAssociations: {
          include: {
            clinic: {
              include: {
                city: {
                  select: {
                    id: true,
                    name: true,
                    county: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!profile) {
      return { success: false, error: 'Physiotherapist profile not found' };
    }

    const clinics = profile.clinicAssociations.map(pc => ({
      id: pc.id,
      isPrimary: pc.isPrimary,
      startDate: pc.startDate.toISOString(),
      clinic: {
        id: pc.clinic.id,
        name: pc.clinic.name,
        addressLine1: pc.clinic.addressLine1,
        addressLine2: pc.clinic.addressLine2,
        phone: pc.clinic.phone,
        email: pc.clinic.email,
        city: pc.clinic.city
      }
    }));

    return { success: true, data: clinics };
  } catch (error) {
    console.error('Error fetching therapist clinics:', error);
    return { success: false, error: 'Failed to fetch clinics' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAllClinics() {
  try {
    const clinics = await prisma.clinic.findMany({
      where: { isActive: true },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            county: true
          }
        }
      },
      orderBy: [
        { city: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    return { success: true, data: clinics };
  } catch (error) {
    console.error('Error fetching all clinics:', error);
    return { success: false, error: 'Failed to fetch clinics' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function addTherapistClinic(userId, clinicId, isPrimary = false) {
  try {
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { userId: Number(userId) },
      select: { id: true }
    });

    if (!profile) {
      return { success: false, error: 'Physiotherapist profile not found' };
    }

    // Check if already associated
    const existing = await prisma.physiotherapistClinic.findFirst({
      where: {
        physiotherapistId: profile.id,
        clinicId: Number(clinicId)
      }
    });

    if (existing) {
      return { success: false, error: 'Already associated with this clinic' };
    }

    // If setting as primary, remove primary from others
    if (isPrimary) {
      await prisma.physiotherapistClinic.updateMany({
        where: { physiotherapistId: profile.id },
        data: { isPrimary: false }
      });
    }

    await prisma.physiotherapistClinic.create({
      data: {
        physiotherapistId: profile.id,
        clinicId: Number(clinicId),
        isPrimary,
        startDate: new Date()
      }
    });

    return { success: true, message: 'Clinic association added successfully' };
  } catch (error) {
    console.error('Error adding therapist clinic:', error);
    return { success: false, error: 'Failed to add clinic association' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function removeTherapistClinic(userId, clinicId) {
  try {
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { userId: Number(userId) },
      select: { id: true }
    });

    if (!profile) {
      return { success: false, error: 'Physiotherapist profile not found' };
    }

    await prisma.physiotherapistClinic.deleteMany({
      where: {
        physiotherapistId: profile.id,
        clinicId: Number(clinicId)
      }
    });

    return { success: true, message: 'Clinic association removed successfully' };
  } catch (error) {
    console.error('Error removing therapist clinic:', error);
    return { success: false, error: 'Failed to remove clinic association' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateTherapistClinic(userId, clinicId, updates) {
  try {
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { userId: Number(userId) },
      select: { id: true }
    });

    if (!profile) {
      return { success: false, error: 'Physiotherapist profile not found' };
    }

    // If setting as primary, remove primary from others first
    if (updates.isPrimary) {
      await prisma.physiotherapistClinic.updateMany({
        where: { physiotherapistId: profile.id },
        data: { isPrimary: false }
      });
    }

    await prisma.physiotherapistClinic.updateMany({
      where: {
        physiotherapistId: profile.id,
        clinicId: Number(clinicId)
      },
      data: updates
    });

    return { success: true, message: 'Clinic association updated successfully' };
  } catch (error) {
    console.error('Error updating therapist clinic:', error);
    return { success: false, error: 'Failed to update clinic association' };
  } finally {
    await prisma.$disconnect();
  }
}