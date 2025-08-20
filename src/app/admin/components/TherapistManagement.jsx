'use client';

import { useState, useTransition } from 'react';
import { updatePhysiotherapistVerification, updatePhysiotherapistAvailability } from '../../../lib/actions/physiotherapist';
import TherapistDetailModal from './TherapistDetailModal';

export default function TherapistManagement({ therapists, error }) {
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVerificationToggle = async (therapistId, currentStatus) => {
    setUpdatingId(therapistId);
    
    startTransition(async () => {
      try {
        const result = await updatePhysiotherapistVerification(therapistId, !currentStatus);
        if (result.success) {
          window.location.reload();
        } else {
          alert('Failed to update verification status');
        }
      } catch (error) {
        alert('Error updating verification status');
      } finally {
        setUpdatingId(null);
      }
    });
  };

  const handleAvailabilityToggle = async (therapistId, currentStatus) => {
    setUpdatingId(therapistId);
    
    startTransition(async () => {
      try {
        const result = await updatePhysiotherapistAvailability(therapistId, !currentStatus);
        if (result.success) {
          window.location.reload();
        } else {
          alert('Failed to update availability status');
        }
      } catch (error) {
        alert('Error updating availability status');
      } finally {
        setUpdatingId(null);
      }
    });
  };

  const handleTherapistClick = (therapist) => {
    setSelectedTherapist(therapist);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTherapist(null);
  };

  if (error) {
    return (
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Therapist Management</h2>
        <div className="text-red-500">Error: {error}</div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Therapist Management</h2>
      
      {therapists.length === 0 ? (
        <div className="text-gray-500">No therapist profiles found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Therapist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credentials
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {therapists.map((therapist) => (
                <tr 
                  key={therapist.id} 
                  className={`cursor-pointer hover:bg-gray-50 ${!therapist.isVerified ? 'bg-yellow-50' : ''}`}
                  onClick={() => handleTherapistClick(therapist)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={therapist.profileImageUrl || '/profile.png'}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {therapist.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {therapist.specializations.join(', ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{therapist.email}</div>
                    <div className="text-sm text-gray-500">{therapist.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{therapist.qualification}</div>
                    <div className="text-sm text-gray-500">CORU: {therapist.coruRegistration}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{therapist.yearsExperience} years</div>
                    <div className="text-sm text-gray-500">€{therapist.hourlyRate}/hour</div>
                    {therapist.reviewCount > 0 && (
                      <div className="text-sm text-gray-500">
                        ⭐ {therapist.avgRating} ({therapist.reviewCount} reviews)
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        therapist.isVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {therapist.isVerified ? 'Verified' : 'Pending'}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        therapist.isAvailable 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {therapist.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerificationToggle(therapist.id, therapist.isVerified);
                        }}
                        disabled={isPending && updatingId === therapist.id}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          therapist.isVerified
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isPending && updatingId === therapist.id ? (
                          'Updating...'
                        ) : therapist.isVerified ? (
                          'Unverify'
                        ) : (
                          'Verify'
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAvailabilityToggle(therapist.id, therapist.isAvailable);
                        }}
                        disabled={isPending && updatingId === therapist.id}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          therapist.isAvailable
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isPending && updatingId === therapist.id ? (
                          'Updating...'
                        ) : therapist.isAvailable ? (
                          'Make Unavailable'
                        ) : (
                          'Make Available'
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        Total: {therapists.length} therapists | 
        Verified: {therapists.filter(t => t.isVerified).length} | 
        Pending: {therapists.filter(t => !t.isVerified).length}
      </div>

      <TherapistDetailModal
        therapist={selectedTherapist}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </section>
  );
}