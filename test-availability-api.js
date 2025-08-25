const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAvailabilityAPI() {
  try {
    console.log('🧪 Testing Availability API Functions...\n');
    
    // 1. Get a therapist to test with
    console.log('1. Getting a test therapist...');
    const therapist = await prisma.physiotherapistProfile.findFirst({
      where: {
        isAvailable: true
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!therapist) {
      console.log('❌ No therapists found for testing');
      return;
    }

    console.log(`   Using therapist: ${therapist.user.firstName} ${therapist.user.lastName} (ID: ${therapist.id})\n`);

    // 2. Test getTherapistAvailableSlots function
    console.log('2. Testing getTherapistAvailableSlots...');
    const { getTherapistAvailableSlots } = require('./src/lib/actions/availability');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const testDate = tomorrow.toISOString().split('T')[0];
    
    console.log(`   Testing date: ${testDate}`);
    
    try {
      const slotsResult = await getTherapistAvailableSlots(therapist.id, testDate);
      console.log(`   Result:`, slotsResult);
      
      if (slotsResult.success) {
        console.log(`   ✅ Success! Found ${slotsResult.data.length} available slots`);
        if (slotsResult.data.length > 0) {
          console.log(`   Sample slots: ${slotsResult.data.slice(0, 3).map(s => s.displayTime).join(', ')}`);
        }
      } else {
        console.log(`   ❌ Failed: ${slotsResult.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
    }
    console.log('');

    // 3. Test getTherapistAvailableDatesForMonth function
    console.log('3. Testing getTherapistAvailableDatesForMonth...');
    const { getTherapistAvailableDatesForMonth } = require('./src/lib/actions/availability');
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    console.log(`   Testing month: ${currentMonth}/${currentYear}`);
    
    try {
      const datesResult = await getTherapistAvailableDatesForMonth(therapist.id, currentYear, currentMonth);
      console.log(`   Result:`, datesResult);
      
      if (datesResult.success) {
        console.log(`   ✅ Success! Found ${datesResult.data.length} available dates`);
        if (datesResult.data.length > 0) {
          console.log(`   Sample dates: ${datesResult.data.slice(0, 5).join(', ')}`);
        }
      } else {
        console.log(`   ❌ Failed: ${datesResult.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
    }
    console.log('');

    // 4. Test database queries directly
    console.log('4. Testing database queries directly...');
    
    // Check availability templates
    const templates = await prisma.availabilityTemplate.findMany({
      where: {
        physiotherapistId: therapist.id,
        isActive: true
      }
    });
    console.log(`   Active templates: ${templates.length}`);
    
    // Check specific availability
    const specificAvailability = await prisma.specificAvailability.findMany({
      where: {
        physiotherapistId: therapist.id,
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lte: new Date(currentYear, currentMonth, 0)
        }
      }
    });
    console.log(`   Specific availability entries: ${specificAvailability.length}`);
    
    // Check bookings
    const bookings = await prisma.booking.findMany({
      where: {
        physiotherapistId: therapist.id,
        appointmentDate: {
          gte: new Date()
        }
      },
      include: {
        status: true
      }
    });
    console.log(`   Future bookings: ${bookings.length}`);
    
    console.log('');

    // 5. Summary
    console.log('📋 SUMMARY:');
    console.log(`   ✅ Test therapist: ${therapist.user.firstName} ${therapist.user.lastName}`);
    console.log(`   ✅ Therapist ID: ${therapist.id}`);
    console.log(`   ✅ Active templates: ${templates.length}`);
    console.log(`   ✅ Specific availability: ${specificAvailability.length}`);
    console.log(`   ✅ Future bookings: ${bookings.length}`);

  } catch (error) {
    console.error('❌ Error testing availability API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAvailabilityAPI()
  .catch((e) => {
    console.error('❌ Test failed:', e);
    process.exit(1);
  });
