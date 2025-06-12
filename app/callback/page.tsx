"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { makeUrl } from "@/lib/utils";

const CallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      console.error("User not authenticated during OAuth callback.");
      toast.error("Authentication required. Please login to continue.");
      router.replace("/login?error=auth_required_for_oauth");
      return;
    }

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      console.error("No code found in query params for OAuth callback.");
      toast.error("WakaTime connection failed: Missing authorization code.");
      router.replace("/dashboard?error=wakatime_oauth_failed_no_code");
      return;
    }

    const handleOAuthCallback = async () => {
      try {
        const response = await fetch(makeUrl("wakatimeCallback"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            code,
            state,
          }),
        });

        if (!response.ok) {
          let errorMessage = "WakaTime connection failed. Please try again.";
          try {
            const errorData = await response.json();
            errorMessage =
              errorData.message || errorData.detail || errorMessage;
          } catch (_e) {
            console.log(_e);
            // Ignore if error response is not JSON
          }
          console.error("OAuth callback failed to backend:", errorMessage);
          toast.error(errorMessage);
          router.replace(`/dashboard?error=wakatime_oauth_backend_failed`);
          return;
        }

        toast.success("WakaTime connected successfully!");
        router.replace("/dashboard?success=wakatime_connected");
      } catch (error) {
        console.error("Error during OAuth callback processing:", error);
        toast.error("An unexpected error occurred while connecting WakaTime.");
        router.replace("/dashboard?error=wakatime_oauth_exception");
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, isAuthenticated, authLoading]);

  return (
    <div className="flex justify-center items-center h-screen">
      {authLoading ? (
        <p>Verifying authentication...</p>
      ) : (
        <p>Processing WakaTime connection...</p>
      )}
    </div>
  );
};

export default CallbackPage;
