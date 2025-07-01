import { cookies } from "next/headers";
import { makeUrl } from "./utils";

export class AuthenticatedApiClient {
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

  static async post<T>(
    endpoint: keyof typeof import("./utils").endpoints,
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
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  static async put<T>(
    endpoint: keyof typeof import("./utils").endpoints,
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
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  static async delete(
    endpoint: keyof typeof import("./utils").endpoints,
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
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
  }

  static async get<T>(
    endpoint: keyof typeof import("./utils").endpoints,
    params?: Record<string, string | number>,
    queryParams?: Record<string, string | boolean>,
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    let url = makeUrl(endpoint, params);

    // Add query parameters if provided
    if (queryParams) {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url = `${url}?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}
