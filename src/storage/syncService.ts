import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Wallet, Category, Goal } from '../types';

const SYNC_URL_KEY = '@expense_tracker_sync_url';
const DEFAULT_SYNC_URL = 'http://appcuatoi.ct.ws/api.php';
const LAST_SYNC_TIMESTAMP_KEY = '@expense_tracker_last_sync_ts';

export interface SyncPayload {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  goals: Goal[];
  updated_at?: number;
}

export const syncService = {
  async getSyncUrl(): Promise<string> {
    try {
      const url = await AsyncStorage.getItem(SYNC_URL_KEY);
      return url || DEFAULT_SYNC_URL;
    } catch {
      return DEFAULT_SYNC_URL;
    }
  },

  async setSyncUrl(url: string): Promise<void> {
    await AsyncStorage.setItem(SYNC_URL_KEY, url);
  },

  async getLastSyncTimestamp(): Promise<number> {
    try {
      const ts = await AsyncStorage.getItem(LAST_SYNC_TIMESTAMP_KEY);
      return ts ? parseInt(ts, 10) : 0;
    } catch {
      return 0;
    }
  },

  async setLastSyncTimestamp(ts: number): Promise<void> {
    await AsyncStorage.setItem(LAST_SYNC_TIMESTAMP_KEY, ts.toString());
  },

  async pullFromServer(): Promise<{ hasUpdate: boolean; data?: SyncPayload }> {
    try {
      const url = await this.getSyncUrl();
      const lastTs = await this.getLastSyncTimestamp();

      const response = await fetch(`${url}?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        return { hasUpdate: false };
      }

      const json = await response.json();
      if (!json || !json.updated_at) {
        return { hasUpdate: false };
      }

      if (json.updated_at > lastTs) {
        await this.setLastSyncTimestamp(json.updated_at);
        return {
          hasUpdate: true,
          data: {
            transactions: json.transactions || [],
            wallets: json.wallets || [],
            categories: json.categories || [],
            goals: json.goals || [],
            updated_at: json.updated_at,
          },
        };
      }

      return { hasUpdate: false };
    } catch (err) {
      // Offline hoặc kết nối chậm, bỏ qua nhẹ nhàng
      return { hasUpdate: false };
    }
  },

  async pushToServer(payload: SyncPayload): Promise<boolean> {
    try {
      const url = await this.getSyncUrl();
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) return false;

      const resJson = await response.json();
      if (resJson && resJson.updated_at) {
        await this.setLastSyncTimestamp(resJson.updated_at);
      }
      return true;
    } catch (err) {
      return false;
    }
  },
};
