const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Default availability template - available every day 9 AM to 9 PM
const DEFAULT_AVAILABILITY_TEMPLATE = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '21:00', isActive: true }, // Monday
  { dayOfWeek: 2, startTime: '09:00', endTime: '21:00', isActive: true }, // Tuesday
  { dayOfWeek: 3, startTime: '09:00', endTime: '21:00', isActive: true }, // Wednesday
  { dayOfWeek: 4, startTime: '09:00', endTime: '21:00', isActive: true }, // Thursday
  { dayOfWeek: 5, startTime: '09:00', endTime: '21:00', isActive: true }, // Friday
  { dayOfWeek: 6, startTime: '09:00', endTime: '21:00', isActive: true }, // Saturday
  { dayOfWeek: 0, startTime: '09:00', endTime: '21:00', isActive: true }, // Sunday
];

async function initializeDefaultAvailabilityForAll() {
  try {
    console.log('🔍 Checking for therapists without availability...');
    
    // Get all therapists
    const therapists = await prisma.physiotherapistProfile.findMany({
      select: { 
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log(`📊 Found ${therapists.length} therapists total`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const therapist of therapists) {
      // Check if therapist has any availability templates
      const existingTemplates = await prisma.availabilityTemplate.findMany({
        where: { physiotherapistId: therapist.id }
      });

      if (existingTemplates.length === 0) {
        // Create default availability templates
        const defaultTemplates = DEFAULT_AVAILABILITY_TEMPLATE.map(template => ({
          physiotherapistId: therapist.id,
          dayOfWeek: template.dayOfWeek,
          startTime: template.startTime,
          endTime: template.endTime,
          isActive: template.isActive
        }));

        await prisma.availabilityTemplate.createMany({
          data: defaultTemplates
        });

        console.log(`✅ Created default availability for ${therapist.user.firstName} ${therapist.user.lastName} (${therapist.user.email})`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped ${therapist.user.firstName} ${therapist.user.lastName} - already has availability (${existingTemplates.length} templates)`);
        skippedCount++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`✅ Updated: ${updatedCount} therapists`);
    console.log(`⏭️  Skipped: ${skippedCount} therapists (already had availability)`);
    console.log(`📊 Total: ${therapists.length} therapists`);

    return { success: true, updatedCount, skippedCount, totalCount: therapists.length };
  } catch (error) {
    console.error('❌ Error initializing default availability:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Check current availability status
async function checkAvailabilityStatus() {
  try {
    console.log('🔍 Checking current availability status...');
    
    const therapists = await prisma.physiotherapistProfile.findMany({
      select: { 
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        availabilityTemplates: {
          select: { id: true }
        }
      }
    });

    const withAvailability = therapists.filter(t => t.availabilityTemplates.length > 0);
    const withoutAvailability = therapists.filter(t => t.availabilityTemplates.length === 0);

    console.log('\n📊 Current Availability Status:');
    console.log(`✅ With availability: ${withAvailability.length} therapists`);
    console.log(`❌ Without availability: ${withoutAvailability.length} therapists`);
    console.log(`📊 Total therapists: ${therapists.length}`);

    if (withoutAvailability.length > 0) {
      console.log('\n❌ Therapists without availability:');
      withoutAvailability.forEach(t => {
        console.log(`   - ${t.user.firstName} ${t.user.lastName} (${t.user.email})`);
      });
    }

    return { withAvailability: withAvailability.length, withoutAvailability: withoutAvailability.length, total: therapists.length };
  } catch (error) {
    console.error('❌ Error checking availability status:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  if (command === 'check') {
    await checkAvailabilityStatus();
  } else if (command === 'init') {
    await initializeDefaultAvailabilityForAll();
  } else {
    console.log('Usage:');
    console.log('  node scripts/initialize-availability.js check  - Check current availability status');
    console.log('  node scripts/initialize-availability.js init   - Initialize default availability for all therapists');
  }
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  });
