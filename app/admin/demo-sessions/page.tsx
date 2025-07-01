import { getUserServer } from "@/lib/getUserServer";
import { fetchDemoSessions } from "../api/fetchDemoSessions";
import DemoSessionsClient from "./DemoSessionsClient";
import { redirectToLoginWithAuth, redirectToLoginWithError } from "../utils/redirects";

export default async function DemoSessionsPage() {
  const { user, isAuthenticated } = await getUserServer();
  if (!isAuthenticated || !user || user.role !== "admin") {
    redirectToLoginWithAuth();
  }

  const sessions = await fetchDemoSessions(true, true);

  if (!sessions) {
    redirectToLoginWithError("Failed to load demo sessions data. Please try logging in again.");
    return;
  }

  // Sort sessions by date (newest first)
  const sortedSessions = sessions.sort(
    (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime(),
  );

  return <DemoSessionsClient initialSessions={sortedSessions} />;
}
