const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTherapists() {
  try {
    console.log('=== THERAPIST DATABASE CHECK ===\n');

    // Get total count
    const totalCount = await prisma.physiotherapistProfile.count();
    console.log(`Total therapists in database: ${totalCount}`);

    // Get verified and available count
    const verifiedAvailableCount = await prisma.physiotherapistProfile.count({
      where: {
        isVerified: true,
        isAvailable: true
      }
    });
    console.log(`Verified and available therapists: ${verifiedAvailableCount}`);

    // Get all therapists with details
    const allTherapists = await prisma.physiotherapistProfile.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        user: {
          firstName: 'asc'
        }
      }
    });

    console.log('\n=== ALL THERAPISTS ===');
    allTherapists.forEach((therapist, index) => {
      console.log(`${index + 1}. ${therapist.user.firstName} ${therapist.user.lastName}`);
      console.log(`   ID: ${therapist.id}`);
      console.log(`   Email: ${therapist.user.email}`);
      console.log(`   Verified: ${therapist.isVerified ? '✅' : '❌'}`);
      console.log(`   Available: ${therapist.isAvailable ? '✅' : '❌'}`);
      console.log('');
    });

    // Show summary
    console.log('=== SUMMARY ===');
    console.log(`Total: ${totalCount}`);
    console.log(`Verified: ${allTherapists.filter(t => t.isVerified).length}`);
    console.log(`Available: ${allTherapists.filter(t => t.isAvailable).length}`);
    console.log(`Verified & Available: ${verifiedAvailableCount}`);

  } catch (error) {
    console.error('Error checking therapists:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTherapists();

