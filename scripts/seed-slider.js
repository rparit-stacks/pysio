const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleSlides = [
  {
    title: "Professional Physiotherapy Care",
    subtitle: "Expert treatment for your recovery",
    description: "Get the best physiotherapy care from certified professionals who are dedicated to your health and recovery journey.",
    mediaType: "image",
    mediaUrl: "/slider/slide-1-desktop.jpg",
    mobileMediaUrl: "/slider/slide-1-mobile.jpg",
    buttonText: "Book Appointment",
    buttonUrl: "/find-therapist",
    order: 1,
    isActive: true
  },
  {
    title: "Modern Treatment Methods",
    subtitle: "Advanced techniques for better results",
    description: "State-of-the-art equipment and proven treatment methods to ensure the best possible outcomes for your recovery.",
    mediaType: "image",
    mediaUrl: "/slider/slide-2-desktop.jpg",
    mobileMediaUrl: "/slider/slide-2-mobile.jpg",
    buttonText: "Our Services",
    buttonUrl: "/services",
    order: 2,
    isActive: true
  },
  {
    title: "Your Recovery Journey",
    subtitle: "Personalized care plans",
    description: "Tailored treatment plans designed for your specific needs and recovery goals. Every patient is unique.",
    mediaType: "image",
    mediaUrl: "/slider/slide-3-desktop.jpg",
    mobileMediaUrl: "/slider/slide-3-mobile.jpg",
    buttonText: "Learn More",
    buttonUrl: "/about",
    order: 3,
    isActive: true
  },
  {
    title: "Expert Therapists",
    subtitle: "Certified professionals",
    description: "Our team of certified physiotherapists brings years of experience and expertise to every treatment session.",
    mediaType: "image",
    mediaUrl: "/slider/slide-4-desktop.jpg",
    mobileMediaUrl: "/slider/slide-4-mobile.jpg",
    buttonText: "Meet Our Team",
    buttonUrl: "/find-therapist",
    order: 4,
    isActive: true
  }
];

async function seedSlider() {
  try {
    console.log('🌱 Starting slider seed...');

    // Clear existing slides
    await prisma.sliderSlide.deleteMany({});
    console.log('🗑️  Cleared existing slides');

    // Insert new slides
    for (const slide of sampleSlides) {
      await prisma.sliderSlide.create({
        data: slide
      });
    }

    console.log('✅ Successfully seeded slider data!');
    console.log(`📊 Created ${sampleSlides.length} slides`);

  } catch (error) {
    console.error('❌ Error seeding slider data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSlider();
