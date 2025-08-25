const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function remove400Therapists() {
  try {
    console.log('🗑️  Removing 400 random therapists (keeping Dr. Monar safe)...\n');
    
    // First, get all therapist IDs except Dr. Monar (ID 426)
    const allTherapists = await prisma.physiotherapistProfile.findMany({
      where: {
        id: {
          not: 426 // Keep Dr. Monar safe
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

    console.log(`📊 Total therapists found (excluding Dr. Monar): ${allTherapists.length}`);
    
    if (allTherapists.length < 400) {
      console.log(`❌ Not enough therapists to remove 400. Only ${allTherapists.length} available.`);
      return;
    }

    // Shuffle the array to get random selection
    const shuffled = allTherapists.sort(() => 0.5 - Math.random());
    
    // Take first 400 therapists to remove
    const therapistsToRemove = shuffled.slice(0, 400);
    const therapistsToKeep = shuffled.slice(400);

    console.log(`🗑️  Will remove: ${therapistsToRemove.length} therapists`);
    console.log(`✅ Will keep: ${therapistsToKeep.length} therapists`);
    console.log(`👨‍⚕️  Dr. Monar (ID 426) will be kept safe\n`);

    // Show some therapists that will be removed
    console.log('🗑️  Sample therapists to be removed:');
    therapistsToRemove.slice(0, 5).forEach(therapist => {
      console.log(`   - ${therapist.user.firstName} ${therapist.user.lastName} (ID: ${therapist.id})`);
    });
    console.log('   ... and 395 more\n');

    // Show some therapists that will be kept
    console.log('✅ Sample therapists to be kept:');
    therapistsToKeep.slice(0, 5).forEach(therapist => {
      console.log(`   - ${therapist.user.firstName} ${therapist.user.lastName} (ID: ${therapist.id})`);
    });
    console.log('   ... and others\n');

    // Confirm before proceeding
    console.log('⚠️  WARNING: This will permanently delete 400 therapists from the database!');
    console.log('⚠️  This action cannot be undone!');
    console.log('⚠️  Make sure you have a backup before proceeding!\n');

    // For safety, let's just show what would be removed without actually removing
    console.log('🔒 SAFETY MODE: Showing what would be removed (not actually deleting)');
    console.log('🔒 To actually remove, uncomment the deletion code in the script\n');

    // Uncomment the following code to actually perform the deletion:
    /*
    let removedCount = 0;
    
    for (const therapist of therapistsToRemove) {
      try {
        // Delete the therapist profile (this will cascade delete related records)
        await prisma.physiotherapistProfile.delete({
          where: { id: therapist.id }
        });
        
        console.log(`✅ Removed: ${therapist.user.firstName} ${therapist.user.lastName} (ID: ${therapist.id})`);
        removedCount++;
      } catch (error) {
        console.log(`❌ Failed to remove: ${therapist.user.firstName} ${therapist.user.lastName} (ID: ${therapist.id}) - ${error.message}`);
      }
    }

    console.log(`\n🎉 Successfully removed ${removedCount} therapists!`);
    console.log(`✅ Dr. Monar (ID 426) is safe and still in the database`);
    */

    // Verify Dr. Monar is still there
    const monarStillExists = await prisma.physiotherapistProfile.findUnique({
      where: { id: 426 },
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

    if (monarStillExists) {
      console.log(`✅ Dr. Monar is safe: ${monarStillExists.user.firstName} ${monarStillExists.user.lastName} (ID: ${monarStillExists.id})`);
    } else {
      console.log('❌ ERROR: Dr. Monar not found!');
    }

    // Show final count
    const finalCount = await prisma.physiotherapistProfile.count();
    console.log(`\n📊 Final therapist count: ${finalCount}`);

  } catch (error) {
    console.error('❌ Error removing therapists:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the removal
remove400Therapists()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  });
