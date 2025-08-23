"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch('/api/slider');
        const data = await response.json();
        
        if (data.slides && data.slides.length > 0) {
          setSlides(data.slides);
        }
      } catch (error) {
        console.error('Error fetching slider data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;

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

  const renderMedia = (slide) => {
    const mediaUrl = window.innerWidth < 768 && slide.mobileMediaUrl 
      ? slide.mobileMediaUrl 
      : slide.mediaUrl;

    switch (slide.mediaType) {
      case 'video':
        return (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      case 'gif':
        return (
          <Image
            src={mediaUrl}
            alt={slide.title || 'Slider content'}
            fill
            className="object-cover"
            priority={true}
            sizes="100vw"
          />
        );
             default: // image
         return (
           <Image
             src={mediaUrl}
             alt={slide.title || 'Slider content'}
             fill
             className="object-cover"
             priority={true}
             sizes="100vw"
             onError={(e) => {
               console.error('Failed to load image:', mediaUrl);
               e.target.style.display = 'none';
             }}
           />
         );
    }
  };

  if (loading) {
    return (
      <section className="relative w-full h-[400px] md:h-[600px] bg-gray-200 animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading slider...</div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

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
          <div key={slide.id} className="w-full h-full flex-shrink-0 relative group">
            {/* Media Content */}
            {renderMedia(slide)}
            
            {/* Overlay with Text Content */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4 md:px-8 max-w-4xl">
                  {slide.title && (
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                      {slide.title}
                    </h1>
                  )}
                  {slide.subtitle && (
                    <h2 className="text-lg md:text-xl lg:text-2xl font-semibold mb-2 md:mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-y-4 group-hover:translate-y-0">
                      {slide.subtitle}
                    </h2>
                  )}
                  {slide.description && (
                    <p className="text-sm md:text-base lg:text-lg mb-4 md:mb-6 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 transform translate-y-4 group-hover:translate-y-0">
                      {slide.description}
                    </p>
                  )}
                  {slide.buttonText && slide.buttonUrl && (
                    <a
                      href={slide.buttonUrl}
                      className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 delay-300 hover:scale-105"
                    >
                      {slide.buttonText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      {slides.length > 1 && (
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
      )}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
};

export default HeroSlider;