import { getUserServer } from "@/lib/getUserServer";
import { fetchDashboardData } from "./api/fetchDashboardData";
import { fetchStudentStatus } from "@/app/dashboard/api/fetchStudentStatus";
import DashboardStats from "@/app/dashboard/components/DashboardStats";
import DashboardError from "@/app/dashboard/components/DashboardError";
import { MainNav } from "@/components/dashboard-navbar";

export default async function DashboardPage() {
  const { user, isAuthenticated } = await getUserServer();
  if (!isAuthenticated || !user) {
    return <DashboardError message="Not authenticated" />;
  }

  const isStudent = await fetchStudentStatus();
  if (!isStudent) {
    return <DashboardError message="You are not a student." />;
  }

  const dashboardData = await fetchDashboardData(user.email);
  if (!dashboardData) {
    return <DashboardError message="No WakaTime data found." />;
  }

  return (
    <div>
      <MainNav />
      <DashboardStats data={dashboardData} />
    </div>
  );
}
