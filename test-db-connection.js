const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('🧪 Testing Database Connection...\n');
    
    // Test 1: Basic connection
    console.log('1. Testing basic database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connection successful');
    
    // Test 2: Check if we can query therapists
    console.log('\n2. Testing therapist query...');
    const therapistCount = await prisma.physiotherapistProfile.count();
    console.log(`   ✅ Found ${therapistCount} therapists in database`);
    
    // Test 3: Check availability templates
    console.log('\n3. Testing availability templates...');
    const templateCount = await prisma.availabilityTemplate.count();
    console.log(`   ✅ Found ${templateCount} availability templates`);
    
    // Test 4: Check specific availability
    console.log('\n4. Testing specific availability...');
    const specificCount = await prisma.specificAvailability.count();
    console.log(`   ✅ Found ${specificCount} specific availability entries`);
    
    // Test 5: Check bookings
    console.log('\n5. Testing bookings...');
    const bookingCount = await prisma.booking.count();
    console.log(`   ✅ Found ${bookingCount} bookings`);
    
    // Test 6: Get a sample therapist with full data
    console.log('\n6. Testing full therapist query...');
    const sampleTherapist = await prisma.physiotherapistProfile.findFirst({
      where: { isAvailable: true },
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
    
    if (sampleTherapist) {
      console.log(`   ✅ Sample therapist: ${sampleTherapist.user.firstName} ${sampleTherapist.user.lastName}`);
      console.log(`   ✅ Therapist ID: ${sampleTherapist.id}`);
      console.log(`   ✅ User ID: ${sampleTherapist.userId}`);
      console.log(`   ✅ Availability templates: ${sampleTherapist.availabilityTemplates.length}`);
      console.log(`   ✅ Specific availability: ${sampleTherapist.specificAvailability.length}`);
    } else {
      console.log('   ❌ No therapists found');
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('   ✅ Database connection: Working');
    console.log(`   ✅ Therapists: ${therapistCount}`);
    console.log(`   ✅ Templates: ${templateCount}`);
    console.log(`   ✅ Specific availability: ${specificCount}`);
    console.log(`   ✅ Bookings: ${bookingCount}`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseConnection()
  .catch((e) => {
    console.error('❌ Test failed:', e);
    process.exit(1);
  });
