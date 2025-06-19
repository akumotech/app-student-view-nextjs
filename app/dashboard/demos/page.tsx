import { getUserServer } from "@/lib/getUserServer";
import { fetchDemos } from "@/app/dashboard/demos/api/fetchDemos";
import DemosList from "@/app/dashboard/demos/components/DemosList";
import DemosError from "@/app/dashboard/demos/components/DemosError";

export default async function DemosPage() {
  const { user, isAuthenticated } = await getUserServer();
  if (!isAuthenticated || !user) {
    return <DemosError message="Not authenticated" />;
  }

  const demos = await fetchDemos();
  if (!demos) {
    return <DemosError message="No demos found." />;
  }

  return <DemosList demos={demos} />;
}
