"use server";
import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";
import type { DemoRead } from "@/lib/dashboard-types";

export async function fetchDemos(): Promise<DemoRead[] | null> {
  const url = makeUrl("studentsDemos");
  console.log("[fetchDemos] Fetching:", url);
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
      console.error(`[fetchDemos] Non-OK response:`, res.status, body);
      return null;
    }
    const result = await res.json();
    return result.data || result;
  } catch (error) {
    console.error("[fetchDemos] Error:", error);
    return null;
  }
}
