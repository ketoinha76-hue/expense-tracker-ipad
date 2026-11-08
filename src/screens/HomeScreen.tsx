import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Transaction, Category, Wallet } from '../types';
import { SummaryCard } from '../components/SummaryCard';
import { TransactionItem } from '../components/TransactionItem';
import { formatVnd } from '../utils/currency';
import { Theme } from '../constants/theme';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  walletBalances: Record<number, number>;
  selectedYear: number;
  selectedMonth: number;
  theme: Theme;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddNew: () => void;
  onEditTransaction: (item: Transaction) => void;
  onDeleteTransaction: (item: Transaction) => void;
}

export const HomeScreen: React.FC<Props> = ({
  transactions,
  categories,
  wallets,
  walletBalances,
  selectedYear,
  selectedMonth,
  theme,
  onPrevMonth,
  onNextMonth,
  onAddNew,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<number | null>(null);

  // Month calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Filtered transactions
  const filteredList = transactions.filter((tx) => {
    const cat = categories.find((c) => c.id === tx.categoryId);
    const catName = cat?.name || '';
    const matchCat = selectedCatFilter === null || tx.categoryId === selectedCatFilter;
    const matchQuery =
      searchQuery.trim() === '' ||
      tx.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const walletMap = new Map(wallets.map((w) => [w.id, w]));

  const renderLeftPanel = () => (
    <View style={isTablet ? styles.tabletLeftCol : null}>
      {/* Month Navigator */}
      <View style={[styles.monthNav, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.navArrowBtn}>
          <MaterialIcons name="chevron-left" size={28} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.monthLabelWrap}>
          <Text style={[styles.monthText, { color: theme.text }]}>
            Tháng {selectedMonth} / {selectedYear}
          </Text>
        </View>
        <TouchableOpacity onPress={onNextMonth} style={styles.navArrowBtn}>
          <MaterialIcons name="chevron-right" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <SummaryCard
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netBalance={netBalance}
        theme={theme}
      />

      {/* Wallets Carousel */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Nguồn tiền & Tài khoản</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.walletsScroll}
      >
        {wallets.map((w) => {
          const balance = walletBalances[w.id] ?? w.initialBalance;
          return (
            <View
              key={w.id}
              style={[
                styles.walletCard,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
            >
              <View style={[styles.walletIconCircle, { backgroundColor: w.colorHex + '20' }]}>
                <MaterialIcons name={w.iconName as any} size={22} color={w.colorHex} />
              </View>
              <Text style={[styles.walletName, { color: theme.text }]} numberOfLines={1}>
                {w.name}
              </Text>
              <Text
                style={[
                  styles.walletBalance,
                  { color: balance >= 0 ? theme.text : theme.expense },
                ]}
              >
                {formatVnd(balance)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderRightPanel = () => (
    <View style={isTablet ? styles.tabletRightCol : null}>
      {/* Search & Filter */}
      <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <MaterialIcons name="search" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Tìm theo ghi chú hoặc danh mục..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="clear" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilterRow}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedCatFilter === null
              ? { backgroundColor: theme.primary, borderColor: theme.primary }
              : { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => setSelectedCatFilter(null)}
        >
          <Text
            style={[
              styles.filterChipText,
              { color: selectedCatFilter === null ? '#FFF' : theme.text },
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        {categories.map((c) => {
          const isSelected = selectedCatFilter === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.filterChip,
                isSelected
                  ? { backgroundColor: c.colorHex, borderColor: c.colorHex }
                  : { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={() => setSelectedCatFilter(isSelected ? null : c.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: isSelected ? '#FFF' : theme.text },
                ]}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Transaction List Header */}
      <View style={styles.txListHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Lịch sử giao dịch ({filteredList.length})
        </Text>
        <TouchableOpacity onPress={onAddNew} style={[styles.addBtnSmall, { backgroundColor: theme.primary }]}>
          <MaterialIcons name="add" size={18} color="#FFF" />
          <Text style={styles.addBtnSmallText}>Thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      {filteredList.length === 0 ? (
        <View style={styles.emptyWrap}>
          <MaterialIcons name="receipt-long" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Không có giao dịch nào trong khoảng thời gian này
          </Text>
        </View>
      ) : (
        filteredList.map((tx) => (
          <TransactionItem
            key={tx.id}
            transaction={tx}
            category={categoryMap.get(tx.categoryId)}
            wallet={walletMap.get(tx.walletId)}
            theme={theme}
            onPressEdit={() => onEditTransaction(tx)}
            onPressDelete={() => onDeleteTransaction(tx)}
          />
        ))
      )}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isTablet && styles.tabletContainer,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {isTablet ? (
        <View style={styles.tabletRow}>
          {renderLeftPanel()}
          {renderRightPanel()}
        </View>
      ) : (
        <>
          {renderLeftPanel()}
          {renderRightPanel()}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 90,
  },
  tabletContainer: {
    padding: 24,
  },
  tabletRow: {
    flexDirection: 'row',
    gap: 24,
  },
  tabletLeftCol: {
    flex: 5,
  },
  tabletRightCol: {
    flex: 7,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  navArrowBtn: {
    padding: 6,
  },
  monthLabelWrap: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  walletsScroll: {
    gap: 12,
    paddingBottom: 4,
  },
  walletCard: {
    width: 170,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 4,
  },
  walletIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  walletName: {
    fontSize: 13,
    fontWeight: '600',
  },
  walletBalance: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 18,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  categoryFilterRow: {
    gap: 8,
    marginBottom: 18,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  txListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  addBtnSmallText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
