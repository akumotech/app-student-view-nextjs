import { getUserServer } from "@/lib/getUserServer";
import { fetchAdminStats } from "@/app/admin/api/fetchAdminStats";
import { fetchUsers } from "@/app/admin/api/fetchUsers";
import AdminDashboardContents from "@/app/admin/components/AdminDashboardContents";
import AdminError from "@/app/admin/components/AdminError";
import { fetchBatches } from "./api/fetchBatches";
import type { UserOverview, BatchRead } from "./components/types";

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

  if (!stats || !users || !batches) {
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

  return <AdminDashboardContents stats={stats} users={users} batches={batches} />;
}
