import { makeUrl } from "@/lib/utils";

export interface MyProjectData {
  project: {
    id: number;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    happy_hour?: string;
    status: string;
    batch_id: number;
    batch_name: string;
    created_at: string;
    updated_at: string;
  };
  student_project: {
    id: number;
    resume_url?: string;
    linkedin_url?: string;
    offer_date?: string;
    status: string;
    assigned_at: string;
  };
}

export async function fetchMyProject(): Promise<MyProjectData | null> {
  try {
    const response = await fetch(makeUrl("studentsMyProject"), {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No project assigned
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error("Error fetching my project:", error);
    return null;
  }
}
