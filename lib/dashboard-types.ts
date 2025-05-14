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
