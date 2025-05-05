"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

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

      // Make a GET request to the backend to get the WakaTime authorization URL
      const response = await fetch(
        `${baseUrl}/wakatime/authorize?email=abdul@gmail.com`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.log(error);
        throw new Error("Failed to get WakaTime authorization URL");
      }

      // Get the URL from the response
      const data = await response.json();

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Welcome back, {user?.name}!</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Email: {user?.email}</p>
                <p className="text-sm text-gray-500">
                  Account created: {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your application metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Total Applications: 0</p>
                <p className="text-sm text-gray-500">Active Monitors: 0</p>
                <p className="text-sm text-gray-500">Alerts: 0</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
