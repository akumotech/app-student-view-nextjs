import { AuthProvider } from "@/lib/auth-context";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider skipInitialFetch>{children}</AuthProvider>;
}
