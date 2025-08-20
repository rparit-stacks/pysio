"use client";
import { MapPin, Clock, Star, Users, Phone } from "lucide-react";
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

      // Custom red marker icon
      const redIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: #ef4444;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      // Add markers for each location
      physiotherapistLocations.forEach((location) => {
        const marker = L.marker([location.lat, location.lng], {
          icon: redIcon,
        }).addTo(newMap);

        // Add popup on hover
        marker.bindTooltip(
          `<div style="text-align: center; font-weight: 600; color: #374151;">
            ${location.name}<br>
            <span style="color: #059669; font-size: 0.875rem;">${location.count} therapists</span>
          </div>`,
          {
            permanent: false,
            direction: "top",
            offset: [0, -5],
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
    <section className="relative bg-gradient-to-br from-emerald-50 via-white to-green-50 py-8 sm:py-12 md:py-20">
      <div className="w-full">
        {/* Header with better mobile spacing */}
        <div className="text-center space-y-4 mb-8 sm:mb-12 px-4 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-500 animate-slide-in-down leading-tight">
            Find Physiotherapists
            <span className="text-green-500 block animate-pulse-subtle">Across Ireland</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in delay-300 px-2">
            Discover certified physiotherapists in your area. Click on any
            marker to view available therapists and book your appointment.
          </p>
        </div>

        {/* Map Container with improved mobile positioning */}
        <div className="relative overflow-hidden animate-fade-in delay-500 px-4 sm:px-0">
          <div
            ref={mapRef}
            className="w-full h-[400px] sm:h-[500px] md:h-[600px] bg-gray-100 relative z-10 hover:scale-105 transition-transform duration-700 rounded-lg"
            style={{ minHeight: "400px" }}
          />

          {/* Loading overlay */}
          {!L && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Location Details Modal */}
        {selectedLocation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold transition-colors"
              >
                ×
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-red-500" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedLocation.name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Users className="h-5 w-5" />
                      <span className="font-medium">Available</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {selectedLocation.count}
                    </p>
                    <p className="text-sm text-emerald-600">Therapists</p>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <Star className="h-5 w-5" />
                      <span className="font-medium">Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {selectedLocation.avgRating}
                    </p>
                    <p className="text-sm text-yellow-600">Average</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Next Available</span>
                  </div>
                  <p className="text-lg font-semibold text-blue-600">
                    {selectedLocation.nextAvailable}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleBookNow(selectedLocation)}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={() => handleViewAll(selectedLocation)}
                    className="flex-1 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 py-3 rounded-lg font-semibold transition-all duration-300"
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
