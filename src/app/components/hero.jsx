"use client";
import { requireAuth } from "../../lib/auth";
import { getSpecializations } from "../../lib/services/specialization";
import { getCities } from "../../lib/services/city";
import { Calendar, MapPin, Users } from 'lucide-react';
import { useState, useEffect } from "react";

const Hero = () => {
  const [selectedService, setSelectedService] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specializationsRes, citiesRes] = await Promise.all([
          getSpecializations(),
          getCities(),
        ]);

        if (specializationsRes.success) {
          setSpecializations(specializationsRes.data);
        }

        if (citiesRes.success) {
          setCities(citiesRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to handle navigation
  const handleFindPhysiotherapists = async () => {
    // Validate form fields
    const bool = await requireAuth();
    if (!selectedService || !selectedLocation || !selectedDate) {
      alert("Please fill in all fields before searching");
      return;
    }

    // Create URL-friendly slugs
    const serviceSlug = selectedService
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/'/g, "");
    const locationSlug = selectedLocation.toLowerCase();
    const dateSlug = selectedDate;

    // Construct the URL - format: /find/[service]/[location]/[date]
    const url = `/find-therapist/${serviceSlug}/${locationSlug}/${dateSlug}`;

    // Navigate to the URL
    window.location.href = url;
  };

  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12 sm:py-24 sm:pb-36 px-4 sm:px-6 overflow-hidden">
      {/* Background Image - Reduced size */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 transition-opacity duration-700 hover:opacity-15"
        style={{
          backgroundImage: "url('/bone.png')",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-10 animate-fade-in-up">
            <div className="space-y-6">
              {/* <CHANGE> Fixed capitalization in heading text */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-500 leading-tight animate-slide-in-left">
                Your Path to
                <span className="text-green-500 block animate-bounce-subtle bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                  Recovery Starts Here
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed animate-fade-in delay-300 hover:text-gray-700 transition-colors duration-300">
                Book appointments with certified physiotherapists in your area.
                Get personalized treatment plans and recover faster with expert
                care.
              </p>
            </div>

            {/* <CHANGE> Enhanced buttons with better spacing and hover animations */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in delay-500">
              <button className="group bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 text-base font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 active:scale-95 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <a href="/find-therapist" className="relative z-10">Book Appointment</a>
              </button>

              <button className="group border-2 border-emerald-500 bg-white hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 px-8 py-4 text-base font-semibold rounded-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 active:scale-95 hover:shadow-lg hover:border-emerald-600">
                <a href="/find-therapist" className="relative z-10">Find Therapists</a>
              </button>
            </div>

            {/* <CHANGE> Enhanced therapist CTA with better spacing and animations */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 hover:border-emerald-200 transition-all duration-500 hover:shadow-lg hover:bg-white group">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-gray-900 font-bold text-lg group-hover:text-emerald-700 transition-colors duration-300">
                    Are you a physiotherapist?
                  </p>
                  <p className="text-gray-600 text-base mt-1 group-hover:text-gray-700 transition-colors duration-300">
                    Join our network and connect with patients
                  </p>
                </div>
                <a
                  href="/register-therapist"
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold shadow-md hover:shadow-xl transition-all duration-500 whitespace-nowrap transform hover:scale-110 hover:-translate-y-1 active:scale-95"
                >
                  Join as Therapist
                </a>
              </div>
            </div>

            {/* <CHANGE> Enhanced feature icons with better spacing and hover effects */}
            <div className="flex flex-wrap gap-8 pt-6">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-all duration-300 group-hover:scale-110">
                  <Calendar className="h-6 w-6 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300" />
                </div>
                <span className="text-gray-700 font-semibold text-base group-hover:text-emerald-700 transition-colors duration-300">
                  Easy Scheduling
                </span>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-all duration-300 group-hover:scale-110">
                  <MapPin className="h-6 w-6 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300" />
                </div>
                <span className="text-gray-700 font-semibold text-base group-hover:text-emerald-700 transition-colors duration-300">
                  Local Therapists
                </span>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-all duration-300 group-hover:scale-110">
                  <Users className="h-6 w-6 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300" />
                </div>
                <span className="text-gray-700 font-semibold text-base group-hover:text-emerald-700 transition-colors duration-300">
                  Expert Care
                </span>
              </div>
            </div>
          </div>

          {/* <CHANGE> Enhanced booking form with better animations and spacing */}
          <div className="relative animate-slide-in-right">
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-10 border hover:shadow-emerald-100 transition-all duration-700 hover:scale-105 group">
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-bold text-green-500 group-hover:text-green-600 transition-colors duration-300">
                    Quick Booking
                  </h3>
                  <p className="text-gray-600 text-lg group-hover:text-gray-700 transition-colors duration-300">Schedule your appointment now</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Service
                    </label>
                    <select
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 hover:border-emerald-300 bg-gray-50 hover:bg-white"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                    >
                      <option value="">Choose your service</option>
                      {loading ? (
                        <option disabled>Loading specializations...</option>
                      ) : (
                        specializations.map((spec) => (
                          <option key={spec.id} value={spec.name}>
                            {spec.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Location
                    </label>
                    <select
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 hover:border-emerald-300 bg-gray-50 hover:bg-white"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      <option value="">Choose your location</option>
                      {loading ? (
                        <option disabled>Loading cities...</option>
                      ) : (
                        cities.map((city) => (
                          <option key={city.id} value={city.name}>
                            {city.name}, {city.county}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 hover:border-emerald-300 bg-gray-50 hover:bg-white"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]} // Prevent past dates
                    />
                  </div>

                  {/* <CHANGE> Fixed capitalization in button text and enhanced styling */}
                  <button
                    onClick={handleFindPhysiotherapists}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 active:scale-95 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10">Find Available Physiotherapists</span>
                  </button>
                </div>
              </div>
            </div>

            {/* <CHANGE> Enhanced floating elements with better animations */}
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-full opacity-60 animate-float hover:opacity-80 transition-opacity duration-300"></div>
            <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full opacity-40 animate-float-delayed hover:opacity-60 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
