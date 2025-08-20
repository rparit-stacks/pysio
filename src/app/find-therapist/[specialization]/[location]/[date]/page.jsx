'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  getPhysiotherapistsByLocationAndSpecialization,
  getAllAvailablePhysiotherapists
} from '@/lib/actions/physiotherapist';
import TherapistCard from '@/app/components/TherapistCard';
import SearchBar from '@/app/components/SearchBar';
import SkeletonCard from '@/app/components/SkeletonCard';
import Footer from '@/app/components/footer';

export default function FindTherapistPage() {
  const { specialization, location, date } = useParams();

  const [therapists, setTherapists] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [foundExactMatch, setFoundExactMatch] = useState(true); // NEW

  const observerRef = useRef(null);
  const limit = 10;

  const fetchFallbackTherapists = useCallback(async (reset = false, skipCount = 0) => {
    setLoading(true);
    const result = await getAllAvailablePhysiotherapists(skipCount, limit);
    const data = result.success ? result.data : [];
    setTherapists(prev => (reset ? data : [...prev, ...data]));
    setHasMore(data.length === limit);
    setUseFallback(true);
    setFoundExactMatch(false); // this is fallback
    setLoading(false);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await getPhysiotherapistsByLocationAndSpecialization(
          decodeURIComponent(location),
          decodeURIComponent(specialization)
        );

        if (result.success && result.data.length > 0) {
          setTherapists(result.data);
          setHasMore(false);
          setUseFallback(false);
          setFoundExactMatch(true);
        } else {
          await fetchFallbackTherapists(true, 0);
        }
      } catch (err) {
        console.error('Failed to fetch therapists:', err);
        await fetchFallbackTherapists(true, 0);
      }
      setInitialLoad(false);
      setLoading(false);
    };

    loadData();
  }, [location, specialization, fetchFallbackTherapists]);

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

  const filtered = therapists.filter(t =>
    [t.name, t.specialization, t.bio, t.location]
      .some(field => field?.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 50);

  return (
    <section className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-screen-xl mx-auto relative z-10">
        <h1 className="text-2xl font-bold mb-2">
          {decodeURIComponent(specialization)} in {decodeURIComponent(location)} — {date}
        </h1>

        {/* Result status */}
        {!initialLoad && (
          <>
            {foundExactMatch ? (
              <p className="text-gray-600 mb-4">
                {therapists.length} therapist{therapists.length > 1 ? 's' : ''} available
              </p>
            ) : (
              <p className="text-gray-500 mb-4">
                No therapists found for your search — showing all available therapists instead.
              </p>
            )}
          </>
        )}

        <SearchBar
          value={search}
          onDebouncedChange={setSearch}
          suggestions={therapists.filter(t =>
            [t.name, t.specialization, t.bio, t.location]
              .some(field => field?.toLowerCase().includes(search.toLowerCase()))
          )}
          onSelectSuggestion={t => setSearch(t.name)}
        />

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

        {loading && skip > 0 && (
          <p className="text-center text-gray-500 mt-4">Loading more therapists...</p>
        )}
        {!loading && !hasMore && useFallback && (
          <p className="text-center text-gray-400 mt-4">No more therapists to show.</p>
        )}
      </div>
      <Footer />
    </section>
  );
}
