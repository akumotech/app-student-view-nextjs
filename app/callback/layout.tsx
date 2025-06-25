import { Suspense } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { getUserServer } from "@/lib/getUserServer";

export default async function CallbackLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isAuthenticated } = await getUserServer();

  return (
    <AuthProvider initialUser={user} initialIsAuthenticated={isAuthenticated}>
      <Suspense>{children}</Suspense>
    </AuthProvider>
  );
}
