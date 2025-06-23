import { makeUrl } from "@/lib/utils";

export async function handleWakaTimeCallback(code: string, state: string) {
  const res = await fetch(makeUrl("wakatimeCallback"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, state }),
    credentials: "include",
  });
  return res.json();
}
