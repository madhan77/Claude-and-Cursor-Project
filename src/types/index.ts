// User Types
export type UserRole = 'b2b_admin' | 'b2b_user' | 'b2c_user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization?: string;
  avatar?: string;
  createdAt: Date;
}

// Output Panel Types
export interface OutputResult {
  id: string;
  timestamp: Date;
  content: string;
  format: 'text' | 'json' | 'csv' | 'html' | 'markdown';
  metadata: {
    generationTime: number; // in seconds
    qualityScore?: number;
    tokenCount?: number;
    resourceUtilization?: number;
    version?: number;
  };
  status: 'success' | 'error' | 'warning';
}

// Dashboard Types
export interface DashboardStats {
  totalUsers?: number;
  activeUsers?: number;
  apiCalls?: number;
  revenue?: number;
  sessionDuration?: number;
  conversionRate?: number;
}

// Analytics Types
export interface AnalyticsData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}
