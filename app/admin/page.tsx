import { getUserServer } from "@/lib/getUserServer";
import { fetchAdminStats } from "@/app/admin/api/fetchAdminStats";
import { fetchUsers } from "@/app/admin/api/fetchUsers";
import AdminDashboardContents from "@/app/admin/components/AdminDashboardContents";
import { fetchBatches } from "./api/fetchBatches";
import { fetchDemoSessions } from "./api/fetchDemoSessions";
import type { UserOverview, BatchRead } from "./components/types";
import { redirectToLoginWithAuth, redirectToLoginWithError } from "./utils/redirects";

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
    redirectToLoginWithAuth();
  }

  const stats = await fetchAdminStats();
  let users: UsersApiResponse | null | any = await fetchUsers();
  let batches: BatchRead[] | null = await fetchBatches();
  const sessions = await fetchDemoSessions(true, true);

  if (!stats || !users || !batches || !sessions) {
    redirectToLoginWithError("Failed to load admin data. Please try logging in again.");
    return; // This line will never be reached due to redirect, but helps TypeScript
  }

  // Ensure users is in the correct shape
  if (Array.isArray(users)) {
    users = { users, total_count: users.length, page: 1, page_size: users.length };
  } else if (!isUsersApiResponse(users)) {
    redirectToLoginWithError("Failed to load user data. Please try logging in again.");
    return;
  }
  // Ensure batches is always an array
  if (!Array.isArray(batches)) {
    redirectToLoginWithError("Failed to load batch data. Please try logging in again.");
    return;
  }

  // Sort sessions by date (newest first)
  const sortedSessions = sessions.sort(
    (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime(),
  );

  return <AdminDashboardContents stats={stats} users={users} batches={batches} />;
}
