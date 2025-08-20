import { requireAuth, checkUserRole } from "../../lib/auth";
import { getAllPhysiotherapistProfilesForAdmin } from "../../lib/actions/physiotherapist";
import TherapistManagement from "./components/TherapistManagement";

// Force dynamic rendering since this page uses authentication
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await checkUserRole(["Admin"]);
  const therapistsResult = await getAllPhysiotherapistProfilesForAdmin();

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-8">
        <TherapistManagement 
          therapists={therapistsResult.success ? therapistsResult.data : []}
          error={therapistsResult.success ? null : therapistsResult.error}
        />
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Bookings Monitoring</h2>
          <div className="text-gray-500">Bookings monitoring UI coming soon...</div>
        </section>
      </div>
    </div>
  );
}
