import { AuthProvider } from "@/lib/auth-context";
import { getUserServer } from "@/lib/getUserServer";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = await getUserServer();
  return (
    <AuthProvider initialUser={user} initialIsAuthenticated={isAuthenticated}>
      <section className="admin-layout">{children}</section>
    </AuthProvider>
  );
}
