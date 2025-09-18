"use server";
import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";

interface FetchUsersParams {
  page?: number;
  pageSize?: number;
  role?: string;
  search?: string;
}

interface FetchUsersResponse {
  users: any[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export async function fetchUsers(
  params: FetchUsersParams = {},
): Promise<FetchUsersResponse | null> {
  const { page = 1, pageSize = 20, role, search } = params;

  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("page_size", pageSize.toString());

  if (role && role !== "all") {
    queryParams.append("role", role);
  }

  if (search && search.trim()) {
    queryParams.append("search", search.trim());
  }

  const url = `${makeUrl("adminUsers")}?${queryParams.toString()}`;

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[fetchUsers] Non-OK response:`, res.status, body);
      return null;
    }
    const result = await res.json();

    // Extract data from the API response structure
    const data = result.data || result;
    const users = data.users || data;
    const totalCount = data.total_count || users.length;

    return {
      users: Array.isArray(users) ? users : [],
      totalCount,
      page: data.page || page,
      pageSize: data.page_size || pageSize,
    };
  } catch (error) {
    console.error("[fetchUsers] Error:", error);
    return null;
  }
}
