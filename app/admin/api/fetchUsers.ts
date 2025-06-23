"use server";
import { cookies } from "next/headers";
import { makeUrl } from "@/lib/utils";

export async function fetchUsers(): Promise<any[] | null> {
  const url = makeUrl("adminUsers");
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
  if (!res.ok) return null;
  const result = await res.json();
  return result.data || result;
}
