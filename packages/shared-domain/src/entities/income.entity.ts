export interface Income {
  id: string;
  userId: string;
  amount: number;
  source: string;
  frequency: "weekly" | "monthly" | "yearly" | "one-time";
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeCreate {
  userId: string;
  amount: number;
  source: string;
  frequency: "weekly" | "monthly" | "yearly" | "one-time";
  description?: string;
  date?: string;
}

export interface IncomeUpdate {
  amount?: number;
  source?: string;
  frequency?: "weekly" | "monthly" | "yearly" | "one-time";
  description?: string;
  date?: string;
}

