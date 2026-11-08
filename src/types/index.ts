export type TransactionType = 'EXPENSE' | 'INCOME';

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  colorHex: string;
  iconName: string;
}

export interface Wallet {
  id: number;
  name: string;
  colorHex: string;
  iconName: string;
  initialBalance: number;
}

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  categoryId: number;
  walletId: number;
  note: string;
  timestamp: number;
}

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  walletId: number;
  note: string;
  createdTimestamp: number;
}

export interface CategorySummaryItem {
  category: Category;
  totalAmount: number;
  percentage: number;
}

export interface DailySummaryItem {
  day: number;
  dayLabel: string;
  amount: number;
}

export interface MonthlySummaryItem {
  month: number;
  monthLabel: string;
  income: number;
  expense: number;
}
