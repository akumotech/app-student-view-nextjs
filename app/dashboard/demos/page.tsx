import { getUserServer } from "@/lib/getUserServer";
import { fetchDemos } from "@/app/dashboard/demos/api/fetchDemos";
import { fetchAvailableDemoSessions } from "@/app/dashboard/demos/api/fetchDemoSessions";
import { fetchMyDemoSignups } from "@/app/dashboard/demos/api/fetchMyDemoSignups";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DemosClientShell from "./DemosClientShell";

export default async function DemosPage() {
  const { user, isAuthenticated } = await getUserServer();
  if (!isAuthenticated || !user) {
    // Optionally render an error or redirect
    return null;
  }

  if (user.role !== "student") {
    return (
      <div className="min-h-screen bg-muted/40">
        <DashboardHeader title="Dashboard" />
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div
            className="p-4 mb-4 text-sm text-orange-700 bg-orange-100 rounded-lg dark:bg-gray-800 dark:text-orange-400"
            role="alert"
          >
            <span className="font-medium">Student Registration Required:</span> You need to be
            registered as a student to access certificates and demos. Please contact your instructor
            for a registration key.
          </div>
        </main>
      </div>
    );
  }

  // Fetch all data server-side
  const [demos, availableSessions, mySignups] = await Promise.all([
    fetchDemos(),
    fetchAvailableDemoSessions(),
    fetchMyDemoSignups(),
  ]);

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader title="Dashboard" />
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <DemosClientShell
          initialDemos={demos || []}
          initialSessions={availableSessions || []}
          initialSignups={mySignups || []}
          user={user}
        />
      </main>
    </div>
  );
}
