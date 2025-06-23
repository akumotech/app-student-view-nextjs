import { getUserServer } from "@/lib/getUserServer";
import { fetchDemos } from "@/app/dashboard/demos/api/fetchDemos";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DemosClientShell from "./DemosClientShell";

export default async function DemosPage() {
  const { user, isAuthenticated } = await getUserServer();
  if (!isAuthenticated || !user) {
    // Optionally render an error or redirect
    return null;
  }

  const demos = await fetchDemos();
  // Optionally handle error state if demos is null

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader title="Dashboard" />
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <DemosClientShell initialDemos={demos || []} user={user} />
      </main>
    </div>
  );
}
