import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Transaction, Category, Wallet } from '../types';
import { formatVnd } from '../utils/currency';
import { formatDate } from '../utils/dateUtils';
import { Theme } from '../constants/theme';

interface Props {
  transaction: Transaction;
  category?: Category;
  wallet?: Wallet;
  theme: Theme;
  onPressEdit: () => void;
  onPressDelete: () => void;
}

export const TransactionItem: React.FC<Props> = ({
  transaction,
  category,
  wallet,
  theme,
  onPressEdit,
  onPressDelete,
}) => {
  const isIncome = transaction.type === 'INCOME';
  const categoryColor = category?.colorHex || (isIncome ? theme.income : theme.expense);
  const iconName = (category?.iconName || (isIncome ? 'attach-money' : 'receipt')) as any;

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      {/* Icon Circle */}
      <View style={[styles.iconCircle, { backgroundColor: categoryColor + '20' }]}>
        <MaterialIcons name={iconName} size={24} color={categoryColor} />
      </View>

      {/* Center Details */}
      <View style={styles.centerCol}>
        <Text style={[styles.categoryName, { color: theme.text }]} numberOfLines={1}>
          {category?.name || 'Chưa phân loại'}
        </Text>
        {transaction.note ? (
          <Text style={[styles.noteText, { color: theme.textSecondary }]} numberOfLines={1}>
            {transaction.note}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {wallet?.name || 'Ví'} • {formatDate(transaction.timestamp)}
          </Text>
        </View>
      </View>

      {/* Right Amount & Actions */}
      <View style={styles.rightCol}>
        <Text
          style={[
            styles.amountText,
            { color: isIncome ? theme.income : theme.expense },
          ]}
        >
          {formatVnd(transaction.amount, true, transaction.type)}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={onPressEdit} style={styles.smallActionBtn} hitSlop={8}>
            <MaterialIcons name="edit" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressDelete} style={styles.smallActionBtn} hitSlop={8}>
            <MaterialIcons name="delete-outline" size={18} color={theme.expense} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  centerCol: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
  },
  noteText: {
    fontSize: 13,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  metaText: {
    fontSize: 11,
  },
  rightCol: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  smallActionBtn: {
    padding: 2,
  },
});
