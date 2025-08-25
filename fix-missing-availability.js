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

async function fixMissingAvailability() {
  try {
    console.log('🔧 Fixing missing availability for therapists...\n');
    
    // Get therapists without availability
    const therapistsWithoutAvailability = await prisma.physiotherapistProfile.findMany({
      where: {
        availabilityTemplates: {
          none: {}
        }
      },
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

    console.log(`📊 Found ${therapistsWithoutAvailability.length} therapists without availability\n`);

    if (therapistsWithoutAvailability.length === 0) {
      console.log('✅ All therapists already have availability!');
      return;
    }

    let fixedCount = 0;

    for (const therapist of therapistsWithoutAvailability) {
      console.log(`🔧 Fixing availability for ${therapist.user.firstName} ${therapist.user.lastName}...`);
      
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

      console.log(`✅ Created default availability for ${therapist.user.firstName} ${therapist.user.lastName}`);
      fixedCount++;
    }

    console.log(`\n🎉 Successfully fixed availability for ${fixedCount} therapists!`);
    console.log('📅 All therapists now have default availability: 9 AM - 9 PM, every day');

  } catch (error) {
    console.error('❌ Error fixing availability:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixMissingAvailability()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  });
