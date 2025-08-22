"use client";
import { MapPin, Clock, Star, Users, Phone } from 'lucide-react';
import { useState, useEffect, useRef } from "react";

const IrelandPhysiotherapistMap = () => {
  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [L, setL] = useState(null);

  // Physiotherapist locations with real coordinates
  const physiotherapistLocations = [
    {
      id: 1,
      name: "Dublin",
      lat: 53.3498,
      lng: -6.2603,
      count: 12,
      avgRating: 4.8,
      nextAvailable: "Today",
    },
    {
      id: 2,
      name: "Cork",
      lat: 51.8985,
      lng: -8.4756,
      count: 8,
      avgRating: 4.9,
      nextAvailable: "Tomorrow",
    },
    {
      id: 3,
      name: "Galway",
      lat: 53.2707,
      lng: -9.0568,
      count: 6,
      avgRating: 4.7,
      nextAvailable: "Today",
    },
    {
      id: 4,
      name: "Limerick",
      lat: 52.6638,
      lng: -8.6267,
      count: 5,
      avgRating: 4.6,
      nextAvailable: "2 days",
    },
    {
      id: 5,
      name: "Waterford",
      lat: 52.2593,
      lng: -7.1101,
      count: 4,
      avgRating: 4.8,
      nextAvailable: "Tomorrow",
    },
    {
      id: 6,
      name: "Kilkenny",
      lat: 52.6541,
      lng: -7.2448,
      count: 3,
      avgRating: 4.7,
      nextAvailable: "Today",
    },
    {
      id: 7,
      name: "Drogheda",
      lat: 53.7189,
      lng: -6.3478,
      count: 4,
      avgRating: 4.5,
      nextAvailable: "3 days",
    },
    {
      id: 8,
      name: "Dundalk",
      lat: 54.0014,
      lng: -6.4018,
      count: 3,
      avgRating: 4.6,
      nextAvailable: "Tomorrow",
    },
    {
      id: 9,
      name: "Bray",
      lat: 53.2026,
      lng: -6.0991,
      count: 3,
      avgRating: 4.8,
      nextAvailable: "Today",
    },
    {
      id: 10,
      name: "Navan",
      lat: 53.6525,
      lng: -6.6823,
      count: 2,
      avgRating: 4.7,
      nextAvailable: "4 days",
    },
    {
      id: 11,
      name: "Ennis",
      lat: 52.8435,
      lng: -8.9864,
      count: 3,
      avgRating: 4.9,
      nextAvailable: "Tomorrow",
    },
    {
      id: 12,
      name: "Tralee",
      lat: 52.2713,
      lng: -9.7016,
      count: 4,
      avgRating: 4.6,
      nextAvailable: "Today",
    },
    {
      id: 13,
      name: "Carlow",
      lat: 52.8407,
      lng: -6.9269,
      count: 2,
      avgRating: 4.8,
      nextAvailable: "5 days",
    },
    {
      id: 14,
      name: "Naas",
      lat: 53.2186,
      lng: -6.6668,
      count: 3,
      avgRating: 4.7,
      nextAvailable: "Tomorrow",
    },
    {
      id: 15,
      name: "Athlone",
      lat: 53.4239,
      lng: -7.9407,
      count: 3,
      avgRating: 4.5,
      nextAvailable: "Today",
    },
  ];

  useEffect(() => {
    // Dynamically load Leaflet
    const loadLeaflet = async () => {
      if (typeof window !== "undefined" && !window.L) {
        // Load Leaflet CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
        script.onload = () => {
          setL(window.L);
        };
        document.head.appendChild(script);
      } else if (window.L) {
        setL(window.L);
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (L && mapRef.current && !map) {
      // Initialize map centered on Ireland
      const newMap = L.map(mapRef.current, {
        center: [53.1424, -7.6921],
        zoom: 7,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(newMap);

      // Custom red marker icon with enhanced design
      const redIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            animation: pulse 2s infinite;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
          </style>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      // Add markers for each location
      physiotherapistLocations.forEach((location) => {
        const marker = L.marker([location.lat, location.lng], {
          icon: redIcon,
        }).addTo(newMap);

        // Add popup on hover with enhanced styling
        marker.bindTooltip(
          `<div style="
            text-align: center; 
            font-weight: 600; 
            color: #374151;
            padding: 8px;
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border-radius: 8px;
            border: 1px solid #bbf7d0;
          ">
            <div style="font-size: 16px; margin-bottom: 4px;">${location.name}</div>
            <div style="color: #059669; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; display: inline-block;"></span>
              ${location.count} therapists
            </div>
          </div>`,
          {
            permanent: false,
            direction: "top",
            offset: [0, -8],
            className: "custom-tooltip"
          },
        );
      });

      setMap(newMap);
    }

    // Cleanup
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [L, map]);

  const closeModal = () => {
    setSelectedLocation(null);
  };

  const handleBookNow = (location) => {
    // You can implement booking logic here
    console.log("Booking appointment in:", location.name);
    closeModal();
  };

  const handleViewAll = (location) => {
    // You can implement view all therapists logic here
    console.log("Viewing all therapists in:", location.name);
    closeModal();
  };

  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-white to-green-50 py-6 sm:py-10 md:py-16 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-green-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-2xl"></div>
      </div>

      <div className="w-full relative z-10">
        {/* Header with enhanced mobile spacing */}
        <div className="text-center space-y-4 mb-6 sm:mb-10 px-4 animate-fade-in-up">
          <div className="inline-block">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 bg-clip-text text-transparent animate-slide-in-down leading-tight">
              Find Physiotherapists
              <span className="block text-green-600 animate-pulse-subtle">Across Ireland</span>
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mx-auto mt-3 animate-pulse"></div>
          </div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in delay-300 px-2 leading-relaxed">
            Discover certified physiotherapists in your area. Click on any
            marker to view available therapists and book your appointment.
          </p>
        </div>

        {/* Map Container with reduced height and improved mobile experience */}
        <div className="relative overflow-hidden animate-fade-in delay-500 px-4 sm:px-6 lg:px-8">
          <div className="relative group">
            <div
              ref={mapRef}
              className="w-full h-[280px] sm:h-[350px] md:h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 relative z-10 rounded-2xl shadow-xl border border-gray-200 transition-all duration-700 group-hover:shadow-2xl overflow-hidden"
              style={{ 
                minHeight: "280px",
                touchAction: "pan-x pan-y" // Better mobile scroll behavior
              }}
            />
            
            {/* Subtle border glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10"></div>
          </div>

          {/* Loading overlay with enhanced design */}
          {!L && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-2xl border border-gray-200">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="absolute inset-0 w-10 h-10 border-4 border-emerald-200 rounded-full mx-auto animate-pulse"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading interactive map...</p>
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced stats section */}
        <div className="mt-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">15</div>
                <div className="text-sm text-gray-600 font-medium">Cities</div>
              </div>
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">68</div>
                <div className="text-sm text-gray-600 font-medium">Therapists</div>
              </div>
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">4.7</div>
                <div className="text-sm text-gray-600 font-medium">Avg Rating</div>
              </div>
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 group-hover:scale-110 transition-transform duration-300">24/7</div>
                <div className="text-sm text-gray-600 font-medium">Booking</div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Details Modal with enhanced design */}
        {selectedLocation && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative border border-gray-100 animate-scale-in">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-300 group"
              >
                <span className="text-xl font-bold group-hover:rotate-90 transition-transform duration-300">×</span>
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedLocation.name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                      <Users className="h-5 w-5" />
                      <span className="font-medium">Available</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-600">
                      {selectedLocation.count}
                    </p>
                    <p className="text-sm text-emerald-600">Therapists</p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 text-yellow-700 mb-2">
                      <Star className="h-5 w-5" />
                      <span className="font-medium">Rating</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-600">
                      {selectedLocation.avgRating}
                    </p>
                    <p className="text-sm text-yellow-600">Average</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Next Available</span>
                  </div>
                  <p className="text-xl font-semibold text-blue-600">
                    {selectedLocation.nextAvailable}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleBookNow(selectedLocation)}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={() => handleViewAll(selectedLocation)}
                    className="flex-1 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    View All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default IrelandPhysiotherapistMap;