import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Therapist profile IDs to keep
const keepIds = [2151, 2034, 2125, 2158, 2157, 1985, 2160, 2248];
// Admin email to keep
const adminEmail = 'admin@yourdomain.com';

async function main() {
  // Find the admin's userId (if any therapist profile is linked to admin)
  const adminProfile = await prisma.physiotherapistProfile.findFirst({
    where: {
      user: {
        email: adminEmail
      }
    }
  });
  let adminProfileId = null;
  if (adminProfile) {
    adminProfileId = adminProfile.id;
    keepIds.push(adminProfileId);
  }

  // Find all therapist profiles
  const allProfiles = await prisma.physiotherapistProfile.findMany({
    select: { id: true }
  });
  const toDelete = allProfiles
    .map(p => p.id)
    .filter(id => !keepIds.includes(id));

  // Find all bookings for these therapists
  const allBookings = await prisma.booking.findMany({
    where: { physiotherapistId: { in: toDelete } },
    select: { id: true }
  });
  const bookingIds = allBookings.map(b => b.id);

  console.log(`Deleting treatment sessions for ${bookingIds.length} bookings...`);
  // Delete treatment sessions for these bookings
  const batchSize = 50;
  for (let i = 0; i < bookingIds.length; i += batchSize) {
    const batch = bookingIds.slice(i, i + batchSize);
    await prisma.treatmentSession.deleteMany({
      where: { bookingId: { in: batch } }
    });
    console.log(`Deleted treatment sessions batch ${i / batchSize + 1}`);
  }

  console.log(`Deleting reviews for ${bookingIds.length} bookings...`);
  // Delete reviews for these bookings
  for (let i = 0; i < bookingIds.length; i += batchSize) {
    const batch = bookingIds.slice(i, i + batchSize);
    await prisma.review.deleteMany({
      where: { bookingId: { in: batch } }
    });
    console.log(`Deleted reviews batch ${i / batchSize + 1}`);
  }

  console.log(`Deleting payments for ${bookingIds.length} bookings...`);
  // Delete payments for these bookings
  for (let i = 0; i < bookingIds.length; i += batchSize) {
    const batch = bookingIds.slice(i, i + batchSize);
    await prisma.payment.deleteMany({
      where: { bookingId: { in: batch } }
    });
    console.log(`Deleted payments batch ${i / batchSize + 1}`);
  }

  console.log(`Deleting ${bookingIds.length} bookings...`);
  // Delete bookings for these therapists
  for (let i = 0; i < bookingIds.length; i += batchSize) {
    const batch = bookingIds.slice(i, i + batchSize);
    await prisma.booking.deleteMany({
      where: { id: { in: batch } }
    });
    console.log(`Deleted bookings batch ${i / batchSize + 1}`);
  }

  console.log(`Deleting ${toDelete.length} therapist profiles...`);
  // Delete therapist profiles
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize);
    await prisma.physiotherapistProfile.deleteMany({
      where: { id: { in: batch } }
    });
    console.log(`Deleted therapist batch ${i / batchSize + 1}`);
  }

  console.log('Done.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
