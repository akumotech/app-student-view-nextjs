import { getUserServer } from "@/lib/getUserServer";
import { fetchDashboardData } from "./api/fetchDashboardData";
import { fetchStudentStatus } from "@/app/dashboard/api/fetchStudentStatus";
import DashboardClientShell from "./components/DashboardClientShell";

export default async function DashboardPage() {
  const { user, isAuthenticated } = await getUserServer();
  if (!isAuthenticated || !user) {
    // Optionally render a server error or redirect
    return null;
  }

  const isStudent = await fetchStudentStatus();
  let dashboardData = null;
  let hasWakaTimeAuth = false;

  if (user.wakatime_access_token_encrypted) {
    hasWakaTimeAuth = true;
    dashboardData = await fetchDashboardData();
  }

  return (
    <DashboardClientShell
      user={user}
      isStudent={isStudent}
      hasWakaTimeAuth={hasWakaTimeAuth}
      dashboardData={dashboardData}
    />
  );
}
