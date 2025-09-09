"use server";
import { cookies } from "next/headers";
import { User } from "@/lib/auth-context";
import { makeUrl } from "@/lib/utils";

export async function getUserServer(): Promise<{
  user: User | null;
  isAuthenticated: boolean;
}> {
  // Check if we're in build context or static generation
  // During build time, cookies() is not available and will throw
  const isBuildTime = process.env.NODE_ENV === "production" && typeof window === "undefined";

  if (isBuildTime) {
    console.log("[getUserServer] Build-time context detected, returning null user");
    return { user: null, isAuthenticated: false };
  }

  const url = makeUrl("usersMe");
  console.log("[getUserServer] Fetching:", url);

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[getUserServer] Non-OK response:`, res.status, body);
      return { user: null, isAuthenticated: false };
    }
    const user = await res.json(); // Ensure we have a valid user object
    return { user, isAuthenticated: true };
  } catch (error) {
    console.error("[getUserServer] Error:", error);
    // If cookies() fails during static generation, return null gracefully
    if (error instanceof Error && error.message.includes("cookies")) {
      console.log("[getUserServer] Cookies not available (likely build-time), returning null user");
      return { user: null, isAuthenticated: false };
    }
    return { user: null, isAuthenticated: false };
  }
}
