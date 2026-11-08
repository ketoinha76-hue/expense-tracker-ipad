import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Wallet, Category, Goal } from '../types';
import { DEFAULT_WALLETS, DEFAULT_CATEGORIES } from '../constants/defaultData';

const KEYS = {
  TRANSACTIONS: '@expense_tracker_transactions',
  WALLETS: '@expense_tracker_wallets',
  CATEGORIES: '@expense_tracker_categories',
  GOALS: '@expense_tracker_goals',
  DARK_MODE: '@expense_tracker_dark_mode',
};

export const storageService = {
  // Wallets
  async getWallets(): Promise<Wallet[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.WALLETS);
      if (!data) {
        await AsyncStorage.setItem(KEYS.WALLETS, JSON.stringify(DEFAULT_WALLETS));
        return DEFAULT_WALLETS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_WALLETS;
    }
  },

  async saveWallets(wallets: Wallet[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.WALLETS, JSON.stringify(wallets));
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CATEGORIES);
      if (!data) {
        await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
        return DEFAULT_CATEGORIES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  async saveCategories(categories: Category[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveTransactions(transactions: Transaction[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  // Goals
  async getGoals(): Promise<Goal[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.GOALS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveGoals(goals: Goal[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  },

  // Dark Mode
  async getDarkMode(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(KEYS.DARK_MODE);
      return data === 'true';
    } catch {
      return false;
    }
  },

  async saveDarkMode(isDark: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.DARK_MODE, isDark ? 'true' : 'false');
  },

  // Reset all
  async resetAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      KEYS.TRANSACTIONS,
      KEYS.WALLETS,
      KEYS.CATEGORIES,
      KEYS.GOALS,
    ]);
    await AsyncStorage.setItem(KEYS.WALLETS, JSON.stringify(DEFAULT_WALLETS));
    await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  },
};
