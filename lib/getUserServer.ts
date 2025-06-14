"use server";
import { cookies } from "next/headers";
import { User } from "@/lib/auth-context";
import { makeUrl } from "@/lib/utils";

export async function getUserServer(): Promise<{
  user: User | null;
  isAuthenticated: boolean;
}> {
  try {
    // Use absolute URL for SSR fetch
    const url = makeUrl("usersMe");
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies
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
      return { user: null, isAuthenticated: false };
    }
    const user = await res.json();
    return { user, isAuthenticated: true };
  } catch {
    return { user: null, isAuthenticated: false };
  }
}
