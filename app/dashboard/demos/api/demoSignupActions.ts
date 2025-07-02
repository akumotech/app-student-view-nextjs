"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { makeUrl, makeUrlWithParams } from "@/lib/utils";
import type { DemoSignupRead } from "./fetchMyDemoSignups";

export interface DemoSignupCreate {
  demo_id: number | null;
  signup_notes: string | null;
}

export interface DemoSignupUpdate {
  demo_id: number | null;
  signup_notes: string | null;
  status: string | null;
}

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

export async function signupForDemoSession(
  sessionId: number,
  signupData: DemoSignupCreate,
): Promise<DemoSignupRead | null> {
  const url = makeUrlWithParams("/api/students/demo-sessions/{session_id}/signups", {
    session_id: sessionId,
  });

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(signupData),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[signupForDemoSession] Non-OK response:`, res.status, body);
      return null;
    }

    const result = await res.json();
    revalidatePath("/dashboard/demos");
    return result.data || result;
  } catch (error) {
    console.error("[signupForDemoSession] Error:", error);
    return null;
  }
}

export async function updateDemoSignup(
  signupId: number,
  updateData: DemoSignupUpdate,
): Promise<DemoSignupRead | null> {
  const url = makeUrlWithParams("/api/students/demo-sessions/signups/{signup_id}", {
    signup_id: signupId,
  });

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(url, {
      method: "PUT",
      headers,
      credentials: "include",
      body: JSON.stringify(updateData),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[updateDemoSignup] Non-OK response:`, res.status, body);
      return null;
    }

    const result = await res.json();
    revalidatePath("/dashboard/demos");
    return result.data || result;
  } catch (error) {
    console.error("[updateDemoSignup] Error:", error);
    return null;
  }
}

export async function cancelDemoSignup(signupId: number): Promise<boolean> {
  const url = makeUrlWithParams("/api/students/demo-sessions/signups/{signup_id}", {
    signup_id: signupId,
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
      console.error(`[cancelDemoSignup] Non-OK response:`, res.status, body);
      return false;
    }

    revalidatePath("/dashboard/demos");
    return true;
  } catch (error) {
    console.error("[cancelDemoSignup] Error:", error);
    return false;
  }
}
