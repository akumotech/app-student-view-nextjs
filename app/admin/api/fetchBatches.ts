import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";
import type { BatchRead } from "../components/types";

export async function fetchBatches(): Promise<BatchRead[] | null> {
  try {
    const url = makeUrl("adminBatches");
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
    if (!res.ok) return null;
    const data = await res.json();
    // If the API response is wrapped, unwrap it
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return null;
  } catch (e) {
    return null;
  }
}
