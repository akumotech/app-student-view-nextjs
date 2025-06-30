import { getBaseUrl } from "@/lib/utils";

function makeUrlWithQueryParams(
  path: string,
  queryParams?: Record<string, string | number>,
): string {
  const baseUrl = getBaseUrl();
  const url = new URL(path, baseUrl);

  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
}

export async function getOverviewStats(batchId?: number) {
  const url = makeUrlWithQueryParams(
    "/api/v1/admin/overview",
    batchId ? { batch_id: batchId } : undefined,
  );
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch overview stats");
  return res.json();
}

export async function getTrends(batchId?: number) {
  const url = makeUrlWithQueryParams(
    "/api/v1/admin/trends",
    batchId ? { batch_id: batchId } : undefined,
  );
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch trends");
  return res.json();
}

export async function getEngagement(batchId?: number) {
  const url = makeUrlWithQueryParams(
    "/api/v1/admin/engagement",
    batchId ? { batch_id: batchId } : undefined,
  );
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch engagement");
  return res.json();
}

export async function getCodingActivity(batchId?: number) {
  const url = makeUrlWithQueryParams(
    "/api/v1/admin/coding-activity",
    batchId ? { batch_id: batchId } : undefined,
  );
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch coding activity");
  return res.json();
}
