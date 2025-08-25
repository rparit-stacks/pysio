const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findTherapistsWithoutAvailability() {
  try {
    console.log('🔍 Checking therapists without availability...\n');
    
    // Get all therapists
    const allTherapists = await prisma.physiotherapistProfile.findMany({
      where: {
        isAvailable: true // Only check active therapists
      },
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            availabilityTemplates: true,
            specificAvailability: true
          }
        }
      }
    });

    console.log(`📊 Found ${allTherapists.length} active therapists total\n`);

    // Filter therapists without any availability
    const therapistsWithoutAvailability = allTherapists.filter(therapist => {
      const hasTemplates = therapist._count.availabilityTemplates > 0;
      const hasSpecific = therapist._count.specificAvailability > 0;
      return !hasTemplates && !hasSpecific;
    });

    console.log(`❌ Found ${therapistsWithoutAvailability.length} therapists WITHOUT availability:\n`);

    if (therapistsWithoutAvailability.length === 0) {
      console.log('✅ All therapists have availability set up!');
    } else {
      therapistsWithoutAvailability.forEach((therapist, index) => {
        console.log(`${index + 1}. ID: ${therapist.id}`);
        console.log(`   Name: ${therapist.user.firstName} ${therapist.user.lastName}`);
        console.log(`   Email: ${therapist.user.email}`);
        console.log(`   Templates: ${therapist._count.availabilityTemplates}`);
        console.log(`   Specific: ${therapist._count.specificAvailability}`);
        console.log('');
      });
    }

    // Also show therapists with only partial availability
    const therapistsWithPartialAvailability = allTherapists.filter(therapist => {
      const hasTemplates = therapist._count.availabilityTemplates > 0;
      const hasSpecific = therapist._count.specificAvailability > 0;
      return (hasTemplates && !hasSpecific) || (!hasTemplates && hasSpecific);
    });

    if (therapistsWithPartialAvailability.length > 0) {
      console.log(`⚠️  Found ${therapistsWithPartialAvailability.length} therapists with PARTIAL availability:\n`);
      
      therapistsWithPartialAvailability.forEach((therapist, index) => {
        const hasTemplates = therapist._count.availabilityTemplates > 0;
        const hasSpecific = therapist._count.specificAvailability > 0;
        
        console.log(`${index + 1}. ID: ${therapist.id}`);
        console.log(`   Name: ${therapist.user.firstName} ${therapist.user.lastName}`);
        console.log(`   Email: ${therapist.user.email}`);
        console.log(`   Has Templates: ${hasTemplates ? '✅' : '❌'} (${therapist._count.availabilityTemplates})`);
        console.log(`   Has Specific: ${hasSpecific ? '✅' : '❌'} (${therapist._count.specificAvailability})`);
        console.log('');
      });
    }

    // Summary
    console.log('📋 SUMMARY:');
    console.log(`   Total active therapists: ${allTherapists.length}`);
    console.log(`   Without any availability: ${therapistsWithoutAvailability.length}`);
    console.log(`   With partial availability: ${therapistsWithPartialAvailability.length}`);
    console.log(`   With full availability: ${allTherapists.length - therapistsWithoutAvailability.length - therapistsWithPartialAvailability.length}`);

  } catch (error) {
    console.error('❌ Error checking availability:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
findTherapistsWithoutAvailability()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  });
