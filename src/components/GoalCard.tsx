import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Goal, Wallet } from '../types';
import { formatVnd } from '../utils/currency';
import { Theme } from '../constants/theme';

interface Props {
  goal: Goal;
  linkedWallet?: Wallet;
  currentBalance: number;
  theme: Theme;
  onDelete: () => void;
}

export const GoalCard: React.FC<Props> = ({
  goal,
  linkedWallet,
  currentBalance,
  theme,
  onDelete,
}) => {
  const percent = Math.min(
    Math.round((currentBalance / (goal.targetAmount || 1)) * 100),
    100
  );
  const isCompleted = percent >= 100;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={styles.header}>
        <View style={styles.titleInfo}>
          <Text style={[styles.title, { color: theme.text }]}>{goal.name}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Ví nguồn: {linkedWallet?.name || 'Chưa liên kết'}
          </Text>
        </View>

        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <MaterialIcons name="delete-outline" size={20} color={theme.expense} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarBg, { backgroundColor: theme.surfaceVariant }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.max(percent, 0)}%`,
              backgroundColor: isCompleted ? theme.income : theme.primary,
            },
          ]}
        />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Text style={[styles.balanceText, { color: theme.text }]}>
          Hiện có: <Text style={{ fontWeight: '700' }}>{formatVnd(currentBalance)}</Text>
        </Text>
        <Text style={[styles.targetText, { color: theme.textSecondary }]}>
          Mục tiêu: {formatVnd(goal.targetAmount)}
        </Text>
      </View>

      <View style={styles.percentBadge}>
        <Text
          style={[
            styles.percentText,
            { color: isCompleted ? theme.income : theme.primary },
          ]}
        >
          {isCompleted ? '✓ Đã hoàn thành' : `Đạt ${percent}%`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 13,
  },
  targetText: {
    fontSize: 13,
  },
  percentBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
