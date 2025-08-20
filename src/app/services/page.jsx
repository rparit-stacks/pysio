"use client";

import { useState, useEffect } from "react";
import { getSpecializations } from "../../lib/services/specialization";
import { Stethoscope, Heart, Users, Star } from "lucide-react";
import Footer from "../components/footer";

const SpecializationsPage = () => {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        setLoading(true);
        const response = await getSpecializations();
        if (response.success) {
          setSpecializations(response.data);
        } else {
          setError(response.message || "Failed to fetch specializations");
        }
      } catch (err) {
        console.error("Error fetching specializations:", err);
        setError("An error occurred while fetching specializations");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecializations();
  }, []);

  return (
    <>
      <section
    className="relative bg-gradient-to-br from-[#7ce3b1]/10 via-white to-[#7ce3b1]/5 min-h-screen py-20 px-4 overflow-hidden"
    style={{
      backgroundImage: "url('/bone.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
  >
      
        <div className="relative z-10 max-w-7xl mx-auto">
     <div className="rounded-2xl p-8 text-center space-y-6 mb-16 animate-fade-in-up transition duration-500">

  {/* Badge */}
  <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full animate-fade-in">
    <Stethoscope className="h-5 w-5 text-green-400 transition-transform duration-500 hover:scale-110" />
    <span className="text-green-500 font-semibold tracking-wide">Our Specializations</span>
  </div>

  {/* Heading */}
  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-green-600 leading-tight animate-fade-in delay-100">
    Expert Care in
    <span className="text-green-400 block">Every Specialty</span>
  </h1>

  {/* Description */}
  <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-200">
    Discover our comprehensive range of physiotherapy specializations.
    Each treatment area is designed to provide targeted care for your specific needs.
  </p>

  {/* Features */}
  <div className="flex flex-wrap justify-center gap-6 pt-4">
    <div className="flex items-center gap-2 animate-fade-in-up delay-300">
      <Heart className="h-5 w-5 text-green-400 transition-transform duration-500 hover:scale-110" />
      <span className="text-gray-700 font-medium tracking-wide">Personalized Care</span>
    </div>
    <div className="flex items-center gap-2 animate-fade-in-up delay-400">
      <Users className="h-5 w-5 text-green-400 transition-transform duration-500 hover:scale-110" />
      <span className="text-gray-700 font-medium tracking-wide">Expert Therapists</span>
    </div>
    <div className="flex items-center gap-2 animate-fade-in-up delay-500">
      <Star className="h-5 w-5 text-green-400 transition-transform duration-500 hover:scale-110" />
      <span className="text-gray-700 font-medium tracking-wide">Proven Results</span>
    </div>
  </div>
</div>


          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
                  <div className="h-6 w-16 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 w-full bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
              <div className="text-red-600 font-semibold mb-2">Error Loading Specializations</div>
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          )}

{/* Specializations Grid */}
{!loading && !error && specializations.length > 0 && (
  <div className="flex flex-wrap gap-8 justify-center">
    {specializations.map((spec, index) => (
      <div
        key={spec.id || index}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 border hover:border-[#7ce3b1]/50 
                   transition-transform duration-300 hover:scale-105 
                   w-full sm:w-[calc(50%-1rem)] lg:w-[calc(45%-1rem)] xl:w-[calc(30%-1rem)]"
      >
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#7ce3b1] to-[#6dd4a2] text-white rounded-xl font-bold mb-4">
          {index + 1}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {spec.name}
        </h3>
        <p className="text-gray-600 mb-4">
          {spec.description ||
            "Specialized physiotherapy treatment tailored to your needs."}
        </p>
        <a
          href={`/services/${spec.name}`}
          className="block text-center bg-emerald-600 from-[#7ce3b1] to-[#6dd4a2] text-white py-2 rounded-lg font-medium hover:from-[#6dd4a2] hover:to-[#5eb893] transition"
        >
          View Therapists
        </a>
      </div>
    ))}
  </div>
)}


          {/* No Specializations */}
          {!loading && !error && specializations.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Specializations Available</h3>
                <p className="text-gray-500">
                  We're currently updating our specializations. Please check back soon.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-10 w-20 h-20 bg-[#7ce3b1]/40 rounded-full opacity-40 animate-float"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-[#7ce3b1]/30 rounded-full opacity-30 animate-float-delayed"></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-[#7ce3b1]/50 rounded-full opacity-50 animate-float"></div>
      </section>

      <Footer />
    </>
  );
};

export default SpecializationsPage;
