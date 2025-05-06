"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { Suspense } from "react";
import Dashboard from "./dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const handleWakaTimeAuth = async () => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
      const token = localStorage.getItem("authToken") || "";

      const userResponse = await fetch(`${baseUrl}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData: {
        disabled: boolean;
        password: string;
        name: string;
        id: number;
        email: string;
        wakatime_access_token_encrypted: string | null;
      } = await userResponse.json();

      // Fetch WakaTime authorization URL
      const wakatimeResponse = await fetch(
        `${baseUrl}/wakatime/authorize?email=${encodeURIComponent(userData.email)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!wakatimeResponse.ok) {
        const error = await wakatimeResponse.json();
        console.log(error);
        throw new Error("Failed to get WakaTime authorization URL");
      }

      // Get the URL from the wakatimeResponse
      const data = await wakatimeResponse.json();

      // Redirect the user to the WakaTime authorization URL
      window.location.href = data;
    } catch (error) {
      console.error("Error initiating WakaTime authorization:", error);
      toast.error("Failed to connect to WakaTime");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Suspense>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>
            <Button onClick={handleWakaTimeAuth} variant="outline">
              WakaTime Auth
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <Dashboard />
        </main>
      </div>
    </Suspense>
  );
}
