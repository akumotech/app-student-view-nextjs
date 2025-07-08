import { AuthenticatedApiClient } from "@/lib/api-client";

export interface DemoSession {
  id: number;
  session_date: string;
  session_time: string;
  max_scheduled: number;
  is_active: boolean;
  is_cancelled: boolean;
  signup_count: number;
  created_at: string;
  updated_at: string;
  zoom_link: string | null;
  title?: string;
  description?: string;
  notes?: string;
  signups?: DemoSignup[]; // Optional because some endpoints might not include it
}

export interface DemoSignup {
  id: number;
  student_id: number;
  demo_session_id: number;
  demo_id: number | null;
  signup_notes: string | null;
  did_present: boolean | null;
  presentation_notes: string | null;
  presentation_rating: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  student: {
    id: number;
    name: string;
    email: string;
  };
  demo: {
    id: number;
    title: string;
    description: string | null;
  } | null;
}

export interface CreateDemoSession {
  session_date: string;
  session_time?: string;
  max_scheduled: number;
  title?: string;
  description?: string;
  notes?: string;
  zoom_link?: string;
  is_active?: boolean;
  is_cancelled?: boolean;
}

export interface UpdateDemoSession {
  session_date?: string;
  session_time?: string;
  max_scheduled?: number;
  title?: string;
  description?: string;
  notes?: string;
  zoom_link?: string;
  is_active?: boolean;
  is_cancelled?: boolean;
}

export interface UpdateSignupAdmin {
  did_present?: boolean;
  presentation_notes?: string;
  presentation_rating?: number;
  status?: string;
}

export async function fetchDemoSessions(
  includeInactive = true,
  includeCancelled = true,
): Promise<DemoSession[] | null> {
  try {
    const queryParams: Record<string, boolean> = {};
    if (includeInactive) queryParams.include_inactive = true;
    if (includeCancelled) queryParams.include_cancelled = true;

    const data = await AuthenticatedApiClient.get<DemoSession[] | { data: DemoSession[] }>(
      "adminDemoSessions",
      undefined,
      queryParams,
    );

    return Array.isArray(data)
      ? data
      : Array.isArray((data as any).data)
        ? (data as any).data
        : null;
  } catch (e) {
    console.error("[fetchDemoSessions] Error:", e);
    return null;
  }
}

export async function createDemoSession(
  sessionData: CreateDemoSession,
): Promise<DemoSession | null> {
  try {
    return await AuthenticatedApiClient.post<DemoSession>("adminDemoSessions", sessionData);
  } catch (e) {
    console.error("[createDemoSession] Error:", e);
    return null;
  }
}

export async function updateDemoSession(
  sessionId: number,
  updates: UpdateDemoSession,
): Promise<DemoSession | null> {
  try {
    return await AuthenticatedApiClient.put<DemoSession>("adminDemoSessionById", updates, {
      session_id: sessionId,
    });
  } catch (e) {
    console.error("[updateDemoSession] Error:", e);
    return null;
  }
}

export async function deleteDemoSession(sessionId: number): Promise<boolean> {
  try {
    await AuthenticatedApiClient.delete("adminDemoSessionById", { session_id: sessionId });
    return true;
  } catch (e) {
    console.error("[deleteDemoSession] Error:", e);
    return false;
  }
}

export async function fetchSessionSignups(sessionId: number): Promise<DemoSignup[] | null> {
  try {
    const data = await AuthenticatedApiClient.get<DemoSignup[] | { data: DemoSignup[] }>(
      "adminDemoSessionSignups",
      {
        session_id: sessionId,
      },
    );
    return Array.isArray(data)
      ? data
      : Array.isArray((data as any).data)
        ? (data as any).data
        : null;
  } catch (e) {
    console.error("[fetchSessionSignups] Error:", e);
    return null;
  }
}

export async function updateSignupAdmin(
  signupId: number,
  updates: UpdateSignupAdmin,
): Promise<DemoSignup | null> {
  try {
    return await AuthenticatedApiClient.put<DemoSignup>("adminDemoSignupAdmin", updates, {
      signup_id: signupId,
    });
  } catch (e) {
    console.error("[updateSignupAdmin] Error:", e);
    return null;
  }
}
