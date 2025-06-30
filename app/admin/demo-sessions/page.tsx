import { getUserServer } from "@/lib/getUserServer";
import { fetchDemoSessions } from "../api/fetchDemoSessions";
import AdminError from "../components/AdminError";
import DemoSessionsClient from "./DemoSessionsClient";

export default async function DemoSessionsPage() {
  const { user, isAuthenticated } = await getUserServer();
  if (!isAuthenticated || !user || user.role !== "admin") {
    return <AdminError message="Not authorized" />;
  }

  const sessions = await fetchDemoSessions(true, true);

  if (!sessions) {
    return <AdminError message="Failed to load demo sessions data." />;
  }

  // Sort sessions by date (newest first)
  const sortedSessions = sessions.sort(
    (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime(),
  );

  return <DemoSessionsClient initialSessions={sortedSessions} />;
}
