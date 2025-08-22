'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  getPhysiotherapistsByLocationAndSpecialization,
  getAllAvailablePhysiotherapists
} from '@/lib/actions/physiotherapist';
import TherapistCard from '../components/TherapistCard';
import SearchBar from '../components/SearchBar';
import SkeletonCard from '../components/SkeletonCard';
import Footer from '../components/footer';

export default function FindTherapistPage() {
  const [therapists, setTherapists] = useState([]);
  const [location, setLocation] = useState('Your Area');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const observerRef = useRef(null);
  const specialization = null; // Show all specializations
  const limit = 10;
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchFallbackTherapists = useCallback(async (reset = false, skipCount = 0) => {
    setLoading(true);
    const result = await getAllAvailablePhysiotherapists(skipCount, limit);
    let data = result.success ? result.data : [];
    
    // If specialization is specified, filter by it
    if (specialization) {
      data = data.filter(therapist => 
        therapist.specialization?.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    setTherapists(prev => reset ? data : [...prev, ...data]);
    setHasMore(data.length === limit);
    setUseFallback(true);
    setLoading(false);
  }, [specialization]);

  useEffect(() => {
    const loadInitial = async () => {
      if (!navigator.geolocation) {
        setLocation('Random Locations');
        await fetchFallbackTherapists(true, 0);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
            const data = await res.json();
            const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county;

            if (city) {
              setLocation(city);
              // Since specialization is null, just load all therapists for the city
              // For now, let's use the fallback to show all therapists
              setLocation('Random Locations');
              await fetchFallbackTherapists(true, 0);
            } else {
              setLocation('Random Locations');
              await fetchFallbackTherapists(true, 0);
            }
          } catch (err) {
            console.error('Geolocation reverse lookup failed:', err);
            setLocation('Random Locations');
            await fetchFallbackTherapists(true, 0);
          } finally {
            setInitialLoad(false);
          }
        },
        async () => {
          setLocation('Random Locations');
          await fetchFallbackTherapists(true, 0);
          setInitialLoad(false);
        }
      );
    };

    loadInitial();
  }, [fetchFallbackTherapists]);

  const lastElementRef = useCallback(
    node => {
      if (loading || !hasMore || !useFallback || isSearching) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setSkip(prev => prev + limit);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, useFallback, isSearching]
  );

  useEffect(() => {
    setIsSearching(search.trim().length > 0);
  }, [search]);

  useEffect(() => {
    if (skip === 0 || !useFallback) return;
    fetchFallbackTherapists(false, skip);
  }, [skip, fetchFallbackTherapists, useFallback]);

  const filtered = therapists.filter(t => {
    const searchTerm = search.toLowerCase();
    const fieldsToSearch = [
      t.name,
      t.specialization, 
      t.bio,
      t.location,
      // Add clinic cities for place name search
      ...(t.clinics?.map(clinic => clinic.city) || []),
      // Add clinic names
      ...(t.clinics?.map(clinic => clinic.name) || [])
    ];
    
    return fieldsToSearch.some(field => 
      field?.toLowerCase().includes(searchTerm)
    );
  }).slice(0, 50);

  return (
    <section className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-screen-xl mx-auto relative z-10">

        {/* Search Bar with better mobile spacing */}
        <div className="mb-8 sm:mb-12">
          <SearchBar
            value={search}
            onDebouncedChange={setSearch}
            suggestions={therapists.filter((t) => {
              const searchTerm = search.toLowerCase();
              const fieldsToSearch = [
                t.name,
                t.specialization, 
                t.bio,
                t.location,
                // Add clinic cities for place name search
                ...(t.clinics?.map(clinic => clinic.city) || []),
                // Add clinic names
                ...(t.clinics?.map(clinic => clinic.name) || [])
              ];
              
              return fieldsToSearch.some(field => 
                field?.toLowerCase().includes(searchTerm)
              );
            })}
            onSelectSuggestion={(t) => setSearch(t.name)}
          />
        </div>

        {/* Hero section with improved mobile spacing */}
        <div className="bg-[#f9fdfc] py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-20 text-center relative mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-500 leading-tight">
            Expert Care in <br />
            <span className="text-green-500">Every Specialty</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-gray-600 text-base md:text-lg max-w-2xl mx-auto px-2">
            Discover our comprehensive range of physiotherapy specializations. Each treatment
            area is designed to provide targeted care for your specific needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8 text-sm text-gray-700 px-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" />
              </svg>
              <span className="text-xs sm:text-sm">Personalized Care</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zM6 20v-2c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v2" />
              </svg>
              <span className="text-xs sm:text-sm">Expert Therapists</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.45-6.3L22 9.24l-6.38-.55L12 3 8.38 8.69 2 9.24l5.27 5.46L5.82 21z" />
              </svg>
              <span className="text-xs sm:text-sm">Proven Results</span>
            </div>
          </div>
        </div>

        {/* Therapist grid with better mobile spacing */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {initialLoad
            ? Array.from({ length: 8 }).map((_, idx) => <SkeletonCard key={idx} />)
            : filtered.map((t, index) =>
                index === filtered.length - 1 ? (
                  <div key={t.id} ref={lastElementRef}>
                    <TherapistCard therapist={t} />
                  </div>
                ) : (
                  <TherapistCard key={t.id} therapist={t} />
                )
              )}
        </div>

        {/* CTA section with improved mobile layout */}
        <div className="mt-12 sm:mt-16 md:mt-20 text-center space-y-6 animate-fade-in delay-700 mb-8 sm:mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-[#7ce3b1]/30 shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-500 mb-4 sm:mb-6">
              Ready to Start Your Recovery Journey?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-2">
              Book an appointment with our certified physiotherapists and get personalized treatment plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-2">
              <button className="cursor-pointer bg-emerald-600 from-[#7ce3b1] to-[#6dd4a2] hover:from-[#6dd4a2] hover:to-[#5eb893] text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Book Appointment Now
              </button>
              <button className="cursor-pointer border-2 border-[#7ce3b1] hover:bg-[#7ce3b1]/10 text-emerald-600 hover:text-emerald-700 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105">
                Find Therapists
              </button>
            </div>
          </div>
        </div>

        {/* Loading and status messages with better spacing */}
        {loading && skip > 0 && (
          <p className="text-center text-gray-500 mt-6 sm:mt-8 mb-4">Loading more therapists...</p>
        )}

        {!loading && !hasMore && useFallback && (
          <p className="text-center text-gray-400 mt-6 sm:mt-8 mb-4">No more therapists to show.</p>
        )}
      </div>

      <Footer />
    </section>
  );
}
