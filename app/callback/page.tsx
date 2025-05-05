"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const CallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = localStorage.getItem("authToken") || "";

    if (token) {
      // ✅ Store the token (localStorage, cookie, or pass to your backend)
      localStorage.setItem("auth_token", token);

      // 🚀 Redirect to dashboard or wherever
      router.replace("/dashboard");
    } else {
      // 🔴 Handle error (no token)
      console.error("No token found");
      router.replace("/login?error=oauth_failed");
    }
  }, [searchParams, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Processing login...</p>
    </div>
  );
};

export default CallbackPage;
