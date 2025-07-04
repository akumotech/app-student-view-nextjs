"use server";
import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";

export async function fetchStudentStatus(): Promise<boolean> {
  const url = makeUrl("studentsCertificates");
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
    if (res.status === 403) {
      console.warn("[fetchStudentStatus] Forbidden (403)");
      return false;
    }
    if (!res.ok) {
      const body = await res.text();
      console.error(`[fetchStudentStatus] Non-OK response:`, res.status, body);
      return false;
    }
    return res.ok;
  } catch (error) {
    console.error("[fetchStudentStatus] Error:", error);
    return false;
  }
}
