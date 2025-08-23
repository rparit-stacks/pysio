const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedBlogPosts() {
  try {
    console.log('🌱 Seeding blog posts...');

    // Get the first user as author
    const author = await prisma.user.findFirst();
    if (!author) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    // Get the first category
    const category = await prisma.blogCategory.findFirst();
    if (!category) {
      console.log('❌ No categories found. Please run seed-blog-categories.js first.');
      return;
    }

    const blogPosts = [
      {
        title: "5 Essential Exercises for Lower Back Pain Relief",
        slug: "lower-back-pain-relief-exercises",
        excerpt: "Discover effective physiotherapy exercises that can help alleviate chronic lower back pain and improve your mobility.",
        content: `
          <h2>Understanding Lower Back Pain</h2>
          <p>Lower back pain is one of the most common musculoskeletal problems affecting people worldwide. Whether it's due to poor posture, sedentary lifestyle, or injury, the impact on daily life can be significant.</p>
          
          <h3>Exercise 1: Pelvic Tilts</h3>
          <p>Lie on your back with knees bent and feet flat on the floor. Gently tilt your pelvis to flatten your lower back against the floor, then release. Repeat 10-15 times.</p>
          
          <h3>Exercise 2: Cat-Cow Stretch</h3>
          <p>Start on your hands and knees. Arch your back like a cat, then drop your belly and lift your head like a cow. Repeat 10 times.</p>
          
          <h3>Exercise 3: Bird Dog</h3>
          <p>On hands and knees, extend your right arm and left leg simultaneously. Hold for 5 seconds, then switch sides. Repeat 10 times each side.</p>
          
          <h3>Exercise 4: Bridge Exercise</h3>
          <p>Lie on your back with knees bent. Lift your hips off the ground, creating a straight line from shoulders to knees. Hold for 5 seconds, then lower.</p>
          
          <h3>Exercise 5: Knee-to-Chest Stretch</h3>
          <p>Lie on your back and gently pull one knee toward your chest. Hold for 30 seconds, then switch legs.</p>
          
          <h2>When to Seek Professional Help</h2>
          <p>If your back pain persists for more than a few weeks, is severe, or is accompanied by other symptoms like numbness or weakness, consult a physiotherapist for a proper assessment and treatment plan.</p>
        `,
        authorId: author.id,
        categoryId: category.id,
        status: 'published',
        isFeatured: true,
        featuredImage: '/backpain.webp',
        readTime: 8,
        publishedAt: new Date('2025-01-15')
      },
      {
        title: "Post-Surgery Recovery: A Complete Physiotherapy Guide",
        slug: "post-surgery-recovery-physiotherapy-guide",
        excerpt: "Learn about the rehabilitation process after surgery and how physiotherapy can accelerate your recovery journey.",
        content: `
          <h2>The Importance of Post-Surgery Rehabilitation</h2>
          <p>Recovery after surgery is a critical period that requires careful attention and professional guidance. Physiotherapy plays a vital role in ensuring optimal recovery and preventing complications.</p>
          
          <h3>Phase 1: Immediate Post-Surgery (Days 1-7)</h3>
          <p>Focus on pain management, gentle movement, and preventing complications like blood clots. Your physiotherapist will guide you through safe exercises and mobility techniques.</p>
          
          <h3>Phase 2: Early Recovery (Weeks 2-6)</h3>
          <p>Gradual increase in activity level, strengthening exercises, and improving range of motion. This phase is crucial for rebuilding strength and function.</p>
          
          <h3>Phase 3: Advanced Recovery (Weeks 7-12)</h3>
          <p>More intensive exercises, functional training, and preparation for return to normal activities or sports.</p>
          
          <h2>Key Recovery Principles</h2>
          <ul>
            <li>Follow your physiotherapist's guidance</li>
            <li>Don't rush the recovery process</li>
            <li>Listen to your body</li>
            <li>Maintain a positive mindset</li>
            <li>Stay consistent with exercises</li>
          </ul>
        `,
        authorId: author.id,
        categoryId: category.id,
        status: 'published',
        isFeatured: false,
        featuredImage: '/recovery.webp',
        readTime: 12,
        publishedAt: new Date('2025-01-10')
      },
      {
        title: "Sports Injury Prevention: Tips from Professional Physiotherapists",
        slug: "sports-injury-prevention-tips",
        excerpt: "Expert advice on preventing common sports injuries and maintaining peak physical performance through proper care.",
        content: `
          <h2>Prevention is Better Than Cure</h2>
          <p>Sports injuries can be devastating for athletes, affecting performance and potentially ending careers. However, many injuries are preventable with proper preparation and care.</p>
          
          <h3>Warm-Up and Cool-Down</h3>
          <p>Never skip your warm-up routine. A proper warm-up increases blood flow, improves flexibility, and prepares your muscles for activity. Similarly, cool-down exercises help prevent muscle stiffness and promote recovery.</p>
          
          <h3>Proper Technique</h3>
          <p>Learning and maintaining proper technique is crucial for injury prevention. Poor form can lead to overuse injuries and acute trauma. Consider working with a coach or physiotherapist to perfect your technique.</p>
          
          <h3>Gradual Progression</h3>
          <p>Avoid the "too much, too soon" trap. Gradually increase the intensity, duration, and frequency of your training to allow your body to adapt.</p>
          
          <h3>Cross-Training</h3>
          <p>Incorporate different types of exercise into your routine to prevent overuse injuries and maintain overall fitness.</p>
          
          <h3>Recovery and Rest</h3>
          <p>Rest days are essential for muscle repair and growth. Listen to your body and take breaks when needed.</p>
          
          <h2>Common Sports Injuries and Prevention</h2>
          <p>Understanding common injuries in your sport can help you take preventive measures. Consult with a sports physiotherapist for sport-specific advice.</p>
        `,
        authorId: author.id,
        categoryId: category.id,
        status: 'published',
        isFeatured: false,
        featuredImage: '/sportsinjury.webp',
        readTime: 10,
        publishedAt: new Date('2025-01-08')
      },
      {
        title: "The Benefits of Regular Physiotherapy for Chronic Pain Management",
        slug: "physiotherapy-chronic-pain-management",
        excerpt: "Explore how regular physiotherapy sessions can help manage chronic pain and improve quality of life.",
        content: `
          <h2>Understanding Chronic Pain</h2>
          <p>Chronic pain affects millions of people worldwide and can significantly impact quality of life. Unlike acute pain, chronic pain persists for months or even years, requiring a comprehensive treatment approach.</p>
          
          <h3>How Physiotherapy Helps</h3>
          <p>Physiotherapy offers a non-invasive, drug-free approach to managing chronic pain through various techniques and exercises.</p>
          
          <h3>Manual Therapy</h3>
          <p>Hands-on techniques like massage, joint mobilization, and manipulation can help reduce pain and improve mobility.</p>
          
          <h3>Exercise Therapy</h3>
          <p>Targeted exercises strengthen muscles, improve flexibility, and promote healing. Regular exercise also releases endorphins, natural pain relievers.</p>
          
          <h3>Education and Self-Management</h3>
          <p>Learning about your condition and how to manage it empowers you to take control of your pain and recovery.</p>
          
          <h2>Creating a Pain Management Plan</h2>
          <p>Your physiotherapist will work with you to develop a personalized treatment plan that addresses your specific needs and goals.</p>
        `,
        authorId: author.id,
        categoryId: category.id,
        status: 'published',
        isFeatured: false,
        featuredImage: '/placeholder.svg',
        readTime: 7,
        publishedAt: new Date('2025-01-05')
      },
      {
        title: "Rehabilitation After Stroke: A Comprehensive Guide",
        slug: "stroke-rehabilitation-comprehensive-guide",
        excerpt: "Learn about the rehabilitation process after a stroke and how physiotherapy can help restore function and independence.",
        content: `
          <h2>Understanding Stroke Recovery</h2>
          <p>Stroke rehabilitation is a crucial part of recovery, helping survivors regain independence and improve quality of life. Early intervention is key to maximizing recovery potential.</p>
          
          <h3>Early Rehabilitation</h3>
          <p>Rehabilitation typically begins within 24-48 hours after a stroke, focusing on preventing complications and beginning the recovery process.</p>
          
          <h3>Physical Therapy Goals</h3>
          <p>Physical therapy aims to improve mobility, strength, balance, and coordination. Each session is tailored to the individual's specific needs and abilities.</p>
          
          <h3>Occupational Therapy</h3>
          <p>Occupational therapy helps patients relearn daily activities and adapt to any remaining limitations.</p>
          
          <h3>Speech Therapy</h3>
          <p>For patients with communication difficulties, speech therapy can help restore language skills and swallowing function.</p>
          
          <h2>The Recovery Journey</h2>
          <p>Stroke recovery is a long-term process that requires patience, persistence, and support from healthcare professionals and family members.</p>
        `,
        authorId: author.id,
        categoryId: category.id,
        status: 'published',
        isFeatured: false,
        featuredImage: '/placeholder.svg',
        readTime: 9,
        publishedAt: new Date('2025-01-03')
      }
    ];

    for (const postData of blogPosts) {
      await prisma.blogPost.upsert({
        where: { slug: postData.slug },
        update: postData,
        create: postData
      });
      console.log(`✅ Added/Updated blog post: ${postData.title}`);
    }

    console.log('🎉 Blog posts seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding blog posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBlogPosts();
