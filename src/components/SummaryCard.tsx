import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatVnd } from '../utils/currency';
import { Theme } from '../constants/theme';

interface Props {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  theme: Theme;
}

export const SummaryCard: React.FC<Props> = ({
  totalIncome,
  totalExpense,
  netBalance,
  theme,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      {/* Net Balance Main Card */}
      <View style={styles.netBalanceRow}>
        <View>
          <Text style={[styles.netBalanceLabel, { color: theme.textSecondary }]}>
            Số dư còn lại (Tháng)
          </Text>
          <Text
            style={[
              styles.netBalanceValue,
              { color: netBalance >= 0 ? theme.income : theme.expense },
            ]}
          >
            {formatVnd(netBalance)}
          </Text>
        </View>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: netBalance >= 0 ? theme.incomeBg : theme.expenseBg },
          ]}
        >
          <MaterialIcons
            name={netBalance >= 0 ? 'trending-up' : 'trending-down'}
            size={28}
            color={netBalance >= 0 ? theme.income : theme.expense}
          />
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* Income & Expense columns */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <View style={styles.detailHeader}>
            <View style={[styles.dot, { backgroundColor: theme.income }]} />
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Tổng Thu</Text>
          </View>
          <Text style={[styles.incomeText, { color: theme.income }]}>
            {formatVnd(totalIncome, true, 'INCOME')}
          </Text>
        </View>

        <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />

        <View style={styles.detailItem}>
          <View style={styles.detailHeader}>
            <View style={[styles.dot, { backgroundColor: theme.expense }]} />
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Tổng Chi</Text>
          </View>
          <Text style={[styles.expenseText, { color: theme.expense }]}>
            {formatVnd(totalExpense, true, 'EXPENSE')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  netBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netBalanceLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  netBalanceValue: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detailLabel: {
    fontSize: 13,
  },
  incomeText: {
    fontSize: 17,
    fontWeight: '700',
  },
  expenseText: {
    fontSize: 17,
    fontWeight: '700',
  },
  verticalDivider: {
    width: 1,
    marginHorizontal: 16,
  },
});
