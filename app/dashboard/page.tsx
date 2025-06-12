"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Suspense } from "react";
import Dashboard from "./dashboard";
import { MainNav } from "@/components/dashboard-navbar";
import { makeUrl } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, logout, user, loading: authLoading } = useAuth();
  const [hasWakaTimeAuth, setHasWakaTimeAuth] = useState<boolean>(false);

  // State for WakaTime usage data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashboardUsageData, setDashboardUsageData] = useState<any | null>(
    null
  ); // TODO: Define a proper type for this data
  const [dashboardUsageError, setDashboardUsageError] = useState<string | null>(
    null
  );
  const [isLoadingUsageData, setIsLoadingUsageData] = useState<boolean>(false);

  useEffect(() => {
    // Only redirect if auth loading is complete and user is not authenticated
    if (!authLoading && !isAuthenticated) {
      console.log("Redirecting to login - user not authenticated");
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      setHasWakaTimeAuth(!!user.wakatime_access_token_encrypted);
    }
  }, [user]);

  // useEffect to fetch WakaTime usage data
  useEffect(() => {
    const fetchWakaTimeUsage = async () => {
      if (!isAuthenticated || !hasWakaTimeAuth || !user?.email) {
        setDashboardUsageData(null);
        setDashboardUsageError(null);
        return;
      }

      setIsLoadingUsageData(true);
      setDashboardUsageError(null);
      setDashboardUsageData(null);

      try {
        const response = await fetch(makeUrl("wakatimeUsage"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email: user.email }),
        });

        if (response.status === 404) {
          setDashboardUsageError(
            "No WakaTime data found for your account. Ensure WakaTime is tracking your activity and data has synced."
          );
          return;
        }

        if (response.status === 401 || response.status === 403) {
          toast.error(
            "Authentication error fetching WakaTime data. Please try logging out and in."
          );
          setDashboardUsageError("Authentication failed.");
          return;
        }

        if (!response.ok) {
          let errorDetail = `Failed to fetch WakaTime usage data (Status: ${response.status})`;
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.message || errorDetail;
          } catch (_parseError) {
            console.warn("JSON parsing error ignored:", _parseError);
          }
          throw new Error(errorDetail);
        }

        const result = await response.json();
        setDashboardUsageData(result);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error fetching WakaTime usage data:", error);
        setDashboardUsageError(
          error.message ||
            "An unexpected error occurred while fetching WakaTime usage data."
        );
      } finally {
        setIsLoadingUsageData(false);
      }
    };

    if (isAuthenticated && hasWakaTimeAuth) {
      fetchWakaTimeUsage();
    }
  }, [isAuthenticated, hasWakaTimeAuth, user, logout]);

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
    if (!user || !user.email) {
      toast.error("User information not available. Please try again.");
      return;
    }
    try {
      const url =
        makeUrl("wakatimeAuthorize") +
        `?email=${encodeURIComponent(user.email)}`;
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
      if (typeof responseData.redirect_url === "string") {
        window.location.href = responseData.redirect_url;
      } else if (typeof responseData === "string") {
        window.location.href = responseData;
      } else {
        throw new Error("Invalid WakaTime authorization URL received.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error initiating WakaTime authorization:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to connect to WakaTime"
      );
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Suspense>
      <div className="min-h-screen bg-muted/40">
        <header className="bg-background shadow">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Dashboard
              </h1>
              <MainNav />
            </div>
            <div className="flex space-x-2">
              {!hasWakaTimeAuth && (
                <Button
                  onClick={handleWakaTimeAuth}
                  variant="outline"
                  size="sm"
                >
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
          {!hasWakaTimeAuth && isAuthenticated && (
            <p
              className="p-4 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg dark:bg-gray-800 dark:text-blue-400"
              role="alert"
            >
              Please connect your WakaTime account using the &apos;Connect
              WakaTime&apos; button above to see your coding activity.
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
            !isLoadingUsageData &&
            !dashboardUsageError &&
            dashboardUsageData && <Dashboard data={dashboardUsageData} />}

          {hasWakaTimeAuth &&
            !isLoadingUsageData &&
            !dashboardUsageError &&
            !dashboardUsageData && (
              <p className="text-center text-gray-500">
                No WakaTime data to display. Your data might still be syncing or
                none available for the selected period.
              </p>
            )}
        </main>
      </div>
    </Suspense>
  );
}
