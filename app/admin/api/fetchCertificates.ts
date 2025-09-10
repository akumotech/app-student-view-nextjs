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

export interface CertificateCreate {
  name: string;
  issuer?: string;
  date_issued?: string;
  date_expired?: string;
  description?: string;
}

export interface CertificateUpdate {
  name?: string;
  issuer?: string;
  date_issued?: string;
  date_expired?: string;
  description?: string;
}

export async function fetchCertificates(
  studentId?: number,
  batchId?: number,
): Promise<Certificate[] | null> {
  const params = new URLSearchParams();
  if (studentId) params.append("student_id", studentId.toString());
  if (batchId) params.append("batch_id", batchId.toString());

  const url = `${makeUrl("adminCertificates")}${params.toString() ? `?${params.toString()}` : ""}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[fetchCertificates] Non-OK response:`, response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[fetchCertificates] Error:", error);
    return null;
  }
}

export async function createCertificate(
  certificateData: CertificateCreate,
  studentId: number,
): Promise<Certificate | null> {
  const params = new URLSearchParams();
  params.append("student_id", studentId.toString());

  const url = `${makeUrl("adminCertificates")}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(certificateData),
    });

    if (!response.ok) {
      console.error(`[createCertificate] Non-OK response:`, response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[createCertificate] Error:", error);
    return null;
  }
}

export async function updateCertificate(
  certificateId: number,
  certificateData: CertificateUpdate,
): Promise<Certificate | null> {
  const url = makeUrl("adminCertificateById", { certificate_id: certificateId });

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(certificateData),
    });

    if (!response.ok) {
      console.error(`[updateCertificate] Non-OK response:`, response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[updateCertificate] Error:", error);
    return null;
  }
}

export async function deleteCertificate(certificateId: number): Promise<boolean> {
  const url = makeUrl("adminCertificateById", { certificate_id: certificateId });

  try {
    const response = await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`[deleteCertificate] Non-OK response:`, response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[deleteCertificate] Error:", error);
    return false;
  }
}
