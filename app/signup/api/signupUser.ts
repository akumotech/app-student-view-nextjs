import { makeUrl } from "@/lib/utils";

export async function signupUser(
  name: string,
  email: string,
  phone_number: string,
  password: string,
) {
  const res = await fetch(makeUrl("signup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone_number, password }),
    credentials: "include",
  });
  return res.json();
}
