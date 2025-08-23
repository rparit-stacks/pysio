const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedBlogCategories() {
  try {
    console.log('🌱 Seeding blog categories...');

    const categories = [
      {
        name: 'Health & Wellness',
        slug: 'health-wellness',
        description: 'Articles about general health and wellness topics',
        color: '#10B981'
      },
      {
        name: 'Physical Therapy',
        slug: 'physical-therapy',
        description: 'Physical therapy techniques and treatments',
        color: '#3B82F6'
      },
      {
        name: 'Injury Recovery',
        slug: 'injury-recovery',
        description: 'Tips and guides for injury recovery',
        color: '#F59E0B'
      },
      {
        name: 'Exercise & Fitness',
        slug: 'exercise-fitness',
        description: 'Exercise routines and fitness advice',
        color: '#EF4444'
      },
      {
        name: 'Pain Management',
        slug: 'pain-management',
        description: 'Pain management strategies and techniques',
        color: '#8B5CF6'
      }
    ];

    for (const category of categories) {
      await prisma.blogCategory.upsert({
        where: { slug: category.slug },
        update: category,
        create: category
      });
      console.log(`✅ Added/Updated category: ${category.name}`);
    }

    console.log('🎉 Blog categories seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding blog categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBlogCategories();
