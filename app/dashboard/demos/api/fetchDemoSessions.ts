"use server";
import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return {
    "Content-Type": "application/json",
    cookie: cookieHeader,
  };
}

export interface DemoSessionSummary {
  id: number;
  session_date: string;
  session_time: string;
  is_active: boolean;
  is_cancelled: boolean;
  max_scheduled: number;
  title?: string;
  signup_count: number;
  user_signed_up?: boolean;
  zoom_link?: string | null;
}

export async function fetchAvailableDemoSessions(): Promise<DemoSessionSummary[] | null> {
  const url = makeUrl("demoSessions");

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      // Handle 404 as empty array - no sessions available
      if (res.status === 404) {
        return [];
      }
      const body = await res.text();
      console.error(`[fetchAvailableDemoSessions] Non-OK response:`, res.status, body);
      return null;
    }

    const result = await res.json();
    return result.data || result;
  } catch (error) {
    console.error("[fetchAvailableDemoSessions] Error:", error);
    return null;
  }
}
