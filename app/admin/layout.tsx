import { AuthProvider } from "@/lib/auth-context";
import { getUserServer } from "@/lib/getUserServer";
import AdminSidebar from "./components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = await getUserServer();
  return (
    <AuthProvider initialUser={user} initialIsAuthenticated={isAuthenticated}>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 overflow-auto">
          <div className="p-6 lg:p-8 pt-16 lg:pt-6">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
