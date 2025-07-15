"use server";
import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";
import type { DashboardData } from "@/lib/dashboard-types";

function getDateRange() {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 6); // 6 days ago + today = 7 days total

  // Format dates as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  console.log("start", startDate);
  console.log("end", today);
  return {
    start: formatDate(startDate),
    end: formatDate(today),
  };
}

export async function fetchDashboardData(): Promise<DashboardData | null> {
  const url = makeUrl("wakatimeStatsRange");
  const { start, end } = getDateRange();

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
      body: JSON.stringify({ start, end }),
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
