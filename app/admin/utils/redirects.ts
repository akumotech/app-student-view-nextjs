import { redirect } from "next/navigation";

export function redirectToLogin(message?: string) {
  const params = new URLSearchParams();
  if (message) {
    params.set("error", message);
  }
  const redirectUrl = `/login${params.toString() ? `?${params.toString()}` : ""}`;
  redirect(redirectUrl);
}

export function redirectToLoginWithAuth() {
  redirectToLogin("You must be logged in as an admin to access this page");
}

export function redirectToLoginWithError(message: string) {
  redirectToLogin(message);
}
