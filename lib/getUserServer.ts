"use server";
import { cookies } from "next/headers";
import { User } from "@/lib/auth-context";
import { makeUrl } from "@/lib/utils";

export async function getUserServer(): Promise<{
  user: User | null;
  isAuthenticated: boolean;
}> {
  const url = makeUrl("usersMe");
  console.log("[getUserServer] Fetching:", url);
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
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
    const user = await res.json();
    return { user, isAuthenticated: true };
  } catch (error) {
    console.error("[getUserServer] Error:", error);
    return { user: null, isAuthenticated: false };
  }
}
