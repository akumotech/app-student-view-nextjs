import { getUserServer } from "@/lib/getUserServer";
import { fetchCertificates } from "@/app/dashboard/certificates/api/fetchCertificates";
import CertificatesList from "@/app/dashboard/certificates/components/CertificatesList";
import CertificatesError from "@/app/dashboard/certificates/components/CertificatesError";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function CertificatesPage() {
  const { user, isAuthenticated } = await getUserServer();
  if (!isAuthenticated || !user) {
    return <CertificatesError message="Not authenticated" />;
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

  const certificates = await fetchCertificates();
  if (!certificates) {
    return <CertificatesError message="No certificates found." />;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader title="Dashboard" />
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <CertificatesList certificates={certificates} user={user} />
      </main>
    </div>
  );
}
