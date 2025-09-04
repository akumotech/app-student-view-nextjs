"use server";
import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";
import type {
  OverviewStats,
  TrendsStats,
  EngagementStats,
  CodingActivityStats,
  AnalyticsDashboardData,
} from "../components/types";

async function makeAuthenticatedRequest(endpoint: string): Promise<any | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const res = await fetch(endpoint, {
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
      console.error(`[${endpoint}] Non-OK response:`, res.status, body);
      return null;
    }

    const result = await res.json();
    return result.data || result;
  } catch (error) {
    console.error(`[${endpoint}] Error:`, error);
    return null;
  }
}

export async function fetchOverviewStats(batchId?: number): Promise<OverviewStats | null> {
  const url = makeUrl("adminOverview") + (batchId ? `?batch_id=${batchId}` : "");
  return makeAuthenticatedRequest(url);
}

export async function fetchTrendsStats(batchId?: number): Promise<TrendsStats | null> {
  const url = makeUrl("adminTrends") + (batchId ? `?batch_id=${batchId}` : "");
  return makeAuthenticatedRequest(url);
}

export async function fetchEngagementStats(batchId?: number): Promise<EngagementStats | null> {
  const url = makeUrl("adminEngagement") + (batchId ? `?batch_id=${batchId}` : "");
  return makeAuthenticatedRequest(url);
}

export async function fetchCodingActivityStats(
  batchId?: number,
): Promise<CodingActivityStats | null> {
  const url = makeUrl("adminCodingActivity") + (batchId ? `?batch_id=${batchId}` : "");
  return makeAuthenticatedRequest(url);
}

export async function fetchAllAnalytics(batchId?: number): Promise<AnalyticsDashboardData | null> {
  try {
    const [overview, trends, engagement, codingActivity] = await Promise.all([
      fetchOverviewStats(batchId),
      fetchTrendsStats(batchId),
      fetchEngagementStats(batchId),
      fetchCodingActivityStats(batchId),
    ]);

    // Return null if any critical data is missing
    if (!overview || !trends || !engagement || !codingActivity) {
      console.error("[fetchAllAnalytics] Some analytics data failed to load");
      return null;
    }

    return {
      overview,
      trends,
      engagement,
      codingActivity,
    };
  } catch (error) {
    console.error("[fetchAllAnalytics] Error:", error);
    return null;
  }
}
