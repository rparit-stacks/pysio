const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedBlog() {
  try {
    console.log('🌱 Seeding blog data...');

    // Create categories
    const categories = await Promise.all([
      prisma.blogCategory.upsert({
        where: { slug: 'physiotherapy' },
        update: {},
        create: {
          name: 'Physiotherapy',
          slug: 'physiotherapy',
          description: 'Articles about physiotherapy techniques and treatments',
          color: '#10b981'
        }
      }),
      prisma.blogCategory.upsert({
        where: { slug: 'exercises' },
        update: {},
        create: {
          name: 'Exercises',
          slug: 'exercises',
          description: 'Exercise routines and rehabilitation guides',
          color: '#3b82f6'
        }
      }),
      prisma.blogCategory.upsert({
        where: { slug: 'recovery' },
        update: {},
        create: {
          name: 'Recovery',
          slug: 'recovery',
          description: 'Recovery tips and post-treatment care',
          color: '#8b5cf6'
        }
      }),
      prisma.blogCategory.upsert({
        where: { slug: 'wellness' },
        update: {},
        create: {
          name: 'Wellness',
          slug: 'wellness',
          description: 'General health and wellness advice',
          color: '#f59e0b'
        }
      })
    ]);

    console.log('✅ Categories created');

    // Create tags
    const tags = await Promise.all([
      prisma.blogTag.upsert({
        where: { slug: 'back-pain' },
        update: {},
        create: { name: 'Back Pain', slug: 'back-pain', color: '#10b981' }
      }),
      prisma.blogTag.upsert({
        where: { slug: 'rehabilitation' },
        update: {},
        create: { name: 'Rehabilitation', slug: 'rehabilitation', color: '#3b82f6' }
      }),
      prisma.blogTag.upsert({
        where: { slug: 'prevention' },
        update: {},
        create: { name: 'Prevention', slug: 'prevention', color: '#8b5cf6' }
      }),
      prisma.blogTag.upsert({
        where: { slug: 'exercise' },
        update: {},
        create: { name: 'Exercise', slug: 'exercise', color: '#f59e0b' }
      })
    ]);

    console.log('✅ Tags created');

    // Get first user for author
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    // Create blog posts
    const posts = await Promise.all([
      prisma.blogPost.upsert({
        where: { slug: 'revolutionary-physiotherapy-techniques-faster-recovery' },
        update: {},
        create: {
          title: 'Revolutionary Physiotherapy Techniques for Faster Recovery',
          slug: 'revolutionary-physiotherapy-techniques-faster-recovery',
          excerpt: 'Discover the latest breakthrough methods in physiotherapy that are helping patients recover 40% faster than traditional approaches.',
          content: 'Modern physiotherapy has evolved dramatically with new techniques and technologies that are revolutionizing patient care. In this comprehensive guide, we explore the cutting-edge methods that are helping patients achieve faster, more effective recovery outcomes. From advanced manual therapy techniques to state-of-the-art equipment, learn how these innovations are transforming the field of physiotherapy.',
          featuredImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
          authorId: firstUser.id,
          categoryId: categories[0].id,
          status: 'published',
          isFeatured: true,
          viewCount: 1520,
          likeCount: 234,
          readTime: 8,
          publishedAt: new Date()
        }
      }),
      prisma.blogPost.upsert({
        where: { slug: '10-essential-exercises-lower-back-pain-relief' },
        update: {},
        create: {
          title: '10 Essential Exercises for Lower Back Pain Relief',
          slug: '10-essential-exercises-lower-back-pain-relief',
          excerpt: 'Simple yet effective exercises that can be done at home to alleviate chronic lower back pain and improve mobility.',
          content: 'Lower back pain affects millions of people worldwide. These carefully selected exercises have been proven to provide significant relief when performed correctly and consistently. Each exercise targets specific muscle groups that support the lower back, helping to reduce pain and prevent future injuries.',
          featuredImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
          authorId: firstUser.id,
          categoryId: categories[1].id,
          status: 'published',
          isFeatured: false,
          viewCount: 892,
          likeCount: 189,
          readTime: 6,
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      }),
      prisma.blogPost.upsert({
        where: { slug: 'post-surgery-recovery-complete-rehabilitation-guide' },
        update: {},
        create: {
          title: 'Post-Surgery Recovery: Complete Rehabilitation Guide',
          slug: 'post-surgery-recovery-complete-rehabilitation-guide',
          excerpt: 'A comprehensive guide to post-surgical rehabilitation covering timeline, exercises, and what to expect during recovery.',
          content: 'Recovering from surgery requires a structured approach to rehabilitation. This guide provides everything you need to know about the recovery process, from the immediate post-operative period through full recovery. Learn about proper wound care, progressive exercises, and when to seek professional help.',
          featuredImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop',
          authorId: firstUser.id,
          categoryId: categories[2].id,
          status: 'published',
          isFeatured: false,
          viewCount: 743,
          likeCount: 156,
          readTime: 12,
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    console.log('✅ Blog posts created');

    // Link posts with tags
    await Promise.all([
      prisma.blogPostTag.upsert({
        where: { postId_tagId: { postId: posts[0].id, tagId: tags[1].id } },
        update: {},
        create: { postId: posts[0].id, tagId: tags[1].id }
      }),
      prisma.blogPostTag.upsert({
        where: { postId_tagId: { postId: posts[1].id, tagId: tags[0].id } },
        update: {},
        create: { postId: posts[1].id, tagId: tags[0].id }
      }),
      prisma.blogPostTag.upsert({
        where: { postId_tagId: { postId: posts[1].id, tagId: tags[3].id } },
        update: {},
        create: { postId: posts[1].id, tagId: tags[3].id }
      })
    ]);

    console.log('✅ Post tags linked');
    console.log('🎉 Blog seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding blog data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBlog();