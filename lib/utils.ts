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
  wakatimeStatsRange: "/api/wakatime/stats-range", // POST /api/wakatime/stats-range
  wakatimeToday: "/api/wakatime/today", // POST /api/wakatime/today

  // Student registration (OpenAPI: /api/students/...)
  studentsRegister: "/api/students/register", // POST /api/students/register

  // Student profile endpoints (OpenAPI: /api/students/...)
  students: "/api/students/", // GET /api/students/
  studentsById: "/api/students/{student_id}", // GET|PUT /api/students/{student_id}

  // My student data endpoints (OpenAPI: /api/students/me/...)
  studentsCertificates: "/api/students/me/certificates", // GET /api/students/me/certificates
  studentsDemos: "/api/students/me/demos", // GET /api/students/me/demos
  studentsMyDemoSignups: "/api/students/me/demo-signups", // GET /api/students/me/demo-signups

  // Student-specific endpoints (OpenAPI: /api/students/{student_id}/...)
  studentCertificates: "/api/students/{student_id}/certificates", // GET|POST /api/students/{student_id}/certificates
  studentCertificateById: "/api/students/{student_id}/certificates/{certificate_id}", // PUT|DELETE /api/students/{student_id}/certificates/{certificate_id}
  studentDemos: "/api/students/{student_id}/demos", // GET|POST /api/students/{student_id}/demos
  studentDemoById: "/api/students/{student_id}/demos/{demo_id}", // PUT|DELETE /api/students/{student_id}/demos/{demo_id}

  // Batch endpoints (OpenAPI: /api/batches/...)
  batches: "/api/batches/", // GET|POST /api/batches/
  batchById: "/api/batches/{batch_id}", // GET|PUT|DELETE /api/batches/{batch_id}
  batchStudents: "/api/batches/{batch_id}/students", // GET /api/batches/{batch_id}/students

  // Project endpoints (OpenAPI: /api/projects/...)
  projects: "/api/projects/", // GET|POST /api/projects/
  projectById: "/api/projects/{project_id}", // GET|PUT|DELETE /api/projects/{project_id}

  // Demo Session endpoints (OpenAPI: /api/demo-sessions...)
  demoSessions: "/api/demo-sessions", // GET /api/demo-sessions
  demoSessionSignup: "/api/demo-sessions/{session_id}/signup", // POST /api/demo-sessions/{session_id}/signup
  demoSignupById: "/api/demo-signups/{signup_id}", // PUT|DELETE /api/demo-signups/{signup_id}

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

  // Analytics endpoints (OpenAPI: /api/v1/admin/...)
  adminOverview: "/api/v1/admin/overview", // GET /api/v1/admin/overview
  adminTrends: "/api/v1/admin/trends", // GET /api/v1/admin/trends
  adminEngagement: "/api/v1/admin/engagement", // GET /api/v1/admin/engagement
  adminCodingActivity: "/api/v1/admin/coding-activity", // GET /api/v1/admin/coding-activity
  adminAnalyticsOverview: "/api/v1/admin/analytics/overview", // GET /api/v1/admin/analytics/overview
  adminAnalyticsDemos: "/api/v1/admin/analytics/demos", // GET /api/v1/admin/analytics/demos
  adminAnalyticsWakatime: "/api/v1/admin/analytics/wakatime", // GET /api/v1/admin/analytics/wakatime

  // Demo Session Management endpoints (Current Backend: /admin/...)
  adminDemoSessions: "/api/v1/admin/demo-sessions", // GET|POST /api/v1/admin/demo-sessions
  adminDemoSessionById: "/api/v1/admin/demo-sessions/{session_id}", // GET|PUT|DELETE /api/v1/admin/demo-sessions/{session_id}
  adminDemoSessionSignups: "/api/v1/admin/demo-sessions/{session_id}/signups", // GET /api/v1/admin/demo-sessions/{session_id}/signups
  adminDemoSignupAdmin: "/api/v1/admin/demo-signups/{signup_id}/admin", // PUT /api/v1/admin/demo-signups/{signup_id}/admin
  adminDemoSessionsBulkCreate: "/api/v1/admin/demo-sessions/bulk-create", // POST /api/v1/admin/demo-sessions/bulk-create
} as const;

export function makeUrl(path: keyof typeof endpoints, params?: Record<string, string | number>) {
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
export function makeUrlWithParams(path: string, params?: Record<string, string | number>) {
  const baseUrl = getBaseUrl();
  let endpoint = path;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      endpoint = endpoint.replace(`{${key}}`, String(value));
    });
  }

  return `${baseUrl}${endpoint}`;
}

// Time formatting utilities for demo sessions
export function formatTimeForDisplay(time: string): string {
  // Convert HH:MM:SS to 12-hour format
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function formatTimeForInput(time: string): string {
  // Convert HH:MM:SS to HH:MM for input field
  return time.split(":").slice(0, 2).join(":");
}

export function formatTimeForApi(time: string): string {
  // Convert HH:MM to HH:MM:SS for API
  return time.includes(":") && time.split(":").length === 2 ? `${time}:00` : time;
}

export function formatSessionDateTime(date: string, time: string): string {
  // Format date and time together with timezone
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = formatTimeForDisplay(time);
  return `${formattedDate} at ${formattedTime} Central Time`;
}

export function getDefaultSessionTime(): string {
  // Return default time of 3:00 PM (15:00) in HH:MM format
  return "15:00";
}

export function getCommonSessionTimes(): { label: string; value: string }[] {
  return [
    { label: "1:00 PM Central", value: "13:00" },
    { label: "2:00 PM Central", value: "14:00" },
    { label: "3:00 PM Central", value: "15:00" },
    { label: "4:00 PM Central", value: "16:00" },
    { label: "5:00 PM Central", value: "17:00" },
  ];
}
