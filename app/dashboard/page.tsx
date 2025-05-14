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

        const fetchedUserData: {
          email: string;
          wakatime_access_token_encrypted: string | null;
        } = await userResponse.json();

        setUserData(fetchedUserData);
        setHasWakaTimeAuth(!!fetchedUserData.wakatime_access_token_encrypted);
      } catch (error) {
        console.error("Error checking WakaTime auth status:", error);
        toast.error("Failed to verify WakaTime status."); // Optionally inform user
      }
    };

    if (isAuthenticated) {
      checkWakaTimeAuthStatus();
    }
  }, [isAuthenticated, logout]);

  // useEffect to fetch WakaTime usage data
  useEffect(() => {
    const fetchWakaTimeUsage = async () => {
      if (!isAuthenticated || !hasWakaTimeAuth || !userData?.email) {
        setDashboardUsageData(null);
        setDashboardUsageError(null);
        return;
      }

      setIsLoadingUsageData(true);
      setDashboardUsageError(null);
      setDashboardUsageData(null);

      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
        const token = localStorage.getItem("authToken") || "";
        const userEmail = userData.email;

        const response = await fetch(`${baseUrl}/wakatime/usage`, {
          method: "POST", // As per your attempt
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        });

        if (response.status === 404) {
          setDashboardUsageError(
            "No WakaTime data found for your account. Ensure WakaTime is tracking your activity and data has synced."
          );
          return;
        }

        if (!response.ok) {
          let errorDetail = `Failed to fetch WakaTime usage data (Status: ${response.status})`;
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.message || errorDetail;
          } catch (parseError) {
            console.log(parseError);
            // If parsing the error response fails, stick with the original errorDetail based on status
            // console.warn("Could not parse error response:", parseError);
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

    fetchWakaTimeUsage();
  }, [isAuthenticated, hasWakaTimeAuth, userData]);

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
          {!hasWakaTimeAuth && isAuthenticated && (
            <p
              className="p-4 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg dark:bg-gray-800 dark:text-blue-400"
              role="alert"
            >
              Please connect your WakaTime account using the &apos;WakaTime
              Auth&apos; button above to see your coding activity.
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
              <p
                className="p-4 text-sm text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-300"
                role="alert"
              >
                WakaTime is connected. We are either waiting for your first data
                sync or there&apos;s no coding activity to display yet.
              </p>
            )}
        </main>
      </div>
    </Suspense>
  );
}
