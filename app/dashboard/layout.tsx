import { AuthProvider } from "@/lib/auth-context";
import { getUserServer } from "@/lib/getUserServer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = await getUserServer();
  return (
    <AuthProvider initialUser={user} initialIsAuthenticated={isAuthenticated}>
      {children}
    </AuthProvider>
  );
}
