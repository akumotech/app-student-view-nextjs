import { makeUrl } from "@/lib/utils";

export async function loginUser(email: string, password: string) {
  const res = await fetch(makeUrl("login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  return res.json();
}
