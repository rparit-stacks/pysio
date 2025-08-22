const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixPaymentMethods() {
  try {
    // Create the Credit Card payment method with ID 1
    await prisma.paymentMethod.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Credit Card',
        isActive: true
      }
    })
    
    console.log('✅ Payment method created successfully')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPaymentMethods()