export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCreate {
  userId: string;
  amount: number;
  category: string;
  description?: string;
  date?: string;
  tags?: string[];
}

export interface ExpenseUpdate {
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
  tags?: string[];
}

