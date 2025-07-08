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
  const url = makeUrl("demoSessionSignup", { session_id: sessionId });

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

      // Try to parse error details
      try {
        const errorData = JSON.parse(body);
        console.error(`[signupForDemoSession] Error details:`, errorData);
      } catch (parseError) {
        console.error(`[signupForDemoSession] Could not parse error response:`, body);
      }

      return null;
    }

    const result = await res.json();

    // Handle different response structures
    let finalResult: DemoSignupRead | null = null;

    if (result && result.data) {
      // Response is wrapped in { data: ... }
      finalResult = result.data;
    } else if (result && (result.id || result.session_id)) {
      // Response is the DemoSignupRead object directly
      finalResult = result;
    } else {
      console.warn(`[signupForDemoSession] Unexpected response structure:`, result);
      finalResult = result; // Fallback to original behavior
    }

    revalidatePath("/dashboard/demos");
    return finalResult;
  } catch (error) {
    console.error("[signupForDemoSession] Error:", error);
    return null;
  }
}

export async function updateDemoSignup(
  signupId: number,
  updateData: DemoSignupUpdate,
): Promise<DemoSignupRead | null> {
  const url = makeUrl("demoSignupById", { signup_id: signupId });

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
  const url = makeUrl("demoSignupById", { signup_id: signupId });

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
