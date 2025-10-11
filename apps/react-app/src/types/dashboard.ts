import { z } from "zod";

/**
 * Dashboard table item schema
 * Extend this schema to add custom fields to your table
 */
export const dashboardItemSchema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
});

export type DashboardItem = z.infer<typeof dashboardItemSchema>;

/**
 * Metrics card data type
 * Used for the section cards component
 */
export interface MetricCard {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
}

/**
 * Chart data point
 * Used for area charts and other visualizations
 */
export interface ChartDataPoint {
  date: string;
  desktop: number;
  mobile: number;
}

/**
 * Dashboard API response type
 * Use this when fetching dashboard data from your API
 */
export interface DashboardData {
  metrics: {
    revenue: number;
    customers: number;
    accounts: number;
    growth: number;
  };
  chartData: ChartDataPoint[];
  tableData: DashboardItem[];
}

/**
 * Sidebar navigation item
 */
export interface NavItem {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: {
    title: string;
    url: string;
  }[];
  isActive?: boolean;
}

/**
 * User profile for sidebar
 */
export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}
