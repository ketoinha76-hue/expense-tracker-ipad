import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Goal, Wallet } from '../types';
import { GoalCard } from '../components/GoalCard';
import { parseAmount } from '../utils/currency';
import { Theme } from '../constants/theme';

interface Props {
  goals: Goal[];
  wallets: Wallet[];
  walletBalances: Record<number, number>;
  theme: Theme;
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdTimestamp'>) => void;
  onDeleteGoal: (goalId: number) => void;
}

export const GoalsScreen: React.FC<Props> = ({
  goals,
  wallets,
  walletBalances,
  theme,
  onAddGoal,
  onDeleteGoal,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [targetAmountRaw, setTargetAmountRaw] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<number>(wallets[0]?.id || 1);

  const walletMap = new Map(wallets.map((w) => [w.id, w]));

  const handleSaveGoal = () => {
    const target = parseAmount(targetAmountRaw);
    if (!name.trim()) {
      alert('Vui lòng nhập tên mục tiêu');
      return;
    }
    if (target <= 0) {
      alert('Vui lòng nhập số tiền mục tiêu lớn hơn 0');
      return;
    }
    onAddGoal({
      name: name.trim(),
      targetAmount: target,
      walletId: selectedWalletId,
      note: '',
    });
    setName('');
    setTargetAmountRaw('');
    setModalVisible(false);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isTablet && styles.tabletContainer,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.heading, { color: theme.text }]}>Mục Tiêu Tiết Kiệm</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Theo dõi tiến trình tích lũy tài chính
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add" size={20} color="#FFF" />
          <Text style={styles.addBtnText}>Mục tiêu mới</Text>
        </TouchableOpacity>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="savings" size={54} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Chưa có mục tiêu nào</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Hãy đặt ra mục tiêu tiết kiệm đầu tiên (Ví dụ: Mua xe, Quỹ du lịch, iPad mới...)
          </Text>
        </View>
      ) : (
        <View style={isTablet ? styles.tabletGrid : null}>
          {goals.map((g) => (
            <View key={g.id} style={isTablet ? styles.tabletCol : null}>
              <GoalCard
                goal={g}
                linkedWallet={walletMap.get(g.walletId)}
                currentBalance={walletBalances[g.walletId] ?? 0}
                theme={theme}
                onDelete={() => onDeleteGoal(g.id)}
              />
            </View>
          ))}
        </View>
      )}

      {/* Add Goal Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Tạo Mục Tiêu Tiết Kiệm</Text>

            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Tên mục tiêu</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.surfaceVariant, color: theme.text }]}
                placeholder="Ví dụ: Mua iPhone mới, Quỹ học phí..."
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Số tiền mục tiêu</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.surfaceVariant, color: theme.text }]}
                placeholder="0 ₫"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={
                  parseAmount(targetAmountRaw) > 0
                    ? parseAmount(targetAmountRaw).toLocaleString('vi-VN')
                    : ''
                }
                onChangeText={(t) => setTargetAmountRaw(t.replace(/[^0-9]/g, ''))}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Liên kết ví tài khoản</Text>
              <View style={styles.walletRow}>
                {wallets.map((w) => {
                  const isSelected = selectedWalletId === w.id;
                  return (
                    <TouchableOpacity
                      key={w.id}
                      style={[
                        styles.walletPill,
                        {
                          backgroundColor: isSelected ? theme.primaryLight : theme.surfaceVariant,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setSelectedWalletId(w.id)}
                    >
                      <Text
                        style={[
                          styles.walletPillText,
                          { color: isSelected ? theme.primary : theme.text },
                        ]}
                      >
                        {w.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveGoal}
              >
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Tạo Mục Tiêu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
  },
  subheading: {
    fontSize: 13,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 320,
  },
  tabletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tabletCol: {
    width: '48.5%',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 18,
  },
  inputWrap: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  walletRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  walletPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  walletPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
});
