import { makeUrl } from "@/lib/utils";
import type { UserOverview } from "../components/types";

export async function fetchBatchStudents(batchId: string): Promise<UserOverview[] | null> {
  try {
    const url = makeUrl("batchStudents", { batch_id: batchId });
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    // If the response is wrapped, unwrap it
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.users)) return data.users;
    return null;
  } catch (e) {
    return null;
  }
}
