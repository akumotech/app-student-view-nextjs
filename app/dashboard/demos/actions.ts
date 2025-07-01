"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";
import type {
  DemoSessionSummary,
  DemoSignupRead,
  DemoSignupCreate,
  DemoSignupUpdate,
} from "./components/DemoSessionSignups";

class StudentApiClient {
  private static async getAuthHeaders() {
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

  static async get<T>(
    endpoint: keyof typeof import("@/lib/utils").endpoints,
    params?: Record<string, string | number>,
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = makeUrl(endpoint, params);

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch from ${endpoint}: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  static async post<T>(
    endpoint: keyof typeof import("@/lib/utils").endpoints,
    data: any,
    params?: Record<string, string | number>,
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = makeUrl(endpoint, params);

    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to post to ${endpoint}: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  static async put<T>(
    endpoint: keyof typeof import("@/lib/utils").endpoints,
    data: any,
    params?: Record<string, string | number>,
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = makeUrl(endpoint, params);

    const response = await fetch(url, {
      method: "PUT",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to put to ${endpoint}: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  static async delete(
    endpoint: keyof typeof import("@/lib/utils").endpoints,
    params?: Record<string, string | number>,
  ): Promise<void> {
    const headers = await this.getAuthHeaders();
    const url = makeUrl(endpoint, params);

    const response = await fetch(url, {
      method: "DELETE",
      headers,
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete from ${endpoint}: ${response.status} - ${errorText}`);
    }
  }
}

export async function fetchAvailableDemoSessionsAction(): Promise<
  { success: true; data: DemoSessionSummary[] } | { success: false; error: string }
> {
  try {
    const data = await StudentApiClient.get<DemoSessionSummary[]>("demoSessions");
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching available demo sessions:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function fetchMyDemoSignupsAction(): Promise<
  { success: true; data: DemoSignupRead[] } | { success: false; error: string }
> {
  try {
    const data = await StudentApiClient.get<DemoSignupRead[]>("studentsMyDemoSignups");
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching my demo signups:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function signupForDemoSessionAction(
  sessionId: number,
  signupData: DemoSignupCreate,
): Promise<{ success: true; data: DemoSignupRead } | { success: false; error: string }> {
  try {
    const data = await StudentApiClient.post<DemoSignupRead>("demoSessionSignup", signupData, {
      session_id: sessionId,
    });

    revalidatePath("/dashboard/demos");
    return { success: true, data };
  } catch (error) {
    console.error("Error signing up for demo session:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function updateDemoSignupAction(
  signupId: number,
  updateData: DemoSignupUpdate,
): Promise<{ success: true; data: DemoSignupRead } | { success: false; error: string }> {
  try {
    const data = await StudentApiClient.put<DemoSignupRead>("demoSignupById", updateData, {
      signup_id: signupId,
    });

    revalidatePath("/dashboard/demos");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating demo signup:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function cancelDemoSignupAction(
  signupId: number,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await StudentApiClient.delete("demoSignupById", { signup_id: signupId });

    revalidatePath("/dashboard/demos");
    return { success: true };
  } catch (error) {
    console.error("Error cancelling demo signup:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
