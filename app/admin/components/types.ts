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
  issuer?: string;
  date_issued?: string;
  date_expired?: string | null;
  description?: string;
}

export interface DemoRead {
  id: number;
  title: string;
  description?: string;
  demo_url?: string;
  github_url?: string;
  demo_date?: string;
  status?: string;
}

export interface UserOverview {
  id: number;
  email: string;
  name: string;
  phone_number?: string;
  role: "student" | "instructor" | "admin" | "user";
  disabled: boolean;
  wakatime_connected: boolean;
  student_detail?: {
    id: number;
    user: {
      id: number;
      email: string;
      name: string;
      phone_number?: string;
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

// Project Management Types
export type ProjectStatus = "planning" | "active" | "completed" | "cancelled";
export type StudentProjectStatus = "assigned" | "active" | "completed" | "dropped";
export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";
export type InterviewType = "initial" | "technical" | "behavioral" | "final" | "placeholder";

export interface ProjectRead {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  happy_hour?: string;
  status: ProjectStatus;
  batch_id: number;
  created_at: string;
  updated_at: string;
  batch?: {
    id: number;
    name: string;
    start_date?: string;
    end_date?: string;
  };
  student_count?: number;
  interview_count?: number;
  statistics?: {
    total_students: number;
    active_students: number;
    total_interviews: number;
    completed_interviews: number;
    project_status: ProjectStatus;
  };
}

export interface ProjectCreate {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  happy_hour?: string;
  status?: ProjectStatus;
  batch_id: number;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  happy_hour?: string;
  status?: ProjectStatus;
}

export interface StudentProjectAssignment {
  assignment: {
    id: number;
    student_id: number;
    project_id: number;
    resume_url?: string;
    linkedin_url?: string;
    offer_date?: string;
    status: StudentProjectStatus;
    assigned_at: string;
    updated_at: string;
  };
  student: {
    id: number;
    user_id: number;
    batch_id: number;
    user?: {
      id: number;
      email: string;
      name: string;
    };
  };
}

export interface StudentAssignmentRequest {
  student_id: number;
  resume_url?: string;
  linkedin_url?: string;
  offer_date?: string;
  status?: StudentProjectStatus;
}

export interface InterviewRead {
  id: number;
  project_id: number;
  student_id: number;
  slot_id?: number;
  interview_type: InterviewType;
  status: InterviewStatus;
  feedback?: string;
  behavioral_rating?: number;
  technical_rating?: number;
  communication_rating?: number;
  body_language_rating?: number;
  professionalism_rating?: number;
  about_you_rating?: number;
  rating?: number; // Legacy field
  created_at: string;
  updated_at: string;
  student?: {
    id: number;
    user_id: number;
    batch_id: number;
    user?: {
      id: number;
      email: string;
      name: string;
    };
  };
}

export interface InterviewCreate {
  student_id: number;
  scheduled_at?: string;
  interview_type?: string;
  status?: InterviewStatus;
  feedback?: string;
  rating?: number;
  interviewer?: string;
}

export interface InterviewUpdate {
  interview_type?: InterviewType;
  status?: InterviewStatus;
  feedback?: string;
  behavioral_rating?: number;
  technical_rating?: number;
  communication_rating?: number;
  rating?: number; // Legacy field
}

// Interview Session Types
export interface InterviewSessionRead {
  id: number;
  name: string;
  description?: string;
  interviewer?: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InterviewSessionCreate {
  name: string;
  description?: string;
  interviewer?: string;
  is_active?: boolean;
}

export interface InterviewSessionUpdate {
  name?: string;
  description?: string;
  interviewer?: string;
  is_active?: boolean;
}

// Interview Slot Types
export interface InterviewSlotRead {
  id: number;
  session_id: number;
  scheduled_at: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  student_name?: string;
  student_email?: string;
}

export interface InterviewSlotCreate {
  session_id: number;
  scheduled_at: string;
  is_available?: boolean;
}

export interface InterviewSlotUpdate {
  scheduled_at?: string;
  is_available?: boolean;
}

// Extended types with relationships
export interface InterviewSessionWithSlots extends InterviewSessionRead {
  slots: InterviewSlotRead[];
}

export interface InterviewSlotWithSession extends InterviewSlotRead {
  session?: InterviewSessionRead;
}

export interface InterviewWithDetails extends InterviewRead {
  student?: {
    id: number;
    user_id: number;
    batch_id: number;
    user?: {
      id: number;
      email: string;
      name: string;
    };
  };
  project?: ProjectRead;
  slot?: InterviewSlotRead;
}

// Response types
export interface InterviewSessionListResponse {
  sessions: InterviewSessionWithSlots[];
  total_count: number;
}

export interface InterviewSlotListResponse {
  slots: InterviewSlotWithSession[];
  total_count: number;
}

export interface InterviewListResponse {
  interviews: InterviewWithDetails[];
  total_count: number;
}

export interface InterviewWithStudentDetails extends InterviewRead {
  student_name?: string;
  student_email?: string;
  slot_scheduled_at?: string;
}

export interface InterviewWithStudentListResponse {
  interviews: InterviewWithStudentDetails[];
  total_count: number;
}

export interface InterviewReviewUpdate {
  feedback?: string;
  behavioral_rating?: number;
  technical_rating?: number;
  communication_rating?: number;
  body_language_rating?: number;
  professionalism_rating?: number;
  about_you_rating?: number;
  status?: InterviewStatus;
}
