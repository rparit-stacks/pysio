const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');

    const users = await prisma.user.findMany({
      include: {
        role: true
      }
    });

    console.log(`📊 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role?.name || 'Unknown'}`);
    });

    if (users.length === 0) {
      console.log('❌ No users found! You need to create a user first.');
    } else {
      console.log('✅ Users found. Blog posts should work now.');
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
