import { getUserServer } from "@/lib/getUserServer";
import { fetchCertificates } from "@/app/dashboard/certificates/api/fetchCertificates";
import CertificatesList from "@/app/dashboard/certificates/components/CertificatesList";
import CertificatesError from "@/app/dashboard/certificates/components/CertificatesError";

export default async function CertificatesPage() {
  const { user, isAuthenticated } = await getUserServer();
  if (!isAuthenticated || !user) {
    return <CertificatesError message="Not authenticated" />;
  }

  const certificates = await fetchCertificates();
  if (!certificates) {
    return <CertificatesError message="No certificates found." />;
  }

  return <CertificatesList certificates={certificates} />;
}
