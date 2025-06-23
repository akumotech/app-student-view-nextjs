"use server";
import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";

export async function fetchAdminStats(): Promise<any | null> {
  const url = makeUrl("adminStats");
  console.log("[fetchAdminStats] Fetching:", url);
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
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
      console.error(`[fetchAdminStats] Non-OK response:`, res.status, body);
      return null;
    }
    const result = await res.json();
    return result.data || result;
  } catch (error) {
    console.error("[fetchAdminStats] Error:", error);
    return null;
  }
}
