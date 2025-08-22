import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupUsers() {
  try {
    console.log('Starting user cleanup...');

    // Get admin user (keep this one)
    const adminUser = await prisma.user.findFirst({
      where: {
        role: {
          name: 'Admin'
        }
      },
      include: {
        role: true
      }
    });

    if (!adminUser) {
      console.log('No admin user found!');
      return;
    }

    console.log(`Found admin user: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.email})`);

    // Get 7 therapist users to keep
    const therapistUsers = await prisma.user.findMany({
      where: {
        role: {
          name: 'Physiotherapist'
        }
      },
      include: {
        role: true,
        physiotherapistProfile: true
      },
      take: 7
    });

    console.log(`Found ${therapistUsers.length} therapist users to keep`);

    // Create list of user IDs to keep
    const keepUserIds = [adminUser.id, ...therapistUsers.map(u => u.id)];
    console.log(`Keeping ${keepUserIds.length} users:`, keepUserIds);

    // Find all users to delete
    const allUsers = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true }
    });

    const usersToDelete = allUsers.filter(u => !keepUserIds.includes(u.id));
    const userIdsToDelete = usersToDelete.map(u => u.id);

    console.log(`Will delete ${usersToDelete.length} users:`);
    usersToDelete.forEach(u => {
      console.log(`- ${u.firstName} ${u.lastName} (${u.email})`);
    });

    if (userIdsToDelete.length === 0) {
      console.log('No users to delete.');
      return;
    }

    // Find physiotherapist profiles to delete
    const physioProfilesToDelete = await prisma.physiotherapistProfile.findMany({
      where: {
        userId: { in: userIdsToDelete }
      },
      select: { id: true }
    });

    const physioProfileIds = physioProfilesToDelete.map(p => p.id);
    console.log(`Found ${physioProfileIds.length} physiotherapist profiles to delete`);

    // Find bookings related to users/therapists to delete
    const bookingsToDelete = await prisma.booking.findMany({
      where: {
        OR: [
          { userId: { in: userIdsToDelete } }, // Patient bookings
          { physiotherapistId: { in: physioProfileIds } } // Therapist bookings
        ]
      },
      select: { id: true }
    });

    const bookingIds = bookingsToDelete.map(b => b.id);
    console.log(`Found ${bookingIds.length} bookings to delete`);

    // Start cleanup in transaction
    await prisma.$transaction(async (tx) => {
      console.log('Starting database cleanup transaction...');

      // Delete treatment sessions
      if (bookingIds.length > 0) {
        const deletedSessions = await tx.treatmentSession.deleteMany({
          where: { bookingId: { in: bookingIds } }
        });
        console.log(`Deleted ${deletedSessions.count} treatment sessions`);

        // Delete reviews
        const deletedReviews = await tx.review.deleteMany({
          where: { bookingId: { in: bookingIds } }
        });
        console.log(`Deleted ${deletedReviews.count} reviews`);

        // Delete payments
        const deletedPayments = await tx.payment.deleteMany({
          where: { bookingId: { in: bookingIds } }
        });
        console.log(`Deleted ${deletedPayments.count} payments`);

        // Delete bookings
        const deletedBookings = await tx.booking.deleteMany({
          where: { id: { in: bookingIds } }
        });
        console.log(`Deleted ${deletedBookings.count} bookings`);
      }

      // Delete notifications for users to be deleted
      const deletedNotifications = await tx.notification.deleteMany({
        where: { userId: { in: userIdsToDelete } }
      });
      console.log(`Deleted ${deletedNotifications.count} notifications`);

      // Delete physiotherapist specializations
      if (physioProfileIds.length > 0) {
        const deletedSpecializations = await tx.physiotherapistSpecialization.deleteMany({
          where: { physiotherapistId: { in: physioProfileIds } }
        });
        console.log(`Deleted ${deletedSpecializations.count} physiotherapist specializations`);

        // Delete clinic associations
        const deletedAssociations = await tx.clinicAssociation.deleteMany({
          where: { physiotherapistId: { in: physioProfileIds } }
        });
        console.log(`Deleted ${deletedAssociations.count} clinic associations`);

        // Delete physiotherapist profiles
        const deletedProfiles = await tx.physiotherapistProfile.deleteMany({
          where: { id: { in: physioProfileIds } }
        });
        console.log(`Deleted ${deletedProfiles.count} physiotherapist profiles`);
      }

      // Finally delete users
      const deletedUsers = await tx.user.deleteMany({
        where: { id: { in: userIdsToDelete } }
      });
      console.log(`Deleted ${deletedUsers.count} users`);
    });

    console.log('\n=== CLEANUP COMPLETE ===');
    console.log(`Kept 1 admin user: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`Kept ${therapistUsers.length} therapist users:`);
    therapistUsers.forEach(u => {
      console.log(`- ${u.firstName} ${u.lastName} (${u.email})`);
    });
    console.log(`Total users remaining: ${keepUserIds.length}`);

  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupUsers()
  .catch(e => {
    console.error('Cleanup failed:', e);
    process.exit(1);
  });