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

// Analytics types based on OpenAPI schema
export interface OverviewStats {
  total_students: number;
  total_certificates: number;
  total_demos: number;
  students_with_certificates: number;
  students_with_demos: number;
  avg_certificates_per_student: number;
  avg_demos_per_student: number;
}

export interface TrendsStats {
  labels: string[];
  new_students: number[];
  certificates_issued: number[];
  demos_submitted: number[];
}

export interface EngagementStats {
  inactive_students_7d: number;
  inactive_students_30d: number;
  active_streaks: Array<Record<string, any>>;
  at_risk_students: number[];
}

export interface CodingActivityStats {
  total_coding_seconds: number;
  per_student: Record<string, number>;
  per_language: Record<string, number>;
  heatmap: Record<string, Record<string, number>>;
  inactive_students: number[];
}

export interface AnalyticsDashboardData {
  overview: OverviewStats;
  trends: TrendsStats;
  engagement: EngagementStats;
  codingActivity: CodingActivityStats;
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
