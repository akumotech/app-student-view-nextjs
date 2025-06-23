// Shared types for admin dashboard components

export interface DashboardStats {
  total_users: number;
  total_students: number;
  total_instructors: number;
  total_admins: number;
  active_batches: number;
  total_certificates: number;
  total_demos: number;
  users_with_wakatime: number;
}

export interface CertificateRead {
  id: number;
  name: string;
  issuer: string;
  date_issued: string;
  date_expired?: string | null;
}

export interface DemoRead {
  id: number;
  title: string;
  description?: string;
  demo_url?: string;
  github_url?: string;
}

export interface UserOverview {
  id: number;
  email: string;
  name: string;
  role: "student" | "instructor" | "admin" | "user";
  disabled: boolean;
  wakatime_connected: boolean;
  student_detail?: {
    id: number;
    user: {
      id: number;
      email: string;
      name: string;
      role: string;
      disabled: boolean;
    };
    batch?: {
      id: number;
      name: string;
      description?: string;
      start_date?: string;
      end_date?: string;
      slack_channel?: string;
      curriculum?: string | null;
    };
    project?: {
      id: number;
      name: string;
      start_date?: string;
      end_date?: string;
    };
    certificates: CertificateRead[];
    demos: DemoRead[];
    wakatime_stats?: {
      hours: number;
      digital: string;
      text: string;
      last_updated?: string;
    };
  };
}

export interface BatchRead {
  id: number;
  name: string;
  slack_channel: string;
  start_date: string;
  end_date: string;
  curriculum?: string | null;
  registration_key: string;
  registration_key_active: boolean;
}

export interface NewlyCreatedBatchInfo {
  id: string;
  name: string;
  registrationKey: string;
}
