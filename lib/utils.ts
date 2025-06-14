import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
}

export const endpoints = {
  // Authentication endpoints (OpenAPI: /api/...)
  login: "/api/login", // POST /api/login
  signup: "/api/signup", // POST /api/signup
  logout: "/api/logout", // POST /api/logout
  signupStudent: "/api/signup/student", // POST /api/signup/student
  usersMe: "/api/users/me", // GET /api/users/me

  // WakaTime endpoints (OpenAPI: /api/wakatime/...)
  wakatimeAuthorize: "/api/wakatime/authorize", // GET /api/wakatime/authorize
  wakatimeCallback: "/api/wakatime/callback", // POST /api/wakatime/callback
  wakatimeUsage: "/api/wakatime/usage", // POST /api/wakatime/usage
  wakatimeToday: "/api/wakatime/today", // POST /api/wakatime/today

  // Student registration (OpenAPI: /api/students/...)
  studentsRegister: "/api/students/register", // POST /api/students/register

  // Student profile endpoints (OpenAPI: /api/students/...)
  students: "/api/students/", // GET /api/students/
  studentsById: "/api/students/{student_id}", // GET|PUT /api/students/{student_id}

  // My student data endpoints (OpenAPI: /api/students/me/...)
  studentsCertificates: "/api/students/me/certificates", // GET /api/students/me/certificates
  studentsDemos: "/api/students/me/demos", // GET /api/students/me/demos

  // Student-specific endpoints (OpenAPI: /api/students/{student_id}/...)
  studentCertificates: "/api/students/{student_id}/certificates", // GET|POST /api/students/{student_id}/certificates
  studentCertificateById:
    "/api/students/{student_id}/certificates/{certificate_id}", // PUT|DELETE /api/students/{student_id}/certificates/{certificate_id}
  studentDemos: "/api/students/{student_id}/demos", // GET|POST /api/students/{student_id}/demos
  studentDemoById: "/api/students/{student_id}/demos/{demo_id}", // PUT|DELETE /api/students/{student_id}/demos/{demo_id}

  // Batch endpoints (OpenAPI: /api/batches/...)
  batches: "/api/batches/", // GET|POST /api/batches/
  batchById: "/api/batches/{batch_id}", // GET|PUT|DELETE /api/batches/{batch_id}

  // Project endpoints (OpenAPI: /api/projects/...)
  projects: "/api/projects/", // GET|POST /api/projects/
  projectById: "/api/projects/{project_id}", // GET|PUT|DELETE /api/projects/{project_id}

  // Admin endpoints (OpenAPI: /api/v1/admin/...)
  adminDashboard: "/api/v1/admin/dashboard", // GET /api/v1/admin/dashboard
  adminStats: "/api/v1/admin/stats", // GET /api/v1/admin/stats
  adminUsers: "/api/v1/admin/users", // GET /api/v1/admin/users
  adminUserById: "/api/v1/admin/users/{user_id}", // GET /api/v1/admin/users/{user_id}
  adminUserRole: "/api/v1/admin/users/{user_id}/role", // PUT /api/v1/admin/users/{user_id}/role
  adminStudentById: "/api/v1/admin/students/{student_id}", // PUT /api/v1/admin/students/{student_id}
  adminBatches: "/api/v1/admin/batches", // GET /api/v1/admin/batches
  adminProjects: "/api/v1/admin/projects", // GET /api/v1/admin/projects
  adminStudentFull: "/api/v1/admin/students/{student_id}/full", // GET /api/v1/admin/students/{student_id}/full
} as const;

export function makeUrl(
  path: keyof typeof endpoints,
  params?: Record<string, string | number>
) {
  const baseUrl = getBaseUrl();
  let endpoint: string = endpoints[path];

  // Replace path parameters if provided
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      endpoint = endpoint.replace(`{${key}}`, String(value));
    });
  }

  return `${baseUrl}${endpoint}`;
}

// Helper function for parameterized endpoints
export function makeUrlWithParams(
  path: string,
  params?: Record<string, string | number>
) {
  const baseUrl = getBaseUrl();
  let endpoint = path;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      endpoint = endpoint.replace(`{${key}}`, String(value));
    });
  }

  return `${baseUrl}${endpoint}`;
}
