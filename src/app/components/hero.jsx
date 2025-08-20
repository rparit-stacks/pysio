"use client";
import { requireAuth } from "../../lib/auth";
import { getSpecializations } from "../../lib/services/specialization";
import { getCities } from "../../lib/services/city";
import { Calendar, MapPin, Users } from "lucide-react";
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
<section className="relative bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10 sm:py-20 sm:pb-32 px-3 sm:px-4 overflow-hidden">


      {/* Background Image - Reduced size */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: "url('/bone.png')",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-500 leading-snug animate-slide-in-left">
  Your Path to
  <span className="text-green-500 block animate-bounce-subtle">
    Recovery Starts Here
  </span>
</h1>


              <p className="text-xl text-gray-600 leading-relaxed animate-fade-in delay-300">
                Book appointments with certified physiotherapists in your area.
                Get personalized treatment plans and recover faster with expert
                care.
              </p>
            </div>

            <div className="flex flex-row gap-3 animate-fade-in delay-500">
  <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-45 sm:w-auto">
    <a href="/find-therapist">Book Appointment</a>
  </button>

  <button className="border-2 bg-emerald-600 border-emerald-500 px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-105 w-45 sm:w-auto">
    <a href="/find-therapist">Find Therapists</a>
  </button>
</div>


            {/* Therapist CTA */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-emerald-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-gray-900 font-semibold">
                    Are you a physiotherapist?
                  </p>
                  <p className="text-gray-600 text-sm">
                    Join our network and connect with patients
                  </p>
                </div>
                <a
                  href="/register-therapist"
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                >
                  Join as Therapist
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-500" />
                <span className="text-gray-700 font-medium">
                  Easy Scheduling
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <span className="text-gray-700 font-medium">
                  Local Therapists
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-700" />
                <span className="text-gray-700 font-medium">Expert Care</span>
              </div>
            </div>
          </div>

          <div className="relative animate-slide-in-right">
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 border hover:shadow-emerald-100 transition-all duration-500">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-green-500">
                    Quick Booking
                  </h3>
                  <p className="text-gray-600">Schedule your appointment now</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Service
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Location
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]} // Prevent past dates
                    />
                  </div>

                  <button
                    onClick={handleFindPhysiotherapists}
                    className="w-full bg-emerald-600 from-[#7ce3b1] to-[#6dd4a2] hover:from-[#6dd4a2] hover:to-[#5eb893] text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Find Available physiotherapists
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-200 rounded-full opacity-60 animate-float"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-100 rounded-full opacity-40 animate-float-delayed"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
