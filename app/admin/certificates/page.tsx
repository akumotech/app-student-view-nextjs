import { getUserServer } from "@/lib/getUserServer";
import { fetchCertificatesServer } from "../api/fetchCertificatesServer";
import { fetchUsers } from "../api/fetchUsers";
import { fetchBatches } from "../api/fetchBatches";
import { redirectToLoginWithAuth, redirectToLoginWithError } from "../utils/redirects";
import CertificatesClient from "./CertificatesClient";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const { user, isAuthenticated } = await getUserServer();
  if (!isAuthenticated || !user || user.role !== "admin") {
    redirectToLoginWithAuth();
  }

  // Fetch initial data
  const [certificates, users, batches] = await Promise.all([
    fetchCertificatesServer(),
    fetchUsers(),
    fetchBatches(),
  ]);

  if (!certificates || !users || !batches) {
    redirectToLoginWithError("Failed to load certificates data. Please try logging in again.");
    return;
  }

  return (
    <CertificatesClient
      initialCertificates={certificates}
      initialUsers={users}
      initialBatches={batches}
    />
  );
}
