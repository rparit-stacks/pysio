import React, { useEffect, useState } from 'react';
import { getTherapistsBySpecialization } from '@/lib/api'; // your fetch logic

export default function TherapistDetailModal({ spec, open, onClose }) {
  const [therapists, setTherapists] = useState([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    if (!spec) return;
    const fetchData = async () => {
      const res = await getTherapistsBySpecialization(spec.id);
      if (res.success) setTherapists(res.data);
    };
    fetchData();
  }, [spec]);

  const filteredTherapists = therapists.filter(t =>
    [t.name, t.city, t.experience + ''].some(field =>
      field?.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (!open || !spec) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {spec.name} – {therapists.length}+ Therapists
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            ✕
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name, city, or experience"
          className="w-full mb-4 p-2 border rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-3">
          {filteredTherapists.map(t => (
            <div key={t.id} className="p-4 border rounded shadow-sm bg-gray-50">
              <h3 className="font-bold text-gray-700">{t.name}</h3>
              <p className="text-sm text-gray-600">City: {t.city}</p>
              <p className="text-sm text-gray-600">Experience: {t.experience} years</p>
            </div>
          ))}
          {filteredTherapists.length === 0 && (
            <p className="text-sm text-gray-500">No therapists found.</p>
          )}
        </div>
      </div>
    </div>
  );
}



{/*<TherapistDetailModal
  spec={selectedSpec}
  open={modalOpen}
  onClose={() => setModalOpen(false)}
/> 




<p className="text-gray-600 leading-relaxed">
  {spec.description || "Specialized physiotherapy treatment..."}
</p>
<div className="mt-2 text-sm text-[#5eb893] font-medium">
  {spec.therapistCount}+ Therapists Available ·{" "}
  <button
    onClick={() => handleViewNow(spec)}
    className="underline hover:text-[#45a77f] transition"
  >
    View Now
  </button>
</div>*/}


