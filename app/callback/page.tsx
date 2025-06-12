"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { makeUrl } from "@/lib/utils";

const CallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUserOnMount } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessed = useRef(false);
  const currentCode = useRef<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      // Prevent duplicate processing
      if (hasProcessed.current || !code) {
        if (!code) {
          console.error("No code found in query params for OAuth callback.");
          toast.error(
            "WakaTime connection failed: Missing authorization code."
          );
          router.replace("/dashboard?error=wakatime_oauth_failed_no_code");
        }
        return;
      }

      // Check if we're processing the same code again
      if (currentCode.current === code) {
        console.log("Duplicate callback request detected, ignoring...");
        return;
      }

      // Mark as processing and store the current code
      hasProcessed.current = true;
      currentCode.current = code;

      console.log(
        "Processing WakaTime callback with code:",
        code.substring(0, 10) + "..."
      );

      try {
        // First, handle the WakaTime callback
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
          }
          console.error("OAuth callback failed to backend:", errorMessage);
          toast.error(errorMessage);
          router.replace(`/dashboard?error=wakatime_oauth_backend_failed`);
          return;
        }

        console.log("WakaTime callback successful, refreshing user state...");

        // After successful WakaTime callback, refresh the user's authentication state
        try {
          await fetchUserOnMount();
          toast.success("WakaTime connected successfully!");
          router.replace("/dashboard?success=wakatime_connected");
        } catch (error) {
          console.error("Error refreshing user state:", error);
          // Even if refresh fails, we still want to redirect to dashboard
          // since the WakaTime connection was successful
          router.replace("/dashboard?success=wakatime_connected");
        }
      } catch (error) {
        console.error("Error during OAuth callback processing:", error);
        toast.error("An unexpected error occurred while connecting WakaTime.");
        router.replace("/dashboard?error=wakatime_oauth_exception");
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, router, fetchUserOnMount]);

  return (
    <div className="flex justify-center items-center h-screen">
      {isProcessing ? (
        <p>Processing WakaTime connection...</p>
      ) : (
        <p>Redirecting to dashboard...</p>
      )}
    </div>
  );
};

export default CallbackPage;
