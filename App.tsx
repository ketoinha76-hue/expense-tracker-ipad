import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { storageService } from './src/storage/asyncStorageService';
import { syncService } from './src/storage/syncService';
import { Transaction, Category, Wallet, Goal } from './src/types';
import { lightTheme, darkTheme } from './src/constants/theme';
import { getCurrentYearMonth } from './src/utils/dateUtils';
import { HomeScreen } from './src/screens/HomeScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { GoalsScreen } from './src/screens/GoalsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AddEditTransactionModal } from './src/components/AddEditTransactionModal';

export default function App() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');

  // Data states
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Refs for background sync to always access latest state
  const stateRef = useRef({ wallets, categories, transactions, goals });
  useEffect(() => {
    stateRef.current = { wallets, categories, transactions, goals };
  }, [wallets, categories, transactions, goals]);

  // Selected Date Range for Dashboard
  const initialDate = useMemo(() => getCurrentYearMonth(), []);
  const [selectedYear, setSelectedYear] = useState<number>(initialDate.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialDate.month);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Initial Load & First Sync Pull
  useEffect(() => {
    async function loadData() {
      try {
        const [w, c, t, g, dm] = await Promise.all([
          storageService.getWallets(),
          storageService.getCategories(),
          storageService.getTransactions(),
          storageService.getGoals(),
          storageService.getDarkMode(),
        ]);
        setWallets(w);
        setCategories(c);
        setTransactions(t);
        setGoals(g);
        setIsDarkMode(dm);

        // Thử kéo dữ liệu mới nhất từ hosting ngay khi mở app
        const pullRes = await syncService.pullFromServer();
        if (pullRes.hasUpdate && pullRes.data) {
          if (pullRes.data.wallets?.length) setWallets(pullRes.data.wallets);
          if (pullRes.data.categories?.length) setCategories(pullRes.data.categories);
          if (pullRes.data.transactions) setTransactions(pullRes.data.transactions);
          if (pullRes.data.goals) setGoals(pullRes.data.goals);
          setSyncStatus('ONLINE');
        }
      } catch {
        setSyncStatus('OFFLINE');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Background Auto-Sync Poll (Tự động kéo dữ liệu mỗi 3 giây mà không cần người dùng bấm gì)
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const pullRes = await syncService.pullFromServer();
        if (pullRes.hasUpdate && pullRes.data) {
          if (pullRes.data.wallets?.length) setWallets(pullRes.data.wallets);
          if (pullRes.data.categories?.length) setCategories(pullRes.data.categories);
          if (pullRes.data.transactions) setTransactions(pullRes.data.transactions);
          if (pullRes.data.goals) setGoals(pullRes.data.goals);

          // Cập nhật local storage
          if (pullRes.data.wallets?.length) await storageService.saveWallets(pullRes.data.wallets);
          if (pullRes.data.categories?.length) await storageService.saveCategories(pullRes.data.categories);
          if (pullRes.data.transactions) await storageService.saveTransactions(pullRes.data.transactions);
          if (pullRes.data.goals) await storageService.saveGoals(pullRes.data.goals);
        }
        setSyncStatus('ONLINE');
      } catch {
        setSyncStatus('OFFLINE');
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Trigger push to server helper
  const triggerAutoPush = async (
    newTx: Transaction[],
    newWallets: Wallet[],
    newCats: Category[],
    newGoals: Goal[]
  ) => {
    setIsSyncing(true);
    try {
      const ok = await syncService.pushToServer({
        transactions: newTx,
        wallets: newWallets,
        categories: newCats,
        goals: newGoals,
      });
      setSyncStatus(ok ? 'ONLINE' : 'OFFLINE');
    } finally {
      setIsSyncing(false);
    }
  };

  // Compute live wallet balances
  const walletBalances = useMemo(() => {
    const balances: Record<number, number> = {};
    for (const w of wallets) {
      balances[w.id] = w.initialBalance || 0;
    }
    for (const tx of transactions) {
      const cur = balances[tx.walletId] || 0;
      const delta = tx.type === 'INCOME' ? tx.amount : -tx.amount;
      balances[tx.walletId] = cur + delta;
    }
    return balances;
  }, [wallets, transactions]);

  // Actions
  const handleToggleDarkMode = async (value: boolean) => {
    setIsDarkMode(value);
    await storageService.saveDarkMode(value);
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear((y) => y - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear((y) => y + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleSaveTransaction = async (
    txData: Omit<Transaction, 'id'> & { id?: number }
  ) => {
    let updated: Transaction[];
    if (txData.id) {
      updated = transactions.map((t) =>
        t.id === txData.id ? ({ ...t, ...txData } as Transaction) : t
      );
    } else {
      const newTx: Transaction = {
        ...txData,
        id: Date.now(),
      };
      updated = [newTx, ...transactions];
    }
    setTransactions(updated);
    await storageService.saveTransactions(updated);
    triggerAutoPush(updated, wallets, categories, goals);
  };

  const handleDeleteTransaction = async (tx: Transaction) => {
    const updated = transactions.filter((t) => t.id !== tx.id);
    setTransactions(updated);
    await storageService.saveTransactions(updated);
    triggerAutoPush(updated, wallets, categories, goals);
  };

  const handleAddGoal = async (g: Omit<Goal, 'id' | 'createdTimestamp'>) => {
    const newGoal: Goal = {
      ...g,
      id: Date.now(),
      createdTimestamp: Date.now(),
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    await storageService.saveGoals(updated);
    triggerAutoPush(transactions, wallets, categories, updated);
  };

  const handleDeleteGoal = async (goalId: number) => {
    const updated = goals.filter((g) => g.id !== goalId);
    setGoals(updated);
    await storageService.saveGoals(updated);
    triggerAutoPush(transactions, wallets, categories, updated);
  };

  const handleAddWallet = async (walletData: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = {
      ...walletData,
      id: Date.now(),
    };
    const updated = [...wallets, newWallet];
    setWallets(updated);
    await storageService.saveWallets(updated);
    triggerAutoPush(transactions, updated, categories, goals);
  };

  const handleAddCategory = async (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: Date.now(),
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    await storageService.saveCategories(updated);
    triggerAutoPush(transactions, wallets, updated, goals);
  };

  const handleResetData = async () => {
    await storageService.resetAll();
    const w = await storageService.getWallets();
    const c = await storageService.getCategories();
    setWallets(w);
    setCategories(c);
    setTransactions([]);
    setGoals([]);
    triggerAutoPush([], w, c, []);
    alert('Đã khôi phục cài đặt gốc thành công!');
  };

  const handleLoadSampleData = async () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sample: Transaction[] = [
      { id: now - 1, amount: 25000000, type: 'INCOME', categoryId: 11, walletId: 2, note: 'Lương tháng Vietcombank', timestamp: now - 3 * oneDay },
      { id: now - 2, amount: 150000, type: 'EXPENSE', categoryId: 1, walletId: 1, note: 'Ăn trưa bò né', timestamp: now - 2 * oneDay },
      { id: now - 3, amount: 65000, type: 'EXPENSE', categoryId: 9, walletId: 3, note: 'Trà sữa Phúc Long', timestamp: now - 2 * oneDay },
      { id: now - 4, amount: 850000, type: 'EXPENSE', categoryId: 4, walletId: 2, note: 'Hóa đơn tiền điện & Internet', timestamp: now - 1 * oneDay },
      { id: now - 5, amount: 500000, type: 'EXPENSE', categoryId: 2, walletId: 1, note: 'Đổ xăng ô tô', timestamp: now - 1 * oneDay },
      { id: now - 6, amount: 1200000, type: 'EXPENSE', categoryId: 3, walletId: 2, note: 'Mua sắm siêu thị cuối tuần', timestamp: now },
      { id: now - 7, amount: 3500000, type: 'INCOME', categoryId: 12, walletId: 2, note: 'Thưởng hoàn thành dự án', timestamp: now },
    ];
    const sampleGoals: Goal[] = [
      { id: now - 8, name: 'Mua iPad Pro M4', targetAmount: 24000000, walletId: 2, note: 'Phục vụ công việc', createdTimestamp: now },
      { id: now - 9, name: 'Quỹ du lịch Đà Lạt', targetAmount: 6000000, walletId: 3, note: 'Đi cùng gia đình', createdTimestamp: now },
    ];
    setTransactions(sample);
    setGoals(sampleGoals);
    await storageService.saveTransactions(sample);
    await storageService.saveGoals(sampleGoals);
    triggerAutoPush(sample, wallets, categories, sampleGoals);
    alert('Đã nạp 7 giao dịch và 2 mục tiêu mẫu thành công!');
  };

  if (loading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Đang kết nối dữ liệu...</Text>
      </View>
    );
  }

  const navItems = [
    { label: 'Tổng quan', icon: 'account-balance-wallet' },
    { label: 'Thống kê', icon: 'pie-chart' },
    { label: 'Tiết kiệm', icon: 'savings' },
    { label: 'Cài đặt', icon: 'settings' },
  ];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Top Header Bar */}
      <View style={[styles.topHeader, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        <View style={styles.appTitleWrap}>
          <View style={[styles.appLogoBox, { backgroundColor: theme.primary }]}>
            <MaterialIcons name="account-balance-wallet" size={20} color="#FFF" />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.appTitle, { color: theme.text }]}>Quản Lý Thu Chi</Text>
              {/* Realtime Live Indicator Badge */}
              <View
                style={[
                  styles.syncBadge,
                  { backgroundColor: syncStatus === 'ONLINE' ? '#DCFCE7' : '#F1F5F9' },
                ]}
              >
                <View
                  style={[
                    styles.syncDot,
                    { backgroundColor: syncStatus === 'ONLINE' ? '#16A34A' : '#94A3B8' },
                  ]}
                />
                <Text
                  style={[
                    styles.syncBadgeText,
                    { color: syncStatus === 'ONLINE' ? '#16A34A' : '#64748B' },
                  ]}
                >
                  {isSyncing ? 'Đang đẩy...' : 'Realtime'}
                </Text>
              </View>
            </View>
            <Text style={[styles.appSub, { color: theme.textSecondary }]}>
              Tự động đồng bộ Android & iPad
            </Text>
          </View>
        </View>

        {/* iPad Top Navigation Tabs */}
        {isTablet && (
          <View style={[styles.tabletNavRow, { backgroundColor: theme.surfaceVariant }]}>
            {navItems.map((item, idx) => {
              const isSelected = activeTab === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.tabletNavItem,
                    isSelected && { backgroundColor: theme.card, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
                  ]}
                  onPress={() => setActiveTab(idx)}
                >
                  <MaterialIcons
                    name={item.icon as any}
                    size={18}
                    color={isSelected ? theme.primary : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tabletNavLabel,
                      { color: isSelected ? theme.primary : theme.textSecondary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Top Actions */}
        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.quickAddBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              setEditingTransaction(null);
              setModalVisible(true);
            }}
          >
            <MaterialIcons name="add" size={20} color="#FFF" />
            <Text style={styles.quickAddBtnText}>Ghi chép</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: theme.surfaceVariant }]}
            onPress={() => handleToggleDarkMode(!isDarkMode)}
          >
            <MaterialIcons
              name={isDarkMode ? 'light-mode' : 'dark-mode'}
              size={20}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Body */}
      <View style={styles.body}>
        {activeTab === 0 && (
          <HomeScreen
            transactions={transactions}
            categories={categories}
            wallets={wallets}
            walletBalances={walletBalances}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            theme={theme}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onAddNew={() => {
              setEditingTransaction(null);
              setModalVisible(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setModalVisible(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 1 && (
          <AnalyticsScreen
            transactions={transactions}
            categories={categories}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            theme={theme}
          />
        )}

        {activeTab === 2 && (
          <GoalsScreen
            goals={goals}
            wallets={wallets}
            walletBalances={walletBalances}
            theme={theme}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {activeTab === 3 && (
          <SettingsScreen
            wallets={wallets}
            categories={categories}
            isDarkMode={isDarkMode}
            theme={theme}
            onToggleDarkMode={handleToggleDarkMode}
            onAddWallet={handleAddWallet}
            onAddCategory={handleAddCategory}
            onResetData={handleResetData}
            onLoadSampleData={handleLoadSampleData}
          />
        )}
      </View>

      {/* Bottom Bar (For phones / compact screen) */}
      {!isTablet && (
        <View style={[styles.bottomNav, { backgroundColor: theme.navBg, borderTopColor: theme.cardBorder }]}>
          {navItems.map((item, idx) => {
            const isSelected = activeTab === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={styles.bottomNavItem}
                onPress={() => setActiveTab(idx)}
              >
                <MaterialIcons
                  name={item.icon as any}
                  size={24}
                  color={isSelected ? theme.primary : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.bottomNavLabel,
                    { color: isSelected ? theme.primary : theme.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Add / Edit Transaction Modal */}
      <AddEditTransactionModal
        visible={modalVisible}
        editingTransaction={editingTransaction}
        categories={categories}
        wallets={wallets}
        theme={theme}
        onClose={() => {
          setModalVisible(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  appTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appLogoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  appSub: {
    fontSize: 11,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tabletNavRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabletNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  tabletNavLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 4,
  },
  quickAddBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 16,
  },
  bottomNavItem: {
    alignItems: 'center',
    gap: 2,
  },
  bottomNavLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
