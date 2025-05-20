// Base type for time-related statistics
export interface TimeStats {
  total_seconds: number;
  percent: number;
  text: string;
  hours: number;
  minutes: number;
  seconds: number;
  digital: string;
  decimal: string;
}

// Language statistics
export interface Language extends TimeStats {
  name: string;
}

// Editor statistics
export interface Editor extends TimeStats {
  name: string;
}

// Dependency statistics
export interface Dependency extends TimeStats {
  name: string;
}

// Operating system statistics
export interface OperatingSystem extends TimeStats {
  name: string;
}

// Project statistics
export interface Project extends TimeStats {
  name: string;
  color?: string | null;
}

// Category statistics
export interface Category extends TimeStats {
  name: string;
}

// Machine statistics
export interface Machine extends TimeStats {
  name: string;
  machine_name_id: string;
}

// Grand total time summary
export interface GrandTotal {
  hours: number;
  minutes: number;
  total_seconds: number;
  digital: string;
  decimal: string;
  text: string;
}

// Date range object
export interface DateRange {
  start: string;
  end: string;
  date: string;
  text: string;
  timezone: string;
}

// Per-day dashboard data
export interface DashboardEntry {
  languages: Language[];
  editors: Editor[];
  operating_systems: OperatingSystem[];
  categories: Category[];
  dependencies: Dependency[];
  machines: Machine[];
  projects: Project[];
  grand_total: GrandTotal;
  range: DateRange;
}

// Cumulative total structure
export interface CumulativeTotal {
  seconds: number;
  text: string;
  digital: string;
  decimal: string;
}

// Daily average structure
export interface DailyAverage {
  holidays: number;
  days_minus_holidays: number;
  days_including_holidays: number;
  seconds: number;
  seconds_including_other_language: number;
  text: string;
  text_including_other_language: string;
}

// Main dashboard structure (response from backend)
export interface DashboardData {
  data: DashboardEntry[];
  start: string;
  end: string;
  cumulative_total: CumulativeTotal;
  daily_average: DailyAverage;
}

// API response structure
export interface DashboardResponse {
  data: DashboardData;
}

// Certificate types
export interface CertificateBase {
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CertificateCreate extends CertificateBase {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CertificateUpdate extends Partial<CertificateBase> {}

export interface CertificateRead extends CertificateBase {
  id: number;
  student_id: number;
  created_at: string;
  updated_at: string;
}

// Demo types
export interface DemoBase {
  title: string;
  description?: string;
  demo_url: string;
  github_url?: string;
  technologies: string[];
  thumbnail_url?: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DemoCreate extends DemoBase {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DemoUpdate extends Partial<DemoBase> {}

export interface DemoRead extends DemoBase {
  id: number;
  student_id: number;
  created_at: string;
  updated_at: string;
}
