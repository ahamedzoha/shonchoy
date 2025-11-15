import { useMemo } from "react";

import { useGetIncomesQuery } from "../../../store/apis";
import type { ChartDataPoint, DashboardData, MetricCard } from "../types";

export function useDashboard() {
  const {
    data: incomes,
    isLoading,
    error,
  } = useGetIncomesQuery({
    page: 1,
    limit: 10,
  });

  const dashboardData: DashboardData | null = useMemo(() => {
    if (!incomes) return null;

    // Transform income data into dashboard metrics
    const totalRevenue = incomes.incomes.reduce(
      (sum, income) => sum + income.amount,
      0
    );
    const totalIncomes = incomes.total;

    // Generate mock chart data based on income data
    const chartData: ChartDataPoint[] = incomes.incomes
      .slice(0, 7)
      .map((income, index) => ({
        date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        desktop: Math.floor(income.amount / 10),
        mobile: Math.floor(income.amount / 15),
      }));

    return {
      metrics: {
        revenue: totalRevenue,
        customers: 0, // Placeholder
        accounts: totalIncomes,
        growth: 0, // Placeholder
      },
      chartData,
      tableData: [], // Placeholder
    };
  }, [incomes]);

  const metricCards: MetricCard[] = useMemo(() => {
    if (!dashboardData) return [];

    return [
      {
        title: "Total Revenue",
        value: `$${dashboardData.metrics.revenue.toLocaleString()}`,
        description: "Total income from all sources",
        trend: {
          value: 12.5,
          direction: "up",
        },
      },
      {
        title: "Total Accounts",
        value: dashboardData.metrics.accounts,
        description: "Number of income accounts",
        trend: {
          value: 8.2,
          direction: "up",
        },
      },
      {
        title: "Active Customers",
        value: dashboardData.metrics.customers,
        description: "Currently active customers",
        trend: {
          value: -2.1,
          direction: "down",
        },
      },
      {
        title: "Growth Rate",
        value: `${dashboardData.metrics.growth}%`,
        description: "Monthly growth rate",
        trend: {
          value: 5.4,
          direction: "up",
        },
      },
    ];
  }, [dashboardData]);

  return {
    dashboardData,
    metricCards,
    isLoading,
    error,
  };
}
