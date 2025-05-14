// Base type for time-related statistics
export interface TimeStats {
  total_seconds: number;
  percent: number;
  text: string;
  hours: number;
  minutes: number;
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

// Best day information
export interface BestDay {
  date: string;
  total_seconds: number;
  text: string;
}

// Main dashboard data structure
export interface DashboardData {
  id: string;
  user_id: string;
  range: string;
  start: string;
  end: string;
  timeout: number;
  writes_only: boolean;
  timezone: string;
  holidays: number;
  status: string;
  created_at: string;
  modified_at: string;
  days_minus_holidays: number;
  human_readable_total: string;
  best_day: BestDay;
  projects: Project[];
  daily_average: number;
  total_seconds: number;
  languages: Language[];
  daily_average_including_other_language: number;
  human_readable_daily_average_including_other_language: string;
  days_including_holidays: number;
  dependencies: Dependency[];
  is_already_updating: boolean;
  editors: Editor[];
  is_stuck: boolean;
  human_readable_total_including_other_language: string;
  percent_calculated: number;
  machines: Machine[];
  is_up_to_date_pending_future: boolean;
  categories: Category[];
  is_up_to_date: boolean;
  operating_systems: OperatingSystem[];
  human_readable_daily_average: string;
  total_seconds_including_other_language: number;
  is_cached: boolean;
  username: string | null;
  is_including_today: boolean;
  human_readable_range: string;
  is_coding_activity_visible: boolean;
  is_language_usage_visible: boolean;
  is_editor_usage_visible: boolean;
  is_category_usage_visible: boolean;
  is_os_usage_visible: boolean;
}

// API response structure
export interface DashboardResponse {
  data: DashboardData;
}
