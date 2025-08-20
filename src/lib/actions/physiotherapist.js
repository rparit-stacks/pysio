'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getTherapistsBySpecializationName(specializationName) {
  try {
    console.log(`Fetching therapists with specialization: ${specializationName}`);

    const therapists = await prisma.physiotherapistProfile.findMany({
      where: {
        isAvailable: true,
        specializations: {
          some: {
            specialization: {
              name: specializationName,
              isActive: true
            }
          }
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        specializations: {
          include: {
            specialization: {
              select: {
                name: true
              }
            }
          }
        },
        clinicAssociations: {
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
                addressLine1: true,
                city: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      }
    });

    const transformed = therapists.map((physio) => {
      const avgRating = physio.reviews.length > 0
        ? physio.reviews.reduce((sum, review) => sum + review.rating, 0) / physio.reviews.length
        : 4.5;

      return {
        id: physio.id,
        name: `Dr. ${physio.user.firstName} ${physio.user.lastName}`,
        specialization: physio.specializations?.[0]?.specialization?.name || specializationName,
        experience: `${physio.yearsExperience || 5} years`,
        rating: Math.round(avgRating * 10) / 10,
        reviews: physio.reviews.length,
        location: physio.clinicAssociations?.[0]?.clinic?.city?.name || 'Unknown',
        image: physio.profileImageUrl || '/profile.png',
        qualifications: [
          physio.qualification || 'BSc Physiotherapy',
          `CORU: ${physio.coruRegistration || 'Registered'}`
        ],
        availableSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
        price: `€${Math.round(Number(physio.hourlyRate) || 75)}`,
        email: physio.user.email,
        phone: physio.user.phone,
        bio: physio.bio,
        clinics: physio.clinicAssociations.map((assoc) => ({
          id: assoc.clinic.id,
          name: assoc.clinic.name,
          address: assoc.clinic.addressLine1,
          city: assoc.clinic.city.name
        }))
      };
    });

    return { success: true, data: transformed };
  } catch (error) {
    console.error('Error fetching therapists by specialization:', error);
    return { success: false, error: 'Failed to fetch therapists' };
  } finally {
    await prisma.$disconnect();
  }
}







export async function getAllAvailablePhysiotherapists(skip = 0, limit = 50) {
  try {
    console.log(`Fetching ALL available physiotherapists (skip: ${skip}, limit: ${limit})`);

    const physiotherapists = await prisma.physiotherapistProfile.findMany({
      where: {
        isAvailable: true
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        specializations: {
          include: {
            specialization: {
              select: {
                name: true
              }
            }
          }
        },
        clinicAssociations: {
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
                addressLine1: true,
                city: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      }
    });

    console.log(`Found ${physiotherapists.length} physiotherapists (paginated)`);

    const transformed = physiotherapists.map(physio => {
      const avgRating = physio.reviews.length > 0 
        ? physio.reviews.reduce((sum, review) => sum + review.rating, 0) / physio.reviews.length
        : 4.5;

      return {
        id: physio.id,
        name: `Dr. ${physio.user.firstName} ${physio.user.lastName}`,
        specialization: physio.specializations?.[0]?.specialization?.name || 'Physiotherapy',
        experience: `${physio.yearsExperience || 5} years`,
        rating: Math.round(avgRating * 10) / 10,
        reviews: physio.reviews.length,
        location: physio.clinicAssociations?.[0]?.clinic?.city?.name || 'Unknown',
        image: physio.profileImageUrl || '/profile.png',
        qualifications: [
          physio.qualification || 'BSc Physiotherapy',
          `CORU: ${physio.coruRegistration || 'Registered'}`
        ],
        availableSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
        price: `€${Math.round(Number(physio.hourlyRate) || 75)}`,
        email: physio.user.email,
        phone: physio.user.phone,
        bio: physio.bio,
        clinics: physio.clinicAssociations.map(assoc => ({
          id: assoc.clinic.id,
          name: assoc.clinic.name,
          address: assoc.clinic.addressLine1,
          city: assoc.clinic.city.name
        }))
      };
    });

    return { success: true, data: transformed };
  } catch (error) {
    console.error('Error fetching all physiotherapists:', error);
    return { success: false, error: 'Failed to fetch physiotherapists' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getTwentyRandomTherapists() {
  try {
    const all = await prisma.physiotherapistProfile.findMany({
      where: {
        isAvailable: true
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        specializations: {
          include: {
            specialization: {
              select: {
                name: true
              }
            }
          }
        },
        clinicAssociations: {
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
                addressLine1: true,
                city: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      }
    });

    // Shuffle and pick 20
    const shuffled = all.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 20);

    // Transform the data
    const therapists = selected.map(physio => {
      const avgRating = physio.reviews.length > 0
        ? physio.reviews.reduce((sum, review) => sum + review.rating, 0) / physio.reviews.length
        : 4.5;

      return {
        id: physio.id,
        name: `Dr. ${physio.user.firstName} ${physio.user.lastName}`,
        specialization: physio.specializations?.[0]?.specialization?.name || 'Physiotherapy',
        experience: `${physio.yearsExperience || 5} years`,
        rating: Math.round(avgRating * 10) / 10,
        reviews: physio.reviews.length,
        location: physio.clinicAssociations?.[0]?.clinic?.city?.name || 'Unknown',
        image: physio.profileImageUrl || '/profile.png',
        qualifications: [
          physio.qualification || 'BSc Physiotherapy',
          `CORU: ${physio.coruRegistration || 'Registered'}`
        ],
        availableSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
        price: `€${Math.round(Number(physio.hourlyRate) || 75)}`,
        email: physio.user.email,
        phone: physio.user.phone,
        bio: physio.bio,
        clinics: physio.clinicAssociations.map(assoc => ({
          id: assoc.clinic.id,
          name: assoc.clinic.name,
          address: assoc.clinic.addressLine1,
          city: assoc.clinic.city.name
        }))
      };
    });

    return { success: true, data: therapists };
  } catch (error) {
    console.error("Error fetching 20 random therapists:", error);
    return { success: false, error: "Failed to fetch therapists" };
  } finally {
    await prisma.$disconnect();
  }
}




export async function getPhysiotherapistsByLocationAndSpecialization(location, specialization) {
  try {
    // Debug: Log what we're searching for
    console.log('Searching for:', { location, specialization });
    const physiotherapists = await prisma.physiotherapistProfile.findMany({
      where: {
        isAvailable: true,
        specializations: {
          some: {
            specialization: {
              name: specialization,
              isActive: true
            }
          }
        },
        clinicAssociations: {
          some: {
            clinic: {
              city: {
                name: {
                  equals: location,
                  mode: 'insensitive'
                }
              }
            }
          }
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        specializations: {
          include: {
            specialization: {
              select: {
                name: true
              }
            }
          }
        },
        clinicAssociations: {
          where: {
            clinic: {
              city: {
                name: {
                  equals: location,
                  mode: 'insensitive'
                }
              }
            }
          },
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
                addressLine1: true,
                city: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      }
    })

    // Debug: Log what we found
    console.log(`Found ${physiotherapists.length} physiotherapists for ${specialization} in ${location}`);

    // Transform data to match the expected format
    const transformedPhysiotherapists = physiotherapists.map(physio => {
      const avgRating = physio.reviews.length > 0 
        ? physio.reviews.reduce((sum, review) => sum + review.rating, 0) / physio.reviews.length
        : 4.5

      return {
        id: physio.id,
        name: `Dr. ${physio.user.firstName} ${physio.user.lastName}`,
        specialization: specialization,
        experience: `${physio.yearsExperience || 5} years`,
        rating: Math.round(avgRating * 10) / 10,
        reviews: physio.reviews.length,
        location: location,
        image: physio.profileImageUrl || "/profile.png",
        qualifications: [
          physio.qualification || "BSc Physiotherapy",
          `CORU: ${physio.coruRegistration || 'Registered'}`
        ],
        availableSlots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"], // Default slots
        price: `€${Math.round(Number(physio.hourlyRate) || 75)}`,
        email: physio.user.email,
        phone: physio.user.phone,
        bio: physio.bio,
        clinics: physio.clinicAssociations.map(assoc => ({
          id: assoc.clinic.id,
          name: assoc.clinic.name,
          address: assoc.clinic.addressLine1,
          city: assoc.clinic.city.name
        }))
      }
    })

    return { success: true, data: transformedPhysiotherapists }
  } catch (error) {
    console.error('Error fetching physiotherapists:', error)
    return { success: false, error: 'Failed to fetch physiotherapists' }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getAllSpecializations() {
  try {
    const specializations = await prisma.specialization.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true
      }
    })

    return { success: true, data: specializations }
  } catch (error) {
    console.error('Error fetching specializations:', error)
    return { success: false, error: 'Failed to fetch specializations' }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getAllCities() {
  try {
    const cities = await prisma.city.findMany({
      select: {
        id: true,
        name: true,
        county: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return { success: true, data: cities }
  } catch (error) {
    console.error('Error fetching cities:', error)
    return { success: false, error: 'Failed to fetch cities' }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getAllClinics() {
  try {
    const clinics = await prisma.clinic.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        addressLine1: true,
        addressLine2: true,
        eircode: true,
        phone: true,
        email: true,
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
    })

    return { success: true, data: clinics }
  } catch (error) {
    console.error('Error fetching clinics:', error)
    return { success: false, error: 'Failed to fetch clinics' }
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Admin action: verify or unverify a physiotherapist profile
 * @param {number} profileId - The physiotherapistProfile id
 * @param {boolean} isVerified - true to verify, false to unverify
 */
export async function updatePhysiotherapistVerification(profileId, isVerified) {
  try {
    const updated = await prisma.physiotherapistProfile.update({
      where: { id: profileId },
      data: { isVerified },
    });
    
    const serializedData = {
      id: updated.id,
      userId: updated.userId,
      coruRegistration: updated.coruRegistration,
      qualification: updated.qualification,
      yearsExperience: updated.yearsExperience,
      bio: updated.bio,
      hourlyRate: Number(updated.hourlyRate),
      profileImageUrl: updated.profileImageUrl,
      isVerified: updated.isVerified,
      isAvailable: updated.isAvailable,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString()
    };
    
    return { success: true, data: serializedData };
  } catch (error) {
    console.error('Error updating physiotherapist verification:', error);
    return { success: false, error: 'Failed to update verification status' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function updatePhysiotherapistAvailability(profileId, isAvailable) {
  try {
    const updated = await prisma.physiotherapistProfile.update({
      where: { id: profileId },
      data: { isAvailable },
    });
    
    const serializedData = {
      id: updated.id,
      userId: updated.userId,
      coruRegistration: updated.coruRegistration,
      qualification: updated.qualification,
      yearsExperience: updated.yearsExperience,
      bio: updated.bio,
      hourlyRate: Number(updated.hourlyRate),
      profileImageUrl: updated.profileImageUrl,
      isVerified: updated.isVerified,
      isAvailable: updated.isAvailable,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString()
    };
    
    return { success: true, data: serializedData };
  } catch (error) {
    console.error('Error updating physiotherapist availability:', error);
    return { success: false, error: 'Failed to update availability status' };
  } finally {
    await prisma.$disconnect();
  }
}

// Debug function to check what's actually in the database
export async function getAllPhysiotherapistProfilesForAdmin() {
  try {
    const profiles = await prisma.physiotherapistProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true
          }
        },
        specializations: {
          include: {
            specialization: {
              select: {
                name: true
              }
            }
          }
        },
        clinicAssociations: {
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
                addressLine1: true,
                city: {
                  select: {
                    name: true,
                    county: true
                  }
                }
              }
            }
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: [
        { isVerified: 'asc' },
        { user: { createdAt: 'desc' } }
      ]
    })

    const transformedProfiles = profiles.map(profile => {
      const avgRating = profile.reviews.length > 0 
        ? profile.reviews.reduce((sum, review) => sum + review.rating, 0) / profile.reviews.length
        : 0

      return {
        id: profile.id,
        userId: profile.user.id,
        name: `${profile.user.firstName} ${profile.user.lastName}`,
        email: profile.user.email,
        phone: profile.user.phone,
        coruRegistration: profile.coruRegistration,
        qualification: profile.qualification,
        yearsExperience: profile.yearsExperience,
        hourlyRate: Number(profile.hourlyRate),
        bio: profile.bio,
        isVerified: profile.isVerified,
        isAvailable: profile.isAvailable,
        profileImageUrl: profile.profileImageUrl,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: profile.reviews.length,
        registeredAt: profile.user.createdAt,
        specializations: profile.specializations.map(s => s.specialization.name),
        clinics: profile.clinicAssociations.map(assoc => ({
          id: assoc.clinic.id,
          name: assoc.clinic.name,
          address: assoc.clinic.addressLine1,
          city: assoc.clinic.city.name,
          county: assoc.clinic.city.county
        }))
      }
    })

    return { success: true, data: transformedProfiles }
  } catch (error) {
    console.error('Error fetching physiotherapist profiles for admin:', error)
    return { success: false, error: 'Failed to fetch physiotherapist profiles' }
  } finally {
    await prisma.$disconnect()
  }
}

export async function deletePhysiotherapistProfile(profileId) {
  try {
    // First check if profile exists
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        bookings: {
          where: {
            status: {
              name: {
                in: ['pending', 'confirmed']
              }
            }
          }
        }
      }
    });

    if (!profile) {
      return { success: false, error: 'Physiotherapist profile not found' };
    }

    // Check for active bookings
    if (profile.bookings.length > 0) {
      return { 
        success: false, 
        error: `Cannot delete profile: ${profile.bookings.length} active booking(s) exist. Cancel or complete all bookings first.`
      };
    }

    // Delete in transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Delete related records first
      await tx.physiotherapistSpecialization.deleteMany({
        where: { physiotherapistId: profileId }
      });

      await tx.physiotherapistClinic.deleteMany({
        where: { physiotherapistId: profileId }
      });

      await tx.availabilityTemplate.deleteMany({
        where: { physiotherapistId: profileId }
      });

      await tx.specificAvailability.deleteMany({
        where: { physiotherapistId: profileId }
      });

      // Delete reviews (keep them but anonymize?)
      await tx.review.deleteMany({
        where: { physiotherapistId: profileId }
      });

      // Delete completed/cancelled bookings
      await tx.booking.deleteMany({
        where: { 
          physiotherapistId: profileId,
          status: {
            name: {
              in: ['completed', 'cancelled']
            }
          }
        }
      });

      // Finally delete the profile
      const deletedProfile = await tx.physiotherapistProfile.delete({
        where: { id: profileId }
      });

      // Optionally delete the user account as well
      // await tx.user.delete({ where: { id: profile.userId } });

      return deletedProfile;
    });

    return { 
      success: true, 
      message: `Successfully deleted profile for ${profile.user.firstName} ${profile.user.lastName}`,
      data: {
        id: result.id,
        name: `${profile.user.firstName} ${profile.user.lastName}`,
        email: profile.user.email
      }
    };

  } catch (error) {
    console.error('Error deleting physiotherapist profile:', error);
    return { success: false, error: 'Failed to delete physiotherapist profile' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function debugDatabaseContents() {
  try {
    const physioCount = await prisma.physiotherapistProfile.count()
    const allPhysios = await prisma.physiotherapistProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    console.log('=== PHYSIOTHERAPIST DEBUG INFO ===')
    console.log('Total physiotherapists in DB:', physioCount)
    console.log('All physiotherapist profiles:', allPhysios.map(p => ({
      id: p.id,
      userId: p.userId,
      name: `${p.user.firstName} ${p.user.lastName}`,
      email: p.user.email,
      isVerified: p.isVerified,
      isAvailable: p.isAvailable
    })))

    return { 
      physioCount,
      profiles: allPhysios.map(p => ({
        id: p.id,
        userId: p.userId,
        name: `${p.user.firstName} ${p.user.lastName}`,
        email: p.user.email,
        isVerified: p.isVerified,
        isAvailable: p.isAvailable
      }))
    }
  } catch (error) {
    console.error('Debug error:', error)
    return { error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}