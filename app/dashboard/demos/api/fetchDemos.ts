"use server";
import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";
import type { DemoRead } from "@/lib/dashboard-types";

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

export async function fetchDemos(): Promise<DemoRead[] | null> {
  const url = makeUrl("studentsDemos");

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(url, {
      method: "GET",
      headers,
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
