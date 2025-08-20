'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  getPhysiotherapistsByLocationAndSpecialization,
  getAllAvailablePhysiotherapists,
  getTherapistsBySpecializationName,
} from '@/lib/actions/physiotherapist';
import { getAllSpecializations } from '@/lib/actions/physiotherapist';

import TherapistCard from '@/app/components/TherapistCard';
import SearchBar from '@/app/components/SearchBar';
import SkeletonCard from '@/app/components/SkeletonCard';
import Footer from '@/app/components/footer';

export default function FindTherapistPage() {
  const { slug } = useParams();
  const [specialization, setSpecialization] = useState(decodeURIComponent(slug || ''));
  const [therapists, setTherapists] = useState([]);
  const [location, setLocation] = useState('Your Area');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showAllTherapists, setShowAllTherapists] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(specialization || 'All Therapists');
  const [allSpecializations, setAllSpecializations] = useState([]);
  const observerRef = useRef(null);
  const limit = 10;

  useEffect(() => {
    const specializationDropDownMenu = async () => {
      try {
        const result = await getAllSpecializations();
        setAllSpecializations(result.data);
      } catch (error) {
        console.log('no data found');
      }
    };
    specializationDropDownMenu();
  }, []);

  const groupTherapistsByCity = (therapistsList) => {
    const grouped = therapistsList.reduce((acc, therapist) => {
      const city = therapist.location || 'Unknown City';
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(therapist);
      return acc;
    }, {});

    // Sort cities alphabetically
    const sortedCities = Object.keys(grouped).sort();

    // Sort therapists within each city alphabetically
    const result = {};
    sortedCities.forEach(city => {
      result[city] = grouped[city].sort((a, b) => a.name.localeCompare(b.name));
    });

    return result;
  };

  const fetchFallbackTherapists = useCallback(async (reset = false, skipCount = 0) => {
    setLoading(true);
    const result = await getAllAvailablePhysiotherapists(skipCount, limit);
    const data = result.success ? result.data : [];
    setTherapists((prev) => (reset ? data : [...prev, ...data]));
    setHasMore(data.length === limit);
    setUseFallback(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    const loadInitial = async () => {
      if (!navigator.geolocation) {
        setLocation('Random Locations');
        await fetchFallbackTherapists(true, 0);
        setInitialLoad(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
            );
            const data = await res.json();
            const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county;

            if (city) {
              setLocation(city);
              const result = await getPhysiotherapistsByLocationAndSpecialization(city, specialization);
              if (result.success && result.data.length > 0) {
                setTherapists(result.data);
                setUseFallback(false);
                setHasMore(false);
              } else {
                const specResult = await getTherapistsBySpecializationName(specialization);
                if (specResult.success && specResult.data.length > 0) {
                  setTherapists(specResult.data);
                  setUseFallback(false);
                  setHasMore(false);
                } else {
                  setLocation('Random Locations');
                  await fetchFallbackTherapists(true, 0);
                }
              }
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
  }, [fetchFallbackTherapists, specialization]);

  const lastElementRef = useCallback(
    (node) => {
      if (loading || !hasMore || !useFallback || isSearching) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setSkip((prev) => prev + limit);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, useFallback, isSearching]
  );

  useEffect(() => {
    if (skip === 0 || !useFallback) return;
    fetchFallbackTherapists(false, skip);
  }, [skip, fetchFallbackTherapists, useFallback]);

  useEffect(() => {
    setIsSearching(search.trim().length > 0);
  }, [search]);

  const handleShowAllTherapists = async () => {
    setLoading(true);
    setShowAllTherapists(true);
    setSelectedCategory('All Therapists');
    const result = await getAllAvailablePhysiotherapists(0, 100);
    if (result.success) {
      setTherapists(result.data);
      setHasMore(false);
      setUseFallback(false);
    }
    setLoading(false);
  };

  const handleShowSpecialization = async () => {
    setLoading(true);
    setShowAllTherapists(false);
    setSelectedCategory(specialization);

    if (!navigator.geolocation) {
      const result = await getTherapistsBySpecializationName(specialization);
      if (result.success) {
        setTherapists(result.data);
        setUseFallback(false);
      }
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const data = await res.json();
          const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county;

          if (city) {
            setLocation(city);
            const result = await getPhysiotherapistsByLocationAndSpecialization(city, specialization);
            if (result.success && result.data.length > 0) {
              setTherapists(result.data);
              setUseFallback(false);
            } else {
              const specResult = await getTherapistsBySpecializationName(specialization);
              if (specResult.success) {
                setTherapists(specResult.data);
                setUseFallback(false);
              }
            }
          } else {
            const specResult = await getTherapistsBySpecializationName(specialization);
            if (specResult.success) {
              setTherapists(specResult.data);
              setUseFallback(false);
            }
          }
        } catch (err) {
          console.error('Geolocation reverse lookup failed:', err);
          const specResult = await getTherapistsBySpecializationName(specialization);
          if (specResult.success) {
            setTherapists(specResult.data);
            setUseFallback(false);
          }
        } finally {
          setLoading(false);
        }
      },
      async () => {
        const specResult = await getTherapistsBySpecializationName(specialization);
        if (specResult.success) {
          setTherapists(specResult.data);
          setUseFallback(false);
        }
        setLoading(false);
      }
    );
  };

  const filtered = therapists.filter((t) =>
    [t.name, t.specialization, t.bio, t.location].some((field) =>
      field?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const groupedTherapists = groupTherapistsByCity(filtered);

  return (
    <section className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-screen-xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          {/* Left Title & Stats Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find a Therapist</h1>
            <p className="text-gray-600 mt-1">
              {selectedCategory === 'All Therapists'
                ? 'All available therapists grouped by city'
                : `${specialization} therapists in ${location}`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {filtered.length} therapist{filtered.length !== 1 && 's'} found across {Object.keys(groupedTherapists).length} cities
            </p>
          </div>
          
          {/* Right Filters Section */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Specialization Dropdown */}
            <div className="relative">
              <select
                onChange={(e) => {
                  setSpecialization(e.target.value);
                  const selected = allSpecializations.find(
                    (spec) => spec.name === e.target.value
                  );
                  if (selected) {
                    handleShowSpecialization(selected.name);
                  }
                }}
                value={selectedCategory === 'All Therapists' ? '' : specialization || ''}
                className={`px-4 py-2 rounded-lg border pr-8 appearance-none transition-colors
                  ${selectedCategory !== 'All Therapists'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'}
                `}
              >
                <option className="text-black bg-white" value="">Select Specialization</option>
                {allSpecializations.map((spec) => (
                  <option
                    key={spec.id}
                    value={spec.name}
                    className="text-black bg-white"
                  >
                    {spec.name}
                  </option>
                ))}
              </select>

              {/* Dropdown arrow */}
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  className={`w-4 h-4 ${
                    selectedCategory !== 'All Therapists' ? 'text-white' : 'text-gray-500'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* All Therapists Button */}
            <button
              onClick={handleShowAllTherapists}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === 'All Therapists'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Therapists
            </button>
          </div>
        </div>

        {/* Search */}
        <SearchBar
          value={search}
          onDebouncedChange={setSearch}
          suggestions={therapists.filter((t) =>
            [t.name, t.specialization, t.bio, t.location].some((field) =>
              field?.toLowerCase().includes(search.toLowerCase())
            )
          )}
          onSelectSuggestion={(t) => setSearch(t.name)}
        />

        {/* Therapist Cards Grouped by City */}
        {(initialLoad || loading) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 8 }).map((_, idx) => <SkeletonCard key={idx} />)}
          </div>
        ) : (
          Object.entries(groupedTherapists).map(([city, cityTherapists]) => (
            <div key={city} className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-emerald-100 text-emerald-800 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  {city.charAt(0).toUpperCase()}
                </span>
                {city}
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  ({cityTherapists.length} {cityTherapists.length === 1 ? 'therapist' : 'therapists'})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {cityTherapists.map((therapist, index) => (
                  <TherapistCard 
                    key={therapist.id} 
                    therapist={therapist}
                    ref={index === cityTherapists.length - 1 && !showAllTherapists ? lastElementRef : null}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        {/* Pagination Trigger */}
        {!showAllTherapists && filtered.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleShowAllTherapists}
              className="bg-white border border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Show All Therapists
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-20 text-center space-y-6 animate-fade-in delay-700">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#7ce3b1]/30 shadow-lg max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-green-500 mb-4">
              Ready to Start Your Recovery Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Book an appointment with our certified physiotherapists and get personalized treatment plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-emerald-600 from-[#7ce3b1] to-[#6dd4a2] hover:from-[#6dd4a2] hover:to-[#5eb893] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Book Appointment Now
              </button>
              <button className="border-2 border-[#7ce3b1] bg-emerald-600 text-white hover:bg-[#7ce3b1]/10 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105">
                Find Therapists
              </button>
            </div>
          </div>
        </div>

        {/* Load more + end message */}
        {loading && skip > 0 && (
          <p className="text-center text-gray-500 mt-4">Loading more therapists...</p>
        )}
        {!loading && !hasMore && useFallback && !showAllTherapists && (
          <p className="text-center text-gray-400 mt-4">No more therapists to show.</p>
        )}
      </div>

      <Footer />
    </section>
  );
}