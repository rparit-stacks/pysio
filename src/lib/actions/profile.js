'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getCurrentUserWithProfile(userId) {
	try {
		const user = await prisma.user.findUnique({
			where: { id: Number(userId) },
			include: {
				role: true,
				physiotherapistProfile: true,
				addresses: {
					include: { city: true }
				}
			}
		});
		if (!user) return { success: false, error: 'User not found' };

		// Sanitize Prisma-specific types (Decimal/Date) to JSON-safe primitives
		const sanitized = {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			phone: user.phone,
			dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
			gender: user.gender,
			kycDocumentUrl: user.kycDocumentUrl ?? null,
			role: user.role ? { id: user.role.id, name: user.role.name, description: user.role.description ?? null } : null,
			addresses: Array.isArray(user.addresses) ? user.addresses.map(a => ({
				id: a.id,
				addressLine1: a.addressLine1,
				addressLine2: a.addressLine2,
				eircode: a.eircode,
				latitude: a.latitude != null ? Number(a.latitude) : null,
				longitude: a.longitude != null ? Number(a.longitude) : null,
				isPrimary: a.isPrimary,
				city: a.city ? { id: a.city.id, name: a.city.name, county: a.city.county } : null
			})) : [],
			physiotherapistProfile: user.physiotherapistProfile ? {
				id: user.physiotherapistProfile.id,
				userId: user.physiotherapistProfile.userId,
				coruRegistration: user.physiotherapistProfile.coruRegistration,
				qualification: user.physiotherapistProfile.qualification,
				yearsExperience: user.physiotherapistProfile.yearsExperience,
				bio: user.physiotherapistProfile.bio,
				hourlyRate: user.physiotherapistProfile.hourlyRate != null ? Number(user.physiotherapistProfile.hourlyRate) : null,
				profileImageUrl: user.physiotherapistProfile.profileImageUrl,
				kycDocumentUrl: user.physiotherapistProfile.kycDocumentUrl ?? null,
				isVerified: user.physiotherapistProfile.isVerified,
				isAvailable: user.physiotherapistProfile.isAvailable,
				createdAt: user.physiotherapistProfile.createdAt ? user.physiotherapistProfile.createdAt.toISOString() : null,
				updatedAt: user.physiotherapistProfile.updatedAt ? user.physiotherapistProfile.updatedAt.toISOString() : null
			} : null
		};

		return { success: true, data: sanitized };
	} catch (error) {
		console.error('Error fetching profile:', error);
		return { success: false, error: 'Failed to fetch profile' };
	} finally {
		await prisma.$disconnect();
	}
}

export async function updateUserProfile(userId, data) {
	try {
		const { firstName, lastName, phone, dateOfBirth, gender, kycDocumentUrl } = data;
		const updated = await prisma.user.update({
			where: { id: Number(userId) },
			data: {
				firstName: firstName ?? undefined,
				lastName: lastName ?? undefined,
				phone: phone ?? undefined,
				dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
				gender: gender ?? undefined,
				kycDocumentUrl: kycDocumentUrl ?? undefined,
				updatedAt: new Date()
			}
		});
		return { success: true, data: { id: updated.id } };
	} catch (error) {
		console.error('Error updating user profile:', error);
		return { success: false, error: 'Failed to update profile' };
	} finally {
		await prisma.$disconnect();
	}
}

export async function updateTherapistProfile(userId, data) {
	try {
		const profile = await prisma.physiotherapistProfile.findUnique({ where: { userId: Number(userId) }, select: { id: true } });
		if (!profile) return { success: false, error: 'Physiotherapist profile not found' };

		const { firstName, lastName, phone } = data;
		if (firstName || lastName || phone) {
			await prisma.user.update({
				where: { id: Number(userId) },
				data: {
					firstName: firstName ?? undefined,
					lastName: lastName ?? undefined,
					phone: phone ?? undefined
				}
			});
		}

		const {
			coruRegistration,
			qualification,
			yearsExperience,
			bio,
			hourlyRate,
			profileImageUrl,
			kycDocumentUrl
		} = data;

		const updated = await prisma.physiotherapistProfile.update({
			where: { id: profile.id },
			data: {
				coruRegistration: coruRegistration ?? undefined,
				qualification: qualification ?? undefined,
				yearsExperience: yearsExperience !== undefined ? Number(yearsExperience) : undefined,
				bio: bio ?? undefined,
				hourlyRate: hourlyRate !== undefined ? Number(hourlyRate) : undefined,
				profileImageUrl: profileImageUrl ?? undefined,
				kycDocumentUrl: kycDocumentUrl ?? undefined,
				updatedAt: new Date()
			}
		});
		return { success: true, data: { id: updated.id } };
	} catch (error) {
		console.error('Error updating therapist profile:', error);
		return { success: false, error: 'Failed to update therapist profile' };
	} finally {
		await prisma.$disconnect();
	}
} 