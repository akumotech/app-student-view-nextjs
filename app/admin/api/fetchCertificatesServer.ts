"use server";
import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";

export interface Certificate {
  id: number;
  student_id: number;
  name: string;
  issuer?: string;
  date_issued?: string;
  date_expired?: string;
  description?: string;
}

export async function fetchCertificatesServer(
  studentId?: number,
  batchId?: number,
): Promise<Certificate[] | null> {
  const params = new URLSearchParams();
  if (studentId) params.append("student_id", studentId.toString());
  if (batchId) params.append("batch_id", batchId.toString());

  const url = `${makeUrl("adminCertificates")}${params.toString() ? `?${params.toString()}` : ""}`;

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[fetchCertificatesServer] Non-OK response:`, response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[fetchCertificatesServer] Error:", error);
    return null;
  }
}
