'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getTherapistReviews(userId) {
  try {
    const profile = await prisma.physiotherapistProfile.findUnique({
      where: { userId: Number(userId) },
      include: {
        reviews: {
          include: {
            patient: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!profile) {
      return { success: false, error: 'Physiotherapist profile not found' };
    }

    // Calculate stats
    const reviews = profile.reviews;
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const ratingCounts = {
      fiveStarCount: reviews.filter(r => r.rating === 5).length,
      fourStarCount: reviews.filter(r => r.rating === 4).length,
      threeStarCount: reviews.filter(r => r.rating === 3).length,
      twoStarCount: reviews.filter(r => r.rating === 2).length,
      oneStarCount: reviews.filter(r => r.rating === 1).length
    };

    const stats = {
      totalReviews,
      averageRating,
      ...ratingCounts
    };

    // Format reviews
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      therapistResponse: review.therapistResponse,
      createdAt: review.createdAt.toISOString(),
      patient: review.patient
    }));

    return { 
      success: true, 
      data: { 
        reviews: formattedReviews,
        stats
      } 
    };
  } catch (error) {
    console.error('Error fetching therapist reviews:', error);
    return { success: false, error: 'Failed to fetch reviews' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function respondToReview(reviewId, response) {
  try {
    await prisma.review.update({
      where: { id: Number(reviewId) },
      data: { 
        therapistResponse: response,
        respondedAt: new Date()
      }
    });

    return { success: true, message: 'Response added successfully' };
  } catch (error) {
    console.error('Error responding to review:', error);
    return { success: false, error: 'Failed to add response' };
  } finally {
    await prisma.$disconnect();
  }
}