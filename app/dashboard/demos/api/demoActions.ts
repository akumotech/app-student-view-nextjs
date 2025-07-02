"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { makeUrl, makeUrlWithParams } from "@/lib/utils";
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

interface DemoCreateUpdate {
  title: string;
  description?: string;
  github_url?: string;
  technologies?: string;
  thumbnail_url?: string;
}

export async function createDemo(
  studentId: number,
  demoData: DemoCreateUpdate,
): Promise<DemoRead | null> {
  const url = makeUrlWithParams("/api/students/{student_id}/demos", {
    student_id: studentId,
  });

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(demoData),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[createDemo] Non-OK response:`, res.status, body);
      return null;
    }

    const result = await res.json();
    revalidatePath("/dashboard/demos");
    return result.data || result;
  } catch (error) {
    console.error("[createDemo] Error:", error);
    return null;
  }
}

export async function updateDemo(
  studentId: number,
  demoId: number,
  demoData: DemoCreateUpdate,
): Promise<DemoRead | null> {
  const url = makeUrlWithParams("/api/students/{student_id}/demos/{demo_id}", {
    student_id: studentId,
    demo_id: demoId,
  });

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(url, {
      method: "PUT",
      headers,
      credentials: "include",
      body: JSON.stringify(demoData),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[updateDemo] Non-OK response:`, res.status, body);
      return null;
    }

    const result = await res.json();
    revalidatePath("/dashboard/demos");
    return result.data || result;
  } catch (error) {
    console.error("[updateDemo] Error:", error);
    return null;
  }
}

export async function deleteDemo(studentId: number, demoId: number): Promise<boolean> {
  const url = makeUrlWithParams("/api/students/{student_id}/demos/{demo_id}", {
    student_id: studentId,
    demo_id: demoId,
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
      console.error(`[deleteDemo] Non-OK response:`, res.status, body);
      return false;
    }

    revalidatePath("/dashboard/demos");
    return true;
  } catch (error) {
    console.error("[deleteDemo] Error:", error);
    return false;
  }
}
