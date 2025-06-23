"use server";
import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";
import type { DashboardData } from "@/lib/dashboard-types";

export async function fetchDashboardData(email: string): Promise<DashboardData | null> {
  const url = makeUrl("wakatimeUsage");
  console.log("[fetchDashboardData] Fetching:", url, "for email:", email);
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      credentials: "include",
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[fetchDashboardData] Non-OK response:`, res.status, body);
      return null;
    }
    const result = await res.json();
    return result.data || result;
  } catch (error) {
    console.error("[fetchDashboardData] Error:", error);
    return null;
  }
}
