import { getUserServer } from "@/lib/getUserServer";
import { fetchAdminStats } from "@/app/admin/api/fetchAdminStats";
import { fetchUsers } from "@/app/admin/api/fetchUsers";
import AdminDashboardContents from "@/app/admin/components/AdminDashboardContents";
import AdminError from "@/app/admin/components/AdminError";
import { fetchBatches } from "./api/fetchBatches";
import { fetchDemoSessions } from "./api/fetchDemoSessions";
import type { UserOverview, BatchRead } from "./components/types";
import AnalyticsTabs from "./components/AnalyticsTabs";
import DemoSessionsClient from "./demo-sessions/DemoSessionsClient";

interface UsersApiResponse {
  users: UserOverview[];
  total_count: number;
  page?: number;
  page_size?: number;
}

function isUsersApiResponse(obj: any): obj is UsersApiResponse {
  return obj && Array.isArray(obj.users) && typeof obj.total_count === "number";
}

export default async function AdminPage() {
  const { user, isAuthenticated } = await getUserServer();
  if (!isAuthenticated || !user || user.role !== "admin") {
    return <AdminError message="Not authorized" />;
  }

  const stats = await fetchAdminStats();
  let users: UsersApiResponse | null | any = await fetchUsers();
  let batches: BatchRead[] | null = await fetchBatches();
  const sessions = await fetchDemoSessions(true, true);

  if (!stats || !users || !batches || !sessions) {
    return <AdminError message="Failed to load admin data." />;
  }

  // Ensure users is in the correct shape
  if (Array.isArray(users)) {
    users = { users, total_count: users.length, page: 1, page_size: users.length };
  } else if (!isUsersApiResponse(users)) {
    return <AdminError message="Failed to load admin data." />;
  }
  // Ensure batches is always an array
  if (!Array.isArray(batches)) {
    return <AdminError message="Failed to load admin data." />;
  }

  // Sort sessions by date (newest first)
  const sortedSessions = sessions.sort(
    (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime(),
  );

  return (
    <>
      <AdminDashboardContents stats={stats} users={users} batches={batches} />
      <section className="mt-8">
        <DemoSessionsClient initialSessions={sortedSessions} />
      </section>
      <section className="mt-8">
        <AnalyticsTabs batches={batches} />
      </section>
    </>
  );
}
