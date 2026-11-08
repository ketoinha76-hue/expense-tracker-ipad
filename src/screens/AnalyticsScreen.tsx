import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Transaction, Category, CategorySummaryItem, DailySummaryItem, MonthlySummaryItem } from '../types';
import { PieChartDonut } from '../components/PieChartDonut';
import { BarChartTrend } from '../components/BarChartTrend';
import { formatVnd } from '../utils/currency';
import { Theme } from '../constants/theme';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  selectedYear: number;
  selectedMonth: number;
  theme: Theme;
}

export const AnalyticsScreen: React.FC<Props> = ({
  transactions,
  categories,
  selectedYear,
  selectedMonth,
  theme,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [period, setPeriod] = useState<'MONTH' | 'YEAR'>('MONTH');
  const [breakdownType, setBreakdownType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // 1. Transactions in Scope
  const scopedTransactions = transactions.filter((t) => {
    const d = new Date(t.timestamp);
    if (period === 'MONTH') {
      return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
    } else {
      return d.getFullYear() === selectedYear;
    }
  });

  const totalExpense = scopedTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0);

  const totalIncome = scopedTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0);

  // 2. Category Breakdown
  const targetType = breakdownType;
  const targetTotal = targetType === 'EXPENSE' ? totalExpense : totalIncome;
  const targetTx = scopedTransactions.filter((t) => t.type === targetType);

  const groupMap = new Map<number, number>();
  for (const tx of targetTx) {
    groupMap.set(tx.categoryId, (groupMap.get(tx.categoryId) || 0) + tx.amount);
  }

  const breakdownData: CategorySummaryItem[] = [];
  groupMap.forEach((amt, catId) => {
    const cat = categoryMap.get(catId);
    if (cat) {
      breakdownData.push({
        category: cat,
        totalAmount: amt,
        percentage: targetTotal > 0 ? (amt / targetTotal) * 100 : 0,
      });
    }
  });
  breakdownData.sort((a, b) => b.totalAmount - a.totalAmount);

  // 3. Daily Breakdown for selected month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dailyMap = new Map<number, number>();
  for (const tx of scopedTransactions.filter((t) => t.type === 'EXPENSE')) {
    const d = new Date(tx.timestamp).getDate();
    dailyMap.set(d, (dailyMap.get(d) || 0) + tx.amount);
  }
  const dailyData: DailySummaryItem[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dailyData.push({
      day: d,
      dayLabel: `${d}`,
      amount: dailyMap.get(d) || 0,
    });
  }

  // 4. Monthly Breakdown for selected year
  const monthlyData: MonthlySummaryItem[] = [];
  for (let m = 1; m <= 12; m++) {
    const mIncome = transactions
      .filter((t) => {
        const d = new Date(t.timestamp);
        return d.getFullYear() === selectedYear && d.getMonth() + 1 === m && t.type === 'INCOME';
      })
      .reduce((s, t) => s + t.amount, 0);

    const mExpense = transactions
      .filter((t) => {
        const d = new Date(t.timestamp);
        return d.getFullYear() === selectedYear && d.getMonth() + 1 === m && t.type === 'EXPENSE';
      })
      .reduce((s, t) => s + t.amount, 0);

    monthlyData.push({
      month: m,
      monthLabel: `T${m}`,
      income: mIncome,
      expense: mExpense,
    });
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isTablet && styles.tabletContainer,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Period Tabs: Tháng / Năm */}
      <View style={[styles.periodSwitch, { backgroundColor: theme.surfaceVariant }]}>
        <TouchableOpacity
          style={[
            styles.periodBtn,
            period === 'MONTH' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setPeriod('MONTH')}
        >
          <Text
            style={[
              styles.periodBtnText,
              { color: period === 'MONTH' ? '#FFF' : theme.textSecondary },
            ]}
          >
            Tháng {selectedMonth}/{selectedYear}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.periodBtn,
            period === 'YEAR' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setPeriod('YEAR')}
        >
          <Text
            style={[
              styles.periodBtnText,
              { color: period === 'YEAR' ? '#FFF' : theme.textSecondary },
            ]}
          >
            Năm {selectedYear}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid on iPad, Stack on phone */}
      <View style={isTablet ? styles.tabletGrid : null}>
        {/* Section 1: Donut Chart & Category Breakdown */}
        <View style={[styles.card, isTablet && styles.tabletCol, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Cơ Cấu Thu Chi</Text>

            {/* Switch Chi Tiêu / Thu Nhập */}
            <View style={[styles.typePillWrap, { backgroundColor: theme.surfaceVariant }]}>
              <TouchableOpacity
                onPress={() => setBreakdownType('EXPENSE')}
                style={[
                  styles.typePill,
                  breakdownType === 'EXPENSE' && { backgroundColor: theme.expense },
                ]}
              >
                <Text
                  style={[
                    styles.typePillText,
                    { color: breakdownType === 'EXPENSE' ? '#FFF' : theme.textSecondary },
                  ]}
                >
                  Chi tiêu
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setBreakdownType('INCOME')}
                style={[
                  styles.typePill,
                  breakdownType === 'INCOME' && { backgroundColor: theme.income },
                ]}
              >
                <Text
                  style={[
                    styles.typePillText,
                    { color: breakdownType === 'INCOME' ? '#FFF' : theme.textSecondary },
                  ]}
                >
                  Thu nhập
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <PieChartDonut
            data={breakdownData}
            totalAmount={targetTotal}
            theme={theme}
            size={isTablet ? 240 : 200}
          />
        </View>

        {/* Section 2: Trend Bar Chart */}
        <View style={[styles.card, isTablet && styles.tabletCol, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 12 }]}>
            {period === 'MONTH'
              ? `Biến động chi tiêu từng ngày (Tháng ${selectedMonth})`
              : `Xu hướng thu - chi 12 tháng (Năm ${selectedYear})`}
          </Text>

          <BarChartTrend
            type={period === 'MONTH' ? 'DAILY' : 'MONTHLY'}
            dailyData={dailyData}
            monthlyData={monthlyData}
            theme={theme}
          />

          <View style={[styles.summaryStatRow, { borderTopColor: theme.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Tổng Thu</Text>
              <Text style={[styles.statValue, { color: theme.income }]}>{formatVnd(totalIncome)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Tổng Chi</Text>
              <Text style={[styles.statValue, { color: theme.expense }]}>{formatVnd(totalExpense)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Tiết Kiệm Ròng</Text>
              <Text
                style={[
                  styles.statValue,
                  { color: totalIncome - totalExpense >= 0 ? theme.primary : theme.expense },
                ]}
              >
                {formatVnd(totalIncome - totalExpense)}
              </Text>
            </View>
          </View>
        </View>
      </View>
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
  periodSwitch: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  periodBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tabletGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  tabletCol: {
    flex: 1,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  typePillWrap: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 2,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 18,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 16,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },
});
