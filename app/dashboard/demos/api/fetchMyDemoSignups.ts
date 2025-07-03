"use server";
import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";

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

export interface StudentInfo {
  id: number;
  user_id: number;
  name: string;
  email: string;
}

export interface DemoInfo {
  title: string;
  description: string;
  date: string | null;
  status: string;
  id: number;
  student_id: number;
}

export interface DemoSignupRead {
  demo_id: number;
  signup_notes: string;
  id: number;
  session_id: number;
  student_id: number;
  status: string;
  did_present: boolean | null;
  presentation_notes: string | null;
  presentation_rating: number | null;
  scheduled_at: string;
  updated_at: string;
  student: StudentInfo;
  demo: DemoInfo;
}

export async function fetchMyDemoSignups(): Promise<DemoSignupRead[] | null> {
  const url = makeUrl("studentsMyDemoSignups");

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      // Handle 404 as empty array - no signups yet
      if (res.status === 404) {
        return [];
      }
      const body = await res.text();
      console.error(`[fetchMyDemoSignups] Non-OK response:`, res.status, body);
      return null;
    }

    const result = await res.json();
    return result.data || result;
  } catch (error) {
    console.error("[fetchMyDemoSignups] Error:", error);
    return null;
  }
}
