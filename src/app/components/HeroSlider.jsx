"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Placeholder images data
  const slides = [
    {
      id: 1,
      desktop: {
        src: '/slider/slide-1-desktop.jpg',
        alt: 'Healthcare Professional Slide 1'
      },
      mobile: {
        src: '/slider/slide-1-mobile.jpg', 
        alt: 'Healthcare Professional Slide 1'
      }
    },
    {
      id: 2,
      desktop: {
        src: '/slider/slide-2-desktop.jpg',
        alt: 'Physiotherapy Treatment Slide 2'
      },
      mobile: {
        src: '/slider/slide-2-mobile.jpg',
        alt: 'Physiotherapy Treatment Slide 2'
      }
    },
    {
      id: 3,
      desktop: {
        src: '/slider/slide-3-desktop.jpg',
        alt: 'Recovery Journey Slide 3'
      },
      mobile: {
        src: '/slider/slide-3-mobile.jpg',
        alt: 'Recovery Journey Slide 3'
      }
    },
    {
      id: 4,
      desktop: {
        src: '/slider/slide-4-desktop.jpg',
        alt: 'Modern Clinic Slide 4'
      },
      mobile: {
        src: '/slider/slide-4-mobile.jpg',
        alt: 'Modern Clinic Slide 4'
      }
    },
    {
      id: 5,
      desktop: {
        src: '/slider/slide-5-desktop.jpg',
        alt: 'Patient Care Slide 5'
      },
      mobile: {
        src: '/slider/slide-5-mobile.jpg',
        alt: 'Patient Care Slide 5'
      }
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative w-full h-[400px] md:h-[600px] overflow-hidden">
      {/* Slider Container */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
            {/* Desktop Image */}
            <div className="hidden md:block w-full h-full">
              <Image
                src={slide.desktop.src}
                alt={slide.desktop.alt}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
            </div>
            
            {/* Mobile Image */}
            <div className="block md:hidden w-full h-full">
              <Image
                src={slide.mobile.src}
                alt={slide.mobile.alt}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Optional Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
};

export default HeroSlider;