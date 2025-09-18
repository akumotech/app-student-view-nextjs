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

// Updated to handle both old and new response formats
function isUsersApiResponse(obj: any): obj is UsersApiResponse {
  // Handle new fetchUsers response format
  if (obj && Array.isArray(obj.users) && typeof obj.totalCount === "number") {
    return true;
  }
  // Handle legacy format
  return obj && Array.isArray(obj.users) && typeof obj.total_count === "number";
}

export default async function AdminPage() {
  const { user, isAuthenticated } = await getUserServer();
  if (!isAuthenticated || !user || user.role !== "admin") {
    redirectToLoginWithAuth();
  }

  // Fetch data with error handling
  const [stats, users, batches, sessions] = await Promise.allSettled([
    fetchAdminStats(),
    fetchUsers(),
    fetchBatches(),
    fetchDemoSessions(true, true),
  ]);

  // Add detailed logging for debugging production issues
  if (stats.status === "rejected") {
    console.error("[AdminPage] Failed to fetch admin stats:", stats.reason);
  }
  if (users.status === "rejected") {
    console.error("[AdminPage] Failed to fetch users:", users.reason);
  }
  if (batches.status === "rejected") {
    console.error("[AdminPage] Failed to fetch batches:", batches.reason);
  }
  if (sessions.status === "rejected") {
    console.error("[AdminPage] Failed to fetch demo sessions:", sessions.reason);
  }

  // Check if any critical data failed to load
  // For now, only redirect if user authentication data is the issue
  // Allow the dashboard to render with partial data and handle loading client-side
  if (stats.status === "rejected" && users.status === "rejected") {
    // Both stats and users failed - likely an authentication issue
    console.error("[AdminPage] Critical authentication failure, redirecting to login");
    redirectToLoginWithError("Failed to load admin data. Please try logging in again.");
    return; // This line will never be reached due to redirect, but helps TypeScript
  }

  // Extract successful values with fallbacks
  const statsData = stats.status === "fulfilled" ? stats.value : null;
  let usersData: UsersApiResponse | null | any = users.status === "fulfilled" ? users.value : null;
  const batchesData: BatchRead[] | null = batches.status === "fulfilled" ? batches.value : [];
  const sessionsData = sessions.status === "fulfilled" ? sessions.value : [];

  // Ensure users is in the correct shape
  console.log(
    "[AdminPage] Users data structure:",
    typeof usersData,
    usersData ? Object.keys(usersData) : "null",
  );

  if (Array.isArray(usersData)) {
    usersData = {
      users: usersData,
      total_count: usersData.length,
      page: 1,
      page_size: usersData.length,
    };
  } else if (usersData && usersData.totalCount !== undefined) {
    // Handle new fetchUsers response format - convert to expected format
    usersData = {
      users: usersData.users,
      total_count: usersData.totalCount,
      page: usersData.page,
      page_size: usersData.pageSize,
    };
  } else if (usersData && !isUsersApiResponse(usersData)) {
    console.error("[AdminPage] Invalid users data structure:", usersData);
    // Provide fallback instead of redirecting
    usersData = { users: [], total_count: 0, page: 1, page_size: 20 };
  } else if (!usersData) {
    // Provide fallback for null users data
    usersData = { users: [], total_count: 0, page: 1, page_size: 20 };
  }

  // Ensure batches is always an array (already handled with fallback above)
  // No need to redirect for batches - just use the empty array fallback

  // Sort sessions by date (newest first)
  const sortedSessions = sessionsData
    ? sessionsData.sort(
        (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime(),
      )
    : [];

  return <AdminDashboardContents stats={statsData} users={usersData} batches={batchesData || []} />;
}
