import { requireAuth, checkUserRole } from "../../lib/auth";
import { getAllPhysiotherapistProfilesForAdmin } from "../../lib/actions/physiotherapist";
import { getAllUsersForAdmin, getUserCount, getTherapistCount } from "../../lib/actions/user";
import AdminDashboardClient from "./components/AdminDashboardClient";

// Force dynamic rendering since this page uses authentication
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await checkUserRole(["Admin"]);
  
  // Fetch all data
  const therapistsResult = await getAllPhysiotherapistProfilesForAdmin();
  const usersResult = await getAllUsersForAdmin();
  const userCountResult = await getUserCount();
  const therapistCountResult = await getTherapistCount();

  const userCount = userCountResult.success ? userCountResult.data : 0;
  const therapistCount = therapistCountResult.success ? therapistCountResult.data : 0;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd className="text-lg font-medium text-gray-900">{userCount}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Therapists</dt>
                <dd className="text-lg font-medium text-gray-900">{therapistCount}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {usersResult.success ? usersResult.data.filter(u => u.isActive).length : 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Verified Therapists</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {therapistsResult.success ? therapistsResult.data.filter(t => t.isVerified).length : 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <AdminDashboardClient 
        therapists={therapistsResult.success ? therapistsResult.data : []}
        therapistsError={therapistsResult.success ? null : therapistsResult.error}
        users={usersResult.success ? usersResult.data : []}
        usersError={usersResult.success ? null : usersResult.error}
      />
    </div>
  );
}
