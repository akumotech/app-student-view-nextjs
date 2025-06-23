"use client";
import { MainNav } from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function DashboardHeader({ title }: { title: string }) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <header className="bg-background shadow">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <MainNav />
        </div>
        <Button onClick={handleLogout} variant="outline" size="sm">
          Logout
        </Button>
      </div>
    </header>
  );
}
