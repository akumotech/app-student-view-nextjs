"use server";

import { revalidatePath } from "next/cache";
import { AuthenticatedApiClient } from "@/lib/api-client";
import type { DemoSession, DemoSignup, UpdateSignupAdmin } from "../api/fetchDemoSessions";

export interface CreateDemoSessionData {
  session_date: string;
  max_scheduled: number;
}

export interface UpdateDemoSessionData {
  session_date?: string;
  max_scheduled?: number;
  is_active?: boolean;
  is_cancelled?: boolean;
}

export async function createDemoSessionAction(
  data: CreateDemoSessionData,
): Promise<{ success: true; data: DemoSession } | { success: false; error: string }> {
  try {
    const result = await AuthenticatedApiClient.post<DemoSession>("adminDemoSessions", data);
    revalidatePath("/admin/demo-sessions");
    return { success: true, data: result };
  } catch (error) {
    console.error("Create demo session action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function updateDemoSessionAction(
  sessionId: number,
  data: UpdateDemoSessionData,
): Promise<{ success: true; data: DemoSession } | { success: false; error: string }> {
  try {
    const result = await AuthenticatedApiClient.put<DemoSession>("adminDemoSessionById", data, {
      session_id: sessionId,
    });
    revalidatePath("/admin/demo-sessions");
    return { success: true, data: result };
  } catch (error) {
    console.error("Update demo session action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function deleteDemoSessionAction(sessionId: number) {
  try {
    await AuthenticatedApiClient.delete("adminDemoSessionById", { session_id: sessionId });
    revalidatePath("/admin/demo-sessions");
    return { success: true };
  } catch (error) {
    console.error("Delete demo session action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function fetchSessionSignupsAction(
  sessionId: number,
): Promise<{ success: true; data: DemoSignup[] } | { success: false; error: string }> {
  try {
    const result = await AuthenticatedApiClient.get<DemoSignup[] | { data: DemoSignup[] }>(
      "adminDemoSessionSignups",
      { session_id: sessionId },
    );
    const signups = Array.isArray(result)
      ? result
      : Array.isArray((result as any).data)
        ? (result as any).data
        : [];
    return { success: true, data: signups };
  } catch (error) {
    console.error("Fetch session signups action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function updateSignupAction(
  signupId: number,
  data: UpdateSignupAdmin,
): Promise<{ success: true; data: DemoSignup } | { success: false; error: string }> {
  try {
    const result = await AuthenticatedApiClient.put<DemoSignup>("adminDemoSignupAdmin", data, {
      signup_id: signupId,
    });
    revalidatePath("/admin/demo-sessions");
    return { success: true, data: result };
  } catch (error) {
    console.error("Update signup action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
