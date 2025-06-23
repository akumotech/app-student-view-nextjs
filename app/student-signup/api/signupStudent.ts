import { makeUrl } from "@/lib/utils";

export async function signupStudent(
  name: string,
  email: string,
  password: string,
  batch_registration_key: string,
) {
  const res = await fetch(makeUrl("signupStudent"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, batch_registration_key }),
    credentials: "include",
  });
  return res.json();
}
