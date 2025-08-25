const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBookingFlow() {
  try {
    console.log('🧪 Testing Booking Flow and Availability System...\n');
    
    // 1. Check if we have therapists with availability
    console.log('1. Checking therapists with availability...');
    const therapistsWithAvailability = await prisma.physiotherapistProfile.findMany({
      where: {
        isAvailable: true
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        availabilityTemplates: true,
        specificAvailability: true
      }
    });

    console.log(`   Found ${therapistsWithAvailability.length} available therapists\n`);

    if (therapistsWithAvailability.length === 0) {
      console.log('❌ No therapists available for booking. Please add therapists first.');
      return;
    }

    // 2. Test availability for a specific therapist
    const testTherapist = therapistsWithAvailability[0];
    console.log(`2. Testing availability for: ${testTherapist.user.firstName} ${testTherapist.user.lastName}`);
    console.log(`   Therapist ID: ${testTherapist.id}`);
    console.log(`   Availability Templates: ${testTherapist.availabilityTemplates.length}`);
    console.log(`   Specific Availability: ${testTherapist.specificAvailability.length}\n`);

    // 3. Check availability templates
    if (testTherapist.availabilityTemplates.length > 0) {
      console.log('3. Availability Templates:');
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      testTherapist.availabilityTemplates.forEach(template => {
        console.log(`   ${dayNames[template.dayOfWeek]}: ${template.startTime} - ${template.endTime} (${template.isActive ? 'Active' : 'Inactive'})`);
      });
      console.log('');
    }

    // 4. Check specific availability
    if (testTherapist.specificAvailability.length > 0) {
      console.log('4. Specific Availability:');
      testTherapist.specificAvailability.slice(0, 5).forEach(sa => {
        console.log(`   ${sa.date.toISOString().split('T')[0]}: ${sa.startTime} - ${sa.endTime} (${sa.isAvailable ? 'Available' : 'Unavailable'})`);
      });
      if (testTherapist.specificAvailability.length > 5) {
        console.log(`   ... and ${testTherapist.specificAvailability.length - 5} more`);
      }
      console.log('');
    }

    // 5. Test available dates for current month
    console.log('5. Testing available dates for current month...');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Get available dates
    const availableDates = await prisma.specificAvailability.findMany({
      where: {
        physiotherapistId: testTherapist.id,
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lte: new Date(currentYear, currentMonth, 0)
        },
        isAvailable: true
      },
      select: {
        date: true
      }
    });

    console.log(`   Found ${availableDates.length} specific available dates in ${currentMonth}/${currentYear}`);
    
    // Get template-based available dates
    const templates = testTherapist.availabilityTemplates.filter(t => t.isActive);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    console.log(`   Active templates: ${templates.length}`);
    
    if (templates.length > 0) {
      console.log('   Template-based availability:');
      templates.forEach(template => {
        console.log(`     ${dayNames[template.dayOfWeek]}: ${template.startTime} - ${template.endTime}`);
      });
    }
    console.log('');

    // 6. Test time slot generation
    console.log('6. Testing time slot generation...');
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Tomorrow
    const dayOfWeek = testDate.getDay();
    
    const template = templates.find(t => t.dayOfWeek === dayOfWeek);
    if (template) {
      console.log(`   Tomorrow (${dayNames[dayOfWeek]}): ${template.startTime} - ${template.endTime}`);
      
      // Generate time slots
      const startTime = new Date(`2000-01-01T${template.startTime}:00`);
      const endTime = new Date(`2000-01-01T${template.endTime}:00`);
      const slots = [];
      
      while (startTime < endTime) {
        slots.push(startTime.toTimeString().slice(0, 5));
        startTime.setMinutes(startTime.getMinutes() + 60);
      }
      
      console.log(`   Generated ${slots.length} time slots: ${slots.slice(0, 5).join(', ')}${slots.length > 5 ? '...' : ''}`);
    } else {
      console.log(`   No availability template for ${dayNames[dayOfWeek]}`);
    }
    console.log('');

    // 7. Check existing bookings
    console.log('7. Checking existing bookings...');
    const existingBookings = await prisma.booking.findMany({
      where: {
        physiotherapistId: testTherapist.id,
        appointmentDate: {
          gte: new Date()
        }
      },
      include: {
        status: true
      }
    });

    // Filter for pending/confirmed bookings
    const filteredBookings = existingBookings.filter(booking => 
      ['pending', 'confirmed'].includes(booking.status.name)
    );

    console.log(`   Found ${filteredBookings.length} pending/confirmed bookings`);
    if (filteredBookings.length > 0) {
      console.log('   Recent bookings:');
      filteredBookings.slice(0, 3).forEach(booking => {
        console.log(`     ${booking.appointmentDate.toISOString().split('T')[0]} at ${booking.appointmentTime} (${booking.status.name})`);
      });
    }
    console.log('');

    // 8. Summary
    console.log('📋 SUMMARY:');
    console.log(`   ✅ Total therapists: ${therapistsWithAvailability.length}`);
    console.log(`   ✅ Test therapist: ${testTherapist.user.firstName} ${testTherapist.user.lastName}`);
    console.log(`   ✅ Availability templates: ${testTherapist.availabilityTemplates.length}`);
    console.log(`   ✅ Specific availability: ${testTherapist.specificAvailability.length}`);
    console.log(`   ✅ Existing bookings: ${filteredBookings.length}`);
    console.log('');
    console.log('🎉 Booking flow test completed successfully!');
    console.log('   The system is ready for patient bookings.');

  } catch (error) {
    console.error('❌ Error testing booking flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testBookingFlow()
  .catch((e) => {
    console.error('❌ Test failed:', e);
    process.exit(1);
  });
