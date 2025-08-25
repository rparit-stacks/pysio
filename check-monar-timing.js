const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMonarTiming() {
  try {
    console.log('🔍 Checking Dr. Monar\'s Availability Timing...\n');
    
    // Find Dr. Monar
    const monar = await prisma.physiotherapistProfile.findFirst({
      where: {
        OR: [
          {
            user: {
              firstName: {
                contains: 'monar',
                mode: 'insensitive'
              }
            }
          },
          {
            user: {
              lastName: {
                contains: 'monar',
                mode: 'insensitive'
              }
            }
          },
          {
            user: {
              email: {
                contains: 'monar',
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        availabilityTemplates: {
          orderBy: { dayOfWeek: 'asc' }
        },
        specificAvailability: {
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!monar) {
      console.log('❌ Dr. Monar not found in database');
      return;
    }

    console.log(`👨‍⚕️ Dr. ${monar.user.firstName} ${monar.user.lastName}`);
    console.log(`📧 Email: ${monar.user.email}`);
    console.log(`🆔 Therapist ID: ${monar.id}`);
    console.log(`🆔 User ID: ${monar.userId}`);
    console.log('');

    // Check availability templates
    console.log('📅 WEEKLY AVAILABILITY SCHEDULE:');
    console.log('================================');
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (monar.availabilityTemplates.length === 0) {
      console.log('❌ No weekly availability templates found');
    } else {
      monar.availabilityTemplates.forEach(template => {
        const dayName = dayNames[template.dayOfWeek];
        const status = template.isActive ? '✅ ACTIVE' : '❌ INACTIVE';
        console.log(`${dayName.padEnd(10)} | ${template.startTime} - ${template.endTime} | ${status}`);
      });
    }

    console.log('');

    // Check specific availability
    console.log('📆 SPECIFIC AVAILABILITY (Overrides):');
    console.log('=====================================');
    
    if (monar.specificAvailability.length === 0) {
      console.log('📝 No specific availability overrides found');
    } else {
      monar.specificAvailability.forEach(sa => {
        const date = sa.date.toISOString().split('T')[0];
        const status = sa.isAvailable ? '✅ AVAILABLE' : '❌ UNAVAILABLE';
        const reason = sa.reason ? ` (${sa.reason})` : '';
        console.log(`${date} | ${sa.startTime} - ${sa.endTime} | ${status}${reason}`);
      });
    }

    console.log('');

    // Check upcoming availability for next 7 days
    console.log('🔮 UPCOMING AVAILABILITY (Next 7 Days):');
    console.log('=======================================');
    
    const today = new Date();
    const next7Days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      next7Days.push(date);
    }

    for (const date of next7Days) {
      const dayOfWeek = date.getDay();
      const dateString = date.toISOString().split('T')[0];
      const dayName = dayNames[dayOfWeek];
      
      // Check if there's specific availability for this date
      const specific = monar.specificAvailability.find(sa => 
        sa.date.toISOString().split('T')[0] === dateString
      );
      
      // Check template availability
      const template = monar.availabilityTemplates.find(t => t.dayOfWeek === dayOfWeek);
      
      if (specific) {
        const status = specific.isAvailable ? '✅ AVAILABLE' : '❌ UNAVAILABLE';
        console.log(`${dateString} (${dayName}) | ${specific.startTime} - ${specific.endTime} | ${status} (Specific)`);
      } else if (template && template.isActive) {
        console.log(`${dateString} (${dayName}) | ${template.startTime} - ${template.endTime} | ✅ AVAILABLE (Template)`);
      } else {
        console.log(`${dateString} (${dayName}) | -- | ❌ UNAVAILABLE`);
      }
    }

    console.log('');

    // Check existing bookings
    console.log('📋 RECENT BOOKINGS:');
    console.log('==================');
    
    const recentBookings = await prisma.booking.findMany({
      where: {
        physiotherapistId: monar.id,
        appointmentDate: {
          gte: new Date()
        }
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        status: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'asc'
      },
      take: 10
    });

    if (recentBookings.length === 0) {
      console.log('📝 No upcoming bookings found');
    } else {
      recentBookings.forEach(booking => {
        const date = booking.appointmentDate.toISOString().split('T')[0];
        const patientName = `${booking.patient.firstName} ${booking.patient.lastName}`;
        console.log(`${date} at ${booking.appointmentTime} | ${patientName} | ${booking.status.name.toUpperCase()}`);
      });
    }

    console.log('');
    console.log('📊 SUMMARY:');
    console.log('===========');
    console.log(`✅ Active templates: ${monar.availabilityTemplates.filter(t => t.isActive).length}/7`);
    console.log(`📅 Specific overrides: ${monar.specificAvailability.length}`);
    console.log(`📋 Upcoming bookings: ${recentBookings.length}`);

  } catch (error) {
    console.error('❌ Error checking Monar\'s timing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkMonarTiming()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  });
