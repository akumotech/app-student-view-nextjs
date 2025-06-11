# Authentication System Update: HTTP-Only Cookie Implementation

## 1. Overview and Rationale

This document outlines the recent updates to the application's authentication system. The primary motivation for this change is to **enhance security**, specifically by mitigating the risks associated with Cross-Site Scripting (XSS) attacks.

Previously, JWT authentication tokens might have been stored in a way accessible to client-side JavaScript (e.g., `localStorage`). This practice can make tokens vulnerable if an XSS flaw allows an attacker to execute malicious JavaScript in a user's browser.

The new system transitions to using **HTTP-only cookies** for storing and transmitting authentication tokens. This is a more secure method because HTTP-only cookies are not accessible via JavaScript, thus protecting them from being stolen through XSS.

## 2. Core Mechanism: HTTP-Only Cookies

- **Login**: Upon successful login, the backend sets the JWT (access token) in an HTTP-only cookie sent in the response headers.
- **Subsequent Requests**: For all subsequent requests to protected API endpoints, the browser automatically includes this cookie. The frontend JavaScript does not need to (and cannot) access or manage this token directly.
- **Logout**: The backend provides an endpoint that, when called, instructs the browser to clear the authentication cookie.

## 3. Key Frontend Changes (`app-student-view-nextjs`)

The frontend has been refactored to support this new authentication flow:

- **`lib/auth-context.tsx`**:
  - No longer stores the JWT in `localStorage`.
  - The `login` function now expects the backend to set an HTTP-only cookie. It retrieves user data from the login response to update the application state.
  - API calls made through `fetch` (e.g., in `fetchUserOnMount` or for other protected resources) rely on the browser automatically sending the authentication cookie. `Authorization: Bearer <token>` headers are no longer manually added by the frontend for session authentication.
  - The `logout` function now calls a backend endpoint to invalidate the cookie and then clears client-side user state.
  - Response types (`LoginResponse`, `SignUpResponse`) have been aligned with the backend's `openapi.json` schema, expecting a structure like `{ success: boolean, data: { user: User }, message?: string, error?: string }`.
- **Component-Level API Calls** (e.g., in `app/dashboard/page.tsx`, `app/callback/page.tsx`):
  - Removed direct `localStorage.getItem("authToken")` access.
  - Removed manual setting of `Authorization` headers for authenticated requests. These now rely on the automatically sent HTTP-only cookie.
  - Authentication status is determined using `isAuthenticated` and `user` from the `useAuth()` hook.

## 4. Critical Backend Requirements

To support this frontend, the backend (FastAPI application) **must** implement the following:

### 4.1. Login Endpoint (e.g., `/login`)

- **Set HTTP-Only Cookie**: On successful authentication, the backend **must** set the access token (JWT) in an HTTP-only cookie.
  - **`HttpOnly`**: **Must be `True`**. Prevents JavaScript access.
  - **`Secure`**: **Must be `True`** (for production, and recommended for all HTTPS environments). Ensures cookie is sent only over HTTPS.
  - **`SameSite`**: Set to **`Lax`** (good default) or **`Strict`**. Provides CSRF protection.
  - **`Path`**: Typically `/`.
  - **`Max-Age` / `Expires`**: Define an appropriate lifetime for the access token cookie.
- **JSON Response**: The JSON response from `/login` should still contain user details (`data.user`) for the frontend to update its state, but the token can be omitted from the JSON body.

### 4.2. Logout Endpoint (e.g., `/logout`)

- This endpoint must clear the authentication cookie(s) set during login. This is typically done by re-setting the cookie with a past expiration date or `Max-Age=0`.

### 4.3. Protected Endpoints

- Must be updated to extract and validate the JWT from the HTTP-only cookie sent by the browser, instead of an `Authorization` header.

### 4.4. Refresh Token Mechanism (Highly Recommended)

- **Issuance & Storage**: Issue a longer-lived refresh token and store it in a **separate HTTP-only cookie** with similar security attributes (`HttpOnly`, `Secure`, `SameSite`).
- **Refresh Endpoint**: Provide a dedicated, secure endpoint (e.g., `/auth/refresh`) that accepts the refresh token (from its cookie) and issues a new access token (in its HTTP-only cookie).

### 4.5. CORS Configuration

- If the frontend and backend are on different origins (e.g., `localhost:3000` vs. `localhost:8000`, or different domains in production):
  - The backend's CORS policy **must** set `allow_credentials=True`.
  - The frontend's origin must be included in `allow_origins`.
  - The frontend `fetch` calls should include `credentials: "include"`. (This has been commented in the frontend code like `lib/auth-context.tsx` and needs uncommenting if origins differ).

## 5. Security Benefits

- **XSS Mitigation**: `HttpOnly` cookies significantly reduce the risk of token theft via XSS.
- **CSRF Protection**: `SameSite` cookie attribute helps protect against CSRF attacks.
- **Secure Transmission**: `Secure` cookie attribute ensures tokens are only sent over HTTPS.

## 6. Action Items

- **Backend Development**: Prioritize implementing the cookie-setting logic in the `/login` endpoint and cookie-clearing in `/logout`. Adapt protected endpoints to read from cookies. Implement the refresh token mechanism.
- **CORS**: Verify and configure CORS settings if frontend and backend origins differ.
- **Frontend**: Uncomment `credentials: "include"` in `fetch` calls if origins differ.
- **Testing**: Thoroughly test the new authentication flow, including login, logout, session persistence, token expiration, and refresh token functionality.

This transition is crucial for maintaining a high standard of security for our application and its users.
