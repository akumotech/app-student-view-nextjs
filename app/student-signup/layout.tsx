import { AuthProvider } from "@/lib/auth-context";

export default function StudentSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider skipInitialFetch>{children}</AuthProvider>;
}
