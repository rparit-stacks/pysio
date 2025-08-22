"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mail, Phone, MapPin, ArrowLeft, Linkedin, Send, User, MessageSquare, Heart, Shield, Clock, Award, ChevronDown, Sparkles } from 'lucide-react';
import Footer from "../components/footer";
import BlogsSection from "../components/blogs";

const AboutUsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(0.4);
  const [fadeDirection, setFadeDirection] = useState(1);
  const heroRef = useRef(null);

  // Smoother background opacity animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBgOpacity(prev => {
        const newOpacity = prev + (fadeDirection * 0.005);
        
        if (newOpacity >= 1) {
          setFadeDirection(-1);
          return 1;
        } else if (newOpacity <= 0.4) {
          setFadeDirection(1);
          return 0.4;
        }
        
        return newOpacity;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [fadeDirection]);

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 },
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Compassionate Care",
      description:
        "We connect patients with physiotherapists who prioritize empathetic, patient-centered care and healing.",
      color: "from-pink-400 to-red-400",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trust & Safety",
      description:
        "All our physiotherapists are verified, licensed professionals committed to maintaining the highest safety standards.",
      color: "from-blue-400 to-indigo-400",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Convenience",
      description:
        "Book appointments 24/7 with flexible scheduling options that fit your lifestyle and recovery needs.",
      color: "from-purple-400 to-pink-400",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Excellence",
      description:
        "We partner only with certified physiotherapists who demonstrate exceptional skills and commitment to patient outcomes.",
      color: "from-yellow-400 to-orange-400",
    },
  ];

  const FloatingElements = () => {
    const positions = [
      { left: 20, top: 30 },
      { left: 35, top: 50 },
      { left: 50, top: 70 },
      { left: 65, top: 40 },
      { left: 80, top: 60 },
      { left: 95, top: 35 },
    ];

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {positions.map((pos, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#7ce3b1] rounded-full opacity-30 animate-pulse"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              animationDelay: `${i * 0.5}s`,
              transform: `translate(${mousePosition.x * (i + 1) * 2}px, ${mousePosition.y * (i + 1) * 2}px)`,
              transition: "transform 0.3s ease-out",
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Hero Section - Full Screen */}
        <section 
          ref={heroRef}
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: `url('/bone.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: bgOpacity,
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"></div>
          
          {/* Floating Elements */}
          <FloatingElements />
          
          {/* Hero Content */}
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight">
  <span className="block">Welcome to</span>
  {/* <CHANGE> Changed gradient to dark green color */}
  <span className="block text-green-800">
    Abhaile Physiotherapy
  </span>
</h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300">
                Connecting you with skilled physiotherapists for personalized care and faster recovery
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
                <button className="group bg-gradient-to-r from-[#7ce3b1] to-[#5dd498] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 transform">
                  <span className="flex items-center gap-2">
                    Get Started
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  </span>
                </button>
                
                <button className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105">
                  Learn More
                </button>
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white opacity-70" />
          </div>
        </section>

        {/* Animated Background Pattern */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7ce3b1]/20 via-transparent to-[#7ce3b1]/10"></div>
          {[...Array(20)].map((_, i) => {
            const positions = [
              { left: 10, top: 20 },
              { left: 85, top: 15 },
              { left: 25, top: 80 },
              { left: 70, top: 25 },
              { left: 45, top: 60 },
              { left: 15, top: 75 },
              { left: 90, top: 45 },
              { left: 35, top: 30 },
              { left: 60, top: 85 },
              { left: 20, top: 10 },
              { left: 75, top: 70 },
              { left: 5, top: 50 },
              { left: 95, top: 35 },
              { left: 50, top: 5 },
              { left: 30, top: 90 },
              { left: 80, top: 55 },
              { left: 65, top: 40 },
              { left: 40, top: 65 },
              { left: 55, top: 20 },
              { left: 25, top: 45 },
            ];
            const delays = [
              0, 0.5, 1, 1.5, 2, 2.5, 0.3, 0.8, 1.3, 1.8, 2.3, 0.2, 0.7, 1.2, 1.7,
              2.2, 0.4, 0.9, 1.4, 1.9,
            ];
            const durations = [
              2, 3, 2.5, 3.5, 2.2, 2.8, 3.2, 2.6, 3.8, 2.4, 3.6, 2.1, 2.9, 3.1,
              2.7, 3.3, 2.3, 3.7, 2.8, 3.4,
            ];

            return (
              <div
                key={i}
                className="absolute w-1 h-1 bg-[#7ce3b1] rounded-full animate-ping"
                style={{
                  left: `${positions[i]?.left || 50}%`,
                  top: `${positions[i]?.top || 50}%`,
                  animationDelay: `${delays[i] || 0}s`,
                  animationDuration: `${durations[i] || 2}s`,
                }}
              />
            );
          })}
        </div>

        {/* Mission Section */}
        <section
          id="mission"
          data-animate
          className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 relative"
        >
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`max-w-4xl mx-auto text-center transform transition-all duration-1000 ${
                isVisible.mission
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-green-500 mb-4 relative">
                Our Mission
                <div className="absolute -top-4 -right-4 w-3 h-3 bg-[#7ce3b1] rounded-full animate-ping"></div>
              </h2>
              <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-[#7ce3b1] to-[#5dd498] mx-auto mb-8 transform origin-left animate-pulse"></div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#7ce3b1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-2 border-[#7ce3b1] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-spin"></div>

                <p className="text-gray-700 text-base sm:text-lg leading-relaxed relative z-10">
                  At Abhaile Physiotherapy, our mission is to make quality
                  physiotherapy accessible to everyone by connecting patients with
                  skilled, licensed physiotherapists in their area. We believe
                  that recovery shouldn't be delayed by complicated booking
                  processes or limited availability. Through our innovative
                  platform, we're bridging the gap between patients seeking care
                  and physiotherapists ready to provide exceptional treatment and
                  rehabilitation services.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section id="vision" data-animate className="py-16 sm:py-20 lg:py-24 bg-white relative">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`max-w-4xl mx-auto text-center transform transition-all duration-1000 delay-200 ${
                isVisible.vision
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-green-500 mb-4 relative">
                Our Vision
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-r from-[#7ce3b1] to-[#5dd498] rounded-full animate-bounce"></div>
              </h2>
              <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-[#5dd498] to-[#7ce3b1] mx-auto mb-8 animate-pulse"></div>

              <div className="bg-gradient-to-br from-gray-50 to-[#7ce3b1]/5 rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-200 hover:border-[#7ce3b1] transition-all duration-500 transform hover:scale-105 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#7ce3b1]/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                <p className="text-gray-700 text-base sm:text-lg leading-relaxed relative z-10">
                  We envision a healthcare ecosystem where physiotherapy is easily
                  accessible, personalized, and integrated into everyone's
                  wellness journey. Our goal is to become the leading platform
                  that empowers patients to take control of their recovery while
                  enabling physiotherapists to focus on what they do best -
                  healing and restoring mobility. Together, we're building a
                  healthier, more active community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section
          id="values"
          data-animate
          className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200"
        >
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`text-center mb-12 sm:mb-16 transform transition-all duration-1000 ${
                isVisible.values
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-green-500 mb-4">
                Our Values
              </h2>
              <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-[#7ce3b1] to-[#5dd498] mx-auto mb-6 animate-pulse"></div>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
                These core values guide our commitment to transforming
                physiotherapy care delivery
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className={`group transform transition-all duration-700 ${
                    isVisible.values
                      ? "translate-y-0 opacity-100"
                      : "translate-y-20 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 hover:border-[#7ce3b1] transition-all duration-500 hover:shadow-xl h-full relative overflow-hidden group-hover:-translate-y-4 group-hover:scale-105">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    ></div>

                    <div className="flex flex-col items-center text-center relative z-10">
                      <div className="relative mb-6">
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${value.color} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`}
                        ></div>
                        <div className="text-[#7ce3b1] group-hover:scale-110 transition-transform duration-300 relative z-10 p-4">
                          {value.icon}
                        </div>
                      </div>

                      <h3 className="text-gray-800 font-bold text-lg sm:text-xl mb-4 group-hover:text-[#7ce3b1] transition-colors duration-300">
                        {value.title}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed">
                        {value.description}
                      </p>
                    </div>

                    <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-[#7ce3b1] rounded-full opacity-0 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-500"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section
          id="why-choose-us"
          data-animate
          className="py-16 sm:py-20 lg:py-24 bg-white border-t border-gray-200 relative"
        >
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`text-center mb-12 sm:mb-16 transform transition-all duration-1000 ${
                isVisible["why-choose-us"]
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-green-500 mb-4">
                Why Choose Us
              </h2>
              <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-[#7ce3b1] to-[#5dd498] mx-auto mb-6 animate-pulse"></div>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
                We go beyond connecting you to a physiotherapist — we ensure your
                recovery journey is smooth, reliable, and personalized.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: <User className="w-8 h-8" />,
                  title: "Verified Professionals",
                  desc: "All physiotherapists are licensed and vetted for expertise and trustworthiness.",
                  color: "from-green-400 to-emerald-500",
                },
                {
                  icon: <Clock className="w-8 h-8" />,
                  title: "Flexible Scheduling",
                  desc: "Book sessions at times that work best for you — even weekends or evenings.",
                  color: "from-[#7ce3b1] to-[#5dd498]",
                },
                {
                  icon: <Heart className="w-8 h-8" />,
                  title: "Personalized Care",
                  desc: "Treatment plans tailored to your recovery goals and lifestyle.",
                  color: "from-pink-400 to-red-400",
                },
                {
                  icon: <MapPin className="w-8 h-8" />,
                  title: "Local & Accessible",
                  desc: "Find physiotherapists near you to save time and travel.",
                  color: "from-blue-400 to-indigo-400",
                },
                {
                  icon: <Award className="w-8 h-8" />,
                  title: "Proven Excellence",
                  desc: "Partnered only with practitioners with a strong track record of results.",
                  color: "from-yellow-400 to-orange-400",
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Safe & Secure",
                  desc: "Your health, data, and privacy are always protected.",
                  color: "from-purple-400 to-pink-400",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`group bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 hover:border-[#7ce3b1] transition-all duration-500 hover:shadow-xl relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 ${
                    isVisible["why-choose-us"]
                      ? "translate-y-0 opacity-100"
                      : "translate-y-20 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  ></div>
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="relative mb-6">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`}
                      ></div>
                      <div className="text-[#7ce3b1] group-hover:scale-110 transition-transform duration-300 relative z-10 p-4">
                        {item.icon}
                      </div>
                    </div>
                    <h3 className="text-gray-800 font-bold text-lg sm:text-xl mb-4 group-hover:text-[#7ce3b1] transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-[#7ce3b1] rounded-full opacity-0 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scroll to top button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-[#7ce3b1] to-[#5dd498] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group z-50"
        >
          <ChevronDown className="w-6 h-6 rotate-180 group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      </div>

      {/* Blog Section */}
      <BlogsSection />

      {/* Footer */}
      <Footer />
    </>
  );
};

export default AboutUsPage;