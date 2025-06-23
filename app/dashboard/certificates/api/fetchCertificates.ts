"use server";
import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";
import type { CertificateRead } from "@/lib/dashboard-types";

export async function fetchCertificates(): Promise<CertificateRead[] | null> {
  const url = makeUrl("studentsCertificates");
  console.log("[fetchCertificates] Fetching:", url);
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
      console.error(`[fetchCertificates] Non-OK response:`, res.status, body);
      return null;
    }
    const result = await res.json();
    return result.data || result;
  } catch (error) {
    console.error("[fetchCertificates] Error:", error);
    return null;
  }
}
