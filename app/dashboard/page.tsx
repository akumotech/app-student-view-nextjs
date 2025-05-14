"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Suspense } from "react";
import Dashboard from "./dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [hasWakaTimeAuth, setHasWakaTimeAuth] = useState<boolean>(false);
  const [userData, setUserData] = useState<{
    email: string;
    wakatime_access_token_encrypted: string | null;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const checkWakaTimeAuthStatus = async () => {
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
          if (userResponse.status === 401 || userResponse.status === 403) {
            logout();
            return;
          }
          throw new Error(
            `Failed to fetch user data. Status: ${userResponse.status}`
          );
        }

        const userData: {
          email: string;
          wakatime_access_token_encrypted: string | null;
        } = await userResponse.json();

        setUserData(userData);
        setHasWakaTimeAuth(!!userData.wakatime_access_token_encrypted);
      } catch (error) {
        console.error("Error checking WakaTime auth status:", error);
      }
    };

    if (isAuthenticated) {
      checkWakaTimeAuthStatus();
    }
  }, [isAuthenticated, logout]);

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
    console.log("init oauth");
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
      const token = localStorage.getItem("authToken") || "";

      if (!userData || !userData.email) {
        throw new Error("Missing user email for WakaTime authorization");
      }

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

      const url = await wakatimeResponse.json();
      window.location.href = url;
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
            <div className="flex space-x-2">
              {!hasWakaTimeAuth && (
                <Button onClick={handleWakaTimeAuth} variant="outline">
                  WakaTime Auth
                </Button>
              )}
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <Dashboard />
        </main>
      </div>
    </Suspense>
  );
}
