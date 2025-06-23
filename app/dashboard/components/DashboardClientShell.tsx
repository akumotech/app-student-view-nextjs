"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Dashboard from "../dashboard";
import { MainNav } from "@/components/dashboard-navbar";
import { makeUrl } from "@/lib/utils";

export default function DashboardClientShell({
  user,
  isStudent: initialIsStudent,
  hasWakaTimeAuth: initialHasWakaTimeAuth,
  dashboardData: initialDashboardData,
}: {
  user: any;
  isStudent: boolean;
  hasWakaTimeAuth: boolean;
  dashboardData: any;
}) {
  const router = useRouter();
  const [hasWakaTimeAuth, setHasWakaTimeAuth] = useState(initialHasWakaTimeAuth);
  const [isStudent, setIsStudent] = useState(initialIsStudent);
  const [dashboardUsageData, setDashboardUsageData] = useState(initialDashboardData);
  const [dashboardUsageError, setDashboardUsageError] = useState<string | null>(null);
  const [isLoadingUsageData, setIsLoadingUsageData] = useState(false);

  // Optionally, add logic to re-fetch dashboard data if user connects WakaTime

  const handleLogout = async () => {
    try {
      // If you have a logout function in context, use it here
      // await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const handleWakaTimeAuth = async () => {
    if (!user || !user.email) {
      toast.error("User information not available. Please try again.");
      return;
    }
    try {
      const url = makeUrl("wakatimeAuthorize") + `?email=${encodeURIComponent(user.email)}`;
      const wakatimeResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!wakatimeResponse.ok) {
        let errorDetail = "Failed to get WakaTime authorization URL";
        try {
          const error = await wakatimeResponse.json();
          errorDetail = error.detail || error.message || errorDetail;
        } catch (_e) {
          console.warn("JSON parsing error ignored for WakaTime auth URL:", _e);
        }
        throw new Error(errorDetail);
      }

      const responseData = await wakatimeResponse.json();
      if (responseData?.data?.authorization_url) {
        window.location.href = responseData.data.authorization_url;
      } else if (typeof responseData.redirect_url === "string") {
        window.location.href = responseData.redirect_url;
      } else if (typeof responseData === "string") {
        window.location.href = responseData;
      } else {
        throw new Error("Invalid WakaTime authorization URL received.");
      }
    } catch (error: any) {
      console.error("Error initiating WakaTime authorization:", error);
      toast.error(error instanceof Error ? error.message : "Failed to connect to WakaTime");
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <MainNav />
          </div>
          <div className="flex space-x-2">
            {!hasWakaTimeAuth && (
              <Button onClick={handleWakaTimeAuth} variant="outline" size="sm">
                Connect WakaTime
              </Button>
            )}
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        {isStudent === false && (
          <div
            className="p-4 mb-4 text-sm text-orange-700 bg-orange-100 rounded-lg dark:bg-gray-800 dark:text-orange-400"
            role="alert"
          >
            <span className="font-medium">Student Registration Required:</span> You need to be
            registered as a student to access certificates and demos. Please contact your instructor
            for a registration key.
          </div>
        )}

        {!hasWakaTimeAuth && isStudent && (
          <p
            className="p-4 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg dark:bg-gray-800 dark:text-blue-400"
            role="alert"
          >
            Please connect your WakaTime account using the &apos;Connect WakaTime&apos; button above
            to see your coding activity.
          </p>
        )}

        {isLoadingUsageData && <p>Loading WakaTime dashboard data...</p>}

        {dashboardUsageError && !isLoadingUsageData && (
          <div
            className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
            role="alert"
          >
            <span className="font-medium">Error:</span> {dashboardUsageError}
          </div>
        )}

        {hasWakaTimeAuth &&
          isStudent &&
          !isLoadingUsageData &&
          !dashboardUsageError &&
          dashboardUsageData && <Dashboard data={dashboardUsageData} />}

        {hasWakaTimeAuth &&
          isStudent &&
          !isLoadingUsageData &&
          !dashboardUsageError &&
          !dashboardUsageData && (
            <p className="text-center text-gray-500">
              No WakaTime data to display. Your data might still be syncing or none available for
              the selected period.
            </p>
          )}

        {isStudent === false && (
          <div className="text-center py-10 bg-muted rounded-lg">
            <h3 className="text-lg font-medium mb-2">Student Registration Required</h3>
            <p className="text-muted-foreground mb-4">
              To access student features like certificates and demos, you need to be registered as a
              student.
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact your instructor to get a registration key.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
