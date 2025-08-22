import React, { useRef } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';

// Floating Elements Component
const FloatingElements = () => (
  <>
    <div className="absolute top-20 left-10 w-4 h-4 bg-[#7ce3b1] rounded-full animate-bounce opacity-60" style={{ animationDelay: '0s' }}></div>
    <div className="absolute top-40 right-20 w-3 h-3 bg-[#5dd498] rounded-full animate-bounce opacity-40" style={{ animationDelay: '1s' }}></div>
    <div className="absolute bottom-32 left-20 w-5 h-5 bg-[#7ce3b1] rounded-full animate-bounce opacity-50" style={{ animationDelay: '2s' }}></div>
    <div className="absolute bottom-20 right-10 w-2 h-2 bg-[#5dd498] rounded-full animate-bounce opacity-70" style={{ animationDelay: '0.5s' }}></div>
  </>
);

const HeroSection = () => {
  const heroRef = useRef(null);

  return (
    <>
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-[#7ce3b1]/10 overflow-hidden"
      >
        {/* Background Image with Fade Animation */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/bone.png')",
              animation: "fadeInOut 4s ease-in-out infinite"
            }}
          ></div>
        </div>

        <FloatingElements />

        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>

        <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="transform transition-all duration-1000 translate-y-0 opacity-100">
            {/* Icon with Enhanced Animation */}
            <div className="mb-6 sm:mb-8 relative">
              <Sparkles
                className="w-10 h-10 sm:w-12 sm:h-12 text-[#7ce3b1] mx-auto mb-4 animate-spin"
                style={{ animationDuration: "3s" }}
              />
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-[#7ce3b1] rounded-full animate-bounce"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#5dd498] rounded-full animate-ping"></div>
            </div>

            {/* Main Heading with Fixed Spacing and Mobile Optimization */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-green-500 mb-4 sm:mb-6 relative leading-tight">
              <span className="inline-block animate-fadeInUp">About</span>{" "}
              <span 
                className="text-green-500 inline-block animate-fadeInUp"
                style={{ animationDelay: "0.2s" }}
              >
                Abhaile Physiotherapy
              </span>
            </h1>

            {/* Animated Divider */}
            <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-[#7ce3b1] to-[#5dd498] mx-auto mb-4 sm:mb-6 transform animate-scaleX origin-left"></div>

            {/* Description with Staggered Animation */}
            <p className="text-gray-600 text-lg sm:text-xl lg:text-2xl max-w-2xl lg:max-w-3xl mx-auto mb-6 sm:mb-8 opacity-0 animate-fadeInUp px-4 leading-relaxed"
               style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
              Connecting patients with trusted physiotherapists for personalized
              care and faster recovery
            </p>

            {/* Enhanced Scroll Indicator */}
            <div className="animate-bounce mt-8 sm:mt-12 opacity-0 animate-fadeInUp" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
              <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-[#7ce3b1] mx-auto" />
              <div className="mt-2 text-sm text-gray-500 animate-pulse">Scroll to explore</div>
            </div>
          </div>
        </div>

        {/* Custom CSS Animations */}
        <style jsx>{`
          @keyframes fadeInOut {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.3; }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes scaleX {
            from {
              transform: scaleX(0);
            }
            to {
              transform: scaleX(1);
            }
          }
          
          .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          
          .animate-scaleX {
            animation: scaleX 1s ease-out 0.3s forwards;
            transform: scaleX(0);
          }
        `}</style>
      </section>
    </>
  );
};

export default HeroSection;