'use client';

import { useState } from 'react';
import TherapistManagement from './TherapistManagement';
import UserManagement from './UserManagement';

export default function AdminDashboardClient({ therapists, therapistsError, users, usersError }) {
  const [activeTab, setActiveTab] = useState('therapists');

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('therapists')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'therapists'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              View All Therapists ({therapists.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              View All Users ({users.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'therapists' && (
            <TherapistManagement 
              therapists={therapists}
              error={therapistsError}
            />
          )}
          {activeTab === 'users' && (
            <UserManagement 
              users={users}
              error={usersError}
            />
          )}
        </div>
      </div>

      {/* Bookings Monitoring Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Bookings Monitoring</h2>
        <div className="text-gray-500">Bookings monitoring UI coming soon...</div>
      </section>
    </div>
  );
}