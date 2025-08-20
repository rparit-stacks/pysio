"use client";
import { useState, useEffect, useRef } from "react";

const Stats = () => {
  const statistics = [
    { number: 10000, label: "Happy Patients", suffix: "+" },
    { number: 500, label: "Certified Therapists", suffix: "+" },
    { number: 50, label: "Cities Covered", suffix: "+" },
    { number: 98, label: "Success Rate", suffix: "%" }
  ];

  const [isVisible, setIsVisible] = useState(false);
  const [animatedNumbers, setAnimatedNumbers] = useState(statistics.map(() => 0));
  const statsRef = useRef(null);

  // Counter animation function
  const animateCounter = (finalValue, index, duration = 2000) => {
    const startTime = Date.now();
    const startValue = 0;
    
    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (finalValue - startValue) * easeOutCubic);
      
      setAnimatedNumbers(prev => {
        const newNumbers = [...prev];
        newNumbers[index] = currentValue;
        return newNumbers;
      });
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  };

  // Intersection Observer to trigger animation when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            // Start animations for all counters with staggered delays
            statistics.forEach((stat, index) => {
              setTimeout(() => {
                animateCounter(stat.number, index);
              }, index * 200); // 200ms delay between each counter
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [isVisible]);
  
  return (
   <section className="py-6 px-4 sm:py-16" style={{ backgroundColor: '#f0fdf7' }}>

      <div className="max-w-6xl mx-auto">
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {statistics.map((stat, index) => (
            <div 
              key={index} 
              className="space-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div 
                className="text-4xl lg:text-5xl font-bold transition-all duration-300 hover:scale-110" 
                style={{ color: '#7ce3b1' }}
              >
                {animatedNumbers[index].toLocaleString()}{stat.suffix}
              </div>
              <div className="text-gray-700 text-lg font-medium animate-fade-in" style={{ animationDelay: `${index * 100 + 200}ms` }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
