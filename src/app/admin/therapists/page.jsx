'use client';

import { useState, useEffect } from 'react';
import AdminDashboardLayout from '../../components/AdminDashboardLayout';
import { Search, Eye, CheckCircle, XCircle, Star, MapPin, Phone, Mail, Trash2, Shield, ShieldCheck } from 'lucide-react';
import Toast from '../../components/ui/Toast';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import { getAllTherapists, deleteMultipleTherapists } from '../../../lib/actions/admin';
import { updatePhysiotherapistVerification, updatePhysiotherapistAvailability } from '../../../lib/actions/physiotherapist';

const AdminTherapistsPage = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [viewModal, setViewModal] = useState({ show: false, therapist: null });
  const [selectedTherapists, setSelectedTherapists] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchTherapists = async () => {
      setLoading(true);
      try {
        const result = await getAllTherapists();
        if (result.success) {
          setTherapists(result.data);
        } else {
          setToast({
            show: true,
            message: result.error || 'Failed to fetch therapists',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error fetching therapists:', error);
        setToast({
          show: true,
          message: 'Failed to fetch therapists',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (therapist.coruRegistration && therapist.coruRegistration.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && therapist.isVerified) ||
                         (statusFilter === 'unverified' && !therapist.isVerified) ||
                         (statusFilter === 'available' && therapist.isAvailable) ||
                         (statusFilter === 'unavailable' && !therapist.isAvailable);
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTherapists([]);
      setSelectAll(false);
    } else {
      setSelectedTherapists(filteredTherapists.map(therapist => therapist.id));
      setSelectAll(true);
    }
  };

  const handleSelectTherapist = (therapistId) => {
    setSelectedTherapists(prev => {
      if (prev.includes(therapistId)) {
        const newSelected = prev.filter(id => id !== therapistId);
        setSelectAll(newSelected.length === filteredTherapists.length);
        return newSelected;
      } else {
        const newSelected = [...prev, therapistId];
        setSelectAll(newSelected.length === filteredTherapists.length);
        return newSelected;
      }
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedTherapists.length === 0) {
      setToast({
        show: true,
        message: 'Please select therapists to delete',
        type: 'error'
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedTherapists.length} selected therapists? This action cannot be undone.`)) {
      try {
        const result = await deleteMultipleTherapists(selectedTherapists);
        if (result.success) {
          setTherapists(prev => prev.filter(therapist => !selectedTherapists.includes(therapist.id)));
          setSelectedTherapists([]);
          setSelectAll(false);
          setToast({
            show: true,
            message: result.message,
            type: 'success'
          });
        } else {
          setToast({
            show: true,
            message: result.error || 'Failed to delete therapists',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error deleting therapists:', error);
        setToast({
          show: true,
          message: 'Failed to delete therapists',
          type: 'error'
        });
      }
    }
  };

  const handleToggleVerification = async (therapistId, currentStatus) => {
    try {
      const result = await updatePhysiotherapistVerification(therapistId, !currentStatus);
      if (result.success) {
        setTherapists(prev => prev.map(therapist => 
          therapist.id === therapistId 
            ? { ...therapist, isVerified: !currentStatus }
            : therapist
        ));
        setToast({
          show: true,
          message: `Therapist ${!currentStatus ? 'verified' : 'unverified'} successfully`,
          type: 'success'
        });
      } else {
        setToast({
          show: true,
          message: result.error || 'Failed to update verification status',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      setToast({
        show: true,
        message: 'Failed to update verification status',
        type: 'error'
      });
    }
  };

  const handleToggleAvailability = async (therapistId, currentStatus) => {
    try {
      console.log('Toggling availability for therapist:', therapistId, 'from', currentStatus, 'to', !currentStatus);
      const result = await updatePhysiotherapistAvailability(therapistId, !currentStatus);
      console.log('Availability update result:', result);
      
      if (result.success) {
        setTherapists(prev => prev.map(therapist => 
          therapist.id === therapistId 
            ? { ...therapist, isAvailable: !currentStatus }
            : therapist
        ));
        setToast({
          show: true,
          message: `Therapist ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
          type: 'success'
        });
      } else {
        setToast({
          show: true,
          message: result.error || 'Failed to update availability status',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      setToast({
        show: true,
        message: 'Failed to update availability status',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <SkeletonLoader className="h-8 w-48" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <SkeletonLoader key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
                 <div className="flex justify-between items-center">
           <div>
             <h1 className="text-2xl font-bold text-gray-900">All Therapists</h1>
             <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
               <span className="flex items-center">
                 <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                 {therapists.filter(t => t.isVerified).length} Verified
               </span>
               <span className="flex items-center">
                 <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                 {therapists.filter(t => !t.isVerified).length} Unverified
               </span>
               <span className="flex items-center">
                 <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                 {therapists.filter(t => t.isAvailable).length} Available
               </span>
               <span className="flex items-center">
                 <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                 {therapists.filter(t => !t.isAvailable).length} Unavailable
               </span>
             </div>
           </div>
           <div className="flex items-center space-x-4">
            {selectedTherapists.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const unverifiedTherapists = selectedTherapists.filter(id => {
                      const therapist = therapists.find(t => t.id === id);
                      return therapist && !therapist.isVerified;
                    });
                    if (unverifiedTherapists.length > 0) {
                      if (window.confirm(`Verify ${unverifiedTherapists.length} unverified therapists?`)) {
                        unverifiedTherapists.forEach(id => {
                          const therapist = therapists.find(t => t.id === id);
                          if (therapist) {
                            handleToggleVerification(id, therapist.isVerified);
                          }
                        });
                      }
                    } else {
                      setToast({
                        show: true,
                        message: 'All selected therapists are already verified',
                        type: 'info'
                      });
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Verify Selected ({selectedTherapists.length})
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedTherapists.length})
                </button>
              </div>
            )}
                         <div className="text-sm text-gray-600">
               {filteredTherapists.length} of {therapists.length} therapists
             </div>
             {therapists.filter(t => !t.isVerified).length > 0 && (
               <button
                 onClick={() => {
                   const unverifiedTherapists = therapists.filter(t => !t.isVerified);
                   if (window.confirm(`Verify all ${unverifiedTherapists.length} unverified therapists?`)) {
                     unverifiedTherapists.forEach(therapist => {
                       handleToggleVerification(therapist.id, therapist.isVerified);
                     });
                   }
                 }}
                 className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
               >
                 <ShieldCheck className="h-3 w-3 mr-1" />
                 Verify All ({therapists.filter(t => !t.isVerified).length})
               </button>
             )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search therapists by name, email, or CORU registration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                                 <option value="all">All Status</option>
                 <option value="verified">Verified</option>
                 <option value="unverified">Unverified</option>
                 <option value="available">Available</option>
                 <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Therapists Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="ml-2">Select All</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Therapist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact & Registration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specializations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
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
                {filteredTherapists.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No therapists found
                    </td>
                  </tr>
                ) : (
                  filteredTherapists.map((therapist) => (
                    <tr key={therapist.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTherapists.includes(therapist.id)}
                          onChange={() => handleSelectTherapist(therapist.id)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center">
                           <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                             therapist.isVerified ? 'bg-green-500' : 'bg-yellow-500'
                           }`}>
                             <span className="text-white font-medium">
                               {therapist.name.split(' ').map(n => n[0]).join('')}
                             </span>
                           </div>
                           <div className="ml-4">
                             <div className="text-sm font-medium text-gray-900 flex items-center">
                               {therapist.name}
                               {therapist.isVerified && (
                                 <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                   ✓ Verified
                                 </span>
                               )}
                             </div>
                             <div className="text-sm text-gray-500">
                               {therapist.yearsExperience ? `${therapist.yearsExperience} years exp.` : 'Experience not specified'}
                             </div>
                           </div>
                         </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{therapist.email}</div>
                        <div className="text-sm text-gray-500">
                          {therapist.coruRegistration ? `CORU: ${therapist.coruRegistration}` : 'No CORU registration'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {therapist.specializations.length > 0 ? (
                            therapist.specializations.slice(0, 2).map((spec, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {spec}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No specializations</span>
                          )}
                          {therapist.specializations.length > 2 && (
                            <span className="text-xs text-gray-500">+{therapist.specializations.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{therapist.totalBookings} bookings</div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          {therapist.avgRating > 0 ? therapist.avgRating.toFixed(1) : 'No ratings'}
                          {therapist.totalReviews > 0 && ` (${therapist.totalReviews})`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                                                     <div className="flex items-center space-x-2">
                             <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                               therapist.isVerified 
                                 ? 'bg-green-100 text-green-800' 
                                 : 'bg-yellow-100 text-yellow-800'
                             }`}>
                               {therapist.isVerified ? '✓ Verified' : '⚠ Unverified'}
                             </span>
                             <button
                               onClick={() => handleToggleVerification(therapist.id, therapist.isVerified)}
                               className={`p-1.5 rounded-full transition-all duration-200 ${
                                 therapist.isVerified 
                                   ? 'text-green-600 hover:text-green-800 hover:bg-green-50 hover:scale-110' 
                                   : 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 hover:scale-110'
                               }`}
                               title={therapist.isVerified ? 'Click to unverify' : 'Click to verify'}
                             >
                               {therapist.isVerified ? <ShieldCheck className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                             </button>
                           </div>
                                                     <div className="flex items-center space-x-2">
                             <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                               therapist.isAvailable 
                                 ? 'bg-green-100 text-green-800' 
                                 : 'bg-red-100 text-red-800'
                             }`}>
                               {therapist.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                             </span>
                             <button
                               onClick={() => handleToggleAvailability(therapist.id, therapist.isAvailable)}
                               className={`p-1.5 rounded-full transition-all duration-200 ${
                                 therapist.isAvailable 
                                   ? 'text-green-600 hover:text-green-800 hover:bg-green-50 hover:scale-110' 
                                   : 'text-red-600 hover:text-red-800 hover:bg-red-50 hover:scale-110'
                               }`}
                               title={therapist.isAvailable ? 'Click to deactivate' : 'Click to activate'}
                             >
                               {therapist.isAvailable ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                             </button>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setViewModal({ show: true, therapist })}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Therapist Modal */}
      {viewModal.show && viewModal.therapist && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setViewModal({ show: false, therapist: null })} />
            <div className="relative bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Therapist Details</h3>
                <button
                  onClick={() => setViewModal({ show: false, therapist: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-medium text-xl">
                      {viewModal.therapist.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{viewModal.therapist.name}</h4>
                    <p className="text-gray-600">
                      {viewModal.therapist.qualification || 'Qualification not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h5>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {viewModal.therapist.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {viewModal.therapist.phone || 'Not provided'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Professional Details</h5>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-500">CORU Registration</label>
                        <p className="text-sm text-gray-900">{viewModal.therapist.coruRegistration || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Years of Experience</label>
                        <p className="text-sm text-gray-900">{viewModal.therapist.yearsExperience || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Hourly Rate</label>
                        <p className="text-sm text-gray-900">
                          {viewModal.therapist.hourlyRate ? `€${viewModal.therapist.hourlyRate}/hour` : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Specializations</h5>
                  <div className="flex flex-wrap gap-2">
                    {viewModal.therapist.specializations.length > 0 ? (
                      viewModal.therapist.specializations.map((spec, index) => (
                        <span key={index} className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                          {spec}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No specializations listed</span>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Clinic Associations</h5>
                  <div className="space-y-2">
                    {viewModal.therapist.clinics.length > 0 ? (
                      viewModal.therapist.clinics.map((clinic, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{clinic.name}</p>
                              <p className="text-xs text-gray-500">{clinic.city?.name || 'Unknown City'}</p>
                            </div>
                          </div>
                          {clinic.isPrimary && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No clinic associations</p>
                    )}
                  </div>
                </div>

                {viewModal.therapist.bio && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Bio</h5>
                    <p className="text-sm text-gray-900">{viewModal.therapist.bio}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{viewModal.therapist.totalBookings}</div>
                    <div className="text-sm text-gray-600">Total Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{viewModal.therapist.completedBookings}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">€{viewModal.therapist.totalEarnings.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Total Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <Star className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="text-2xl font-bold text-gray-900">
                        {viewModal.therapist.avgRating > 0 ? viewModal.therapist.avgRating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </AdminDashboardLayout>
  );
};

export default AdminTherapistsPage;