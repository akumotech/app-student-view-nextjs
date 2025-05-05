"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const CallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No token found");
      router.replace("/login?error=oauth_failed");
      return;
    }

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      console.error("No code found in query params");
      router.replace("/login?error=oauth_failed");
      return;
    }

    const handleOAuthCallback = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/wakatime/callback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              code,
              state,
            }),
          }
        );
        console.log(response);

        if (!response.ok) {
          console.error("OAuth callback failed");
          router.replace("/login?error=oauth_failed");
          return;
        }

        console.log("OAuth callback successful");
        router.replace("/dashboard");
      } catch (error) {
        console.error("Error during OAuth callback:", error);
        router.replace("/login?error=oauth_failed");
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Processing OAuth callback...</p>
    </div>
  );
};

export default CallbackPage;
