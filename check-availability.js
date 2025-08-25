const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAvailability() {
  try {
    console.log('🔍 Checking therapist availability status...\n');
    
    // Get all therapists with their availability info
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
          select: { 
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isActive: true
          }
        }
      }
    });

    console.log(`📊 Total therapists found: ${therapists.length}\n`);

    const withAvailability = [];
    const withoutAvailability = [];

    therapists.forEach(therapist => {
      if (therapist.availabilityTemplates.length > 0) {
        withAvailability.push(therapist);
      } else {
        withoutAvailability.push(therapist);
      }
    });

    console.log(`✅ Therapists WITH availability: ${withAvailability.length}`);
    console.log(`❌ Therapists WITHOUT availability: ${withoutAvailability.length}\n`);

    if (withoutAvailability.length > 0) {
      console.log('❌ Therapists without availability:');
      withoutAvailability.forEach(t => {
        console.log(`   - ${t.user.firstName} ${t.user.lastName} (${t.user.email})`);
      });
      console.log('');
    }

    if (withAvailability.length > 0) {
      console.log('✅ Therapists with availability:');
      withAvailability.forEach(t => {
        console.log(`   - ${t.user.firstName} ${t.user.lastName} (${t.availabilityTemplates.length} templates)`);
      });
      console.log('');
    }

    // Show sample availability for first therapist with availability
    if (withAvailability.length > 0) {
      const sampleTherapist = withAvailability[0];
      console.log(`📅 Sample availability for ${sampleTherapist.user.firstName} ${sampleTherapist.user.lastName}:`);
      sampleTherapist.availabilityTemplates.forEach(template => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[template.dayOfWeek];
        console.log(`   ${dayName}: ${template.startTime} - ${template.endTime} (${template.isActive ? 'Active' : 'Inactive'})`);
      });
      console.log('');
    }

    console.log('🎯 Summary:');
    console.log(`   - Total therapists: ${therapists.length}`);
    console.log(`   - With availability: ${withAvailability.length}`);
    console.log(`   - Without availability: ${withoutAvailability.length}`);
    console.log(`   - Percentage with availability: ${((withAvailability.length / therapists.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Error checking availability:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkAvailability()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  });
