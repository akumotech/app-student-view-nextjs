"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { makeUrlWithParams } from "@/lib/utils";
import type { CertificateRead } from "@/lib/dashboard-types";

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

interface CertificateCreateUpdate {
  name: string;
  issuer: string;
  date_issued: string;
  date_expired?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
}

export async function createCertificate(
  studentId: number,
  certificateData: CertificateCreateUpdate,
): Promise<CertificateRead | null> {
  const url = makeUrlWithParams("/api/students/{student_id}/certificates", {
    student_id: studentId,
  });

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(certificateData),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[createCertificate] Non-OK response:`, res.status, body);
      return null;
    }

    const result = await res.json();
    revalidatePath("/dashboard/certificates");
    return result.data || result;
  } catch (error) {
    console.error("[createCertificate] Error:", error);
    return null;
  }
}

export async function updateCertificate(
  studentId: number,
  certificateId: number,
  certificateData: CertificateCreateUpdate,
): Promise<CertificateRead | null> {
  const url = makeUrlWithParams("/api/students/{student_id}/certificates/{certificate_id}", {
    student_id: studentId,
    certificate_id: certificateId,
  });

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(url, {
      method: "PUT",
      headers,
      credentials: "include",
      body: JSON.stringify(certificateData),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[updateCertificate] Non-OK response:`, res.status, body);
      return null;
    }

    const result = await res.json();
    revalidatePath("/dashboard/certificates");
    return result.data || result;
  } catch (error) {
    console.error("[updateCertificate] Error:", error);
    return null;
  }
}

export async function deleteCertificate(
  studentId: number,
  certificateId: number,
): Promise<boolean> {
  const url = makeUrlWithParams("/api/students/{student_id}/certificates/{certificate_id}", {
    student_id: studentId,
    certificate_id: certificateId,
  });

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(url, {
      method: "DELETE",
      headers,
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[deleteCertificate] Non-OK response:`, res.status, body);
      return false;
    }

    revalidatePath("/dashboard/certificates");
    return true;
  } catch (error) {
    console.error("[deleteCertificate] Error:", error);
    return false;
  }
}
