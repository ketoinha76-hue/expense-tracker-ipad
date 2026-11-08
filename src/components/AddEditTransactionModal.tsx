import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Transaction, TransactionType, Category, Wallet } from '../types';
import { formatVnd, parseAmount } from '../utils/currency';
import { Theme } from '../constants/theme';

interface Props {
  visible: boolean;
  editingTransaction?: Transaction | null;
  categories: Category[];
  wallets: Wallet[];
  theme: Theme;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: number }) => void;
}

export const AddEditTransactionModal: React.FC<Props> = ({
  visible,
  editingTransaction,
  categories,
  wallets,
  theme,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amountRaw, setAmountRaw] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [note, setNote] = useState<string>('');
  const [timestamp, setTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountRaw(editingTransaction.amount.toString());
      setSelectedCategoryId(editingTransaction.categoryId);
      setSelectedWalletId(editingTransaction.walletId);
      setNote(editingTransaction.note);
      setTimestamp(editingTransaction.timestamp);
    } else {
      setType('EXPENSE');
      setAmountRaw('');
      const defaultCat = categories.find((c) => c.type === 'EXPENSE');
      setSelectedCategoryId(defaultCat?.id || (categories[0]?.id ?? null));
      setSelectedWalletId(wallets[0]?.id ?? null);
      setNote('');
      setTimestamp(Date.now());
    }
  }, [editingTransaction, visible, categories, wallets]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstCat = categories.find((c) => c.type === newType);
    if (firstCat) {
      setSelectedCategoryId(firstCat.id);
    }
  };

  const handleAmountChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    setAmountRaw(clean);
  };

  const handleSave = () => {
    const amount = parseAmount(amountRaw);
    if (amount <= 0) {
      alert('Vui lòng nhập số tiền lớn hơn 0');
      return;
    }
    if (!selectedCategoryId) {
      alert('Vui lòng chọn danh mục');
      return;
    }
    if (!selectedWalletId) {
      alert('Vui lòng chọn ví thanh toán');
      return;
    }

    onSave({
      id: editingTransaction?.id,
      amount,
      type,
      categoryId: selectedCategoryId,
      walletId: selectedWalletId,
      note,
      timestamp,
    });
    onClose();
  };

  const availableCategories = categories.filter((c) => c.type === type);
  const numericAmount = parseAmount(amountRaw);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              {editingTransaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Type Selector (Chi tiêu / Thu nhập) */}
          <View style={[styles.segmentedContainer, { backgroundColor: theme.surfaceVariant }]}>
            <TouchableOpacity
              style={[
                styles.segmentItem,
                type === 'EXPENSE' && { backgroundColor: theme.expense },
              ]}
              onPress={() => handleTypeChange('EXPENSE')}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: type === 'EXPENSE' ? '#FFF' : theme.textSecondary },
                ]}
              >
                Chi Tiêu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentItem,
                type === 'INCOME' && { backgroundColor: theme.income },
              ]}
              onPress={() => handleTypeChange('INCOME')}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: type === 'INCOME' ? '#FFF' : theme.textSecondary },
                ]}
              >
                Thu Nhập
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
            {/* Amount Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Số tiền</Text>
              <View style={[styles.amountInputWrap, { borderColor: theme.border }]}>
                <TextInput
                  style={[
                    styles.amountInput,
                    { color: type === 'INCOME' ? theme.income : theme.expense },
                  ]}
                  value={numericAmount > 0 ? numericAmount.toLocaleString('vi-VN') : ''}
                  placeholder="0 ₫"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  onChangeText={handleAmountChange}
                />
              </View>
            </View>

            {/* Category Selector */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Danh mục</Text>
              <View style={styles.chipRow}>
                {availableCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected ? cat.colorHex : theme.surfaceVariant,
                          borderColor: isSelected ? cat.colorHex : theme.border,
                        },
                      ]}
                      onPress={() => setSelectedCategoryId(cat.id)}
                    >
                      <MaterialIcons
                        name={cat.iconName as any}
                        size={18}
                        color={isSelected ? '#FFF' : cat.colorHex}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          { color: isSelected ? '#FFF' : theme.text },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Wallet Selector */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Ví / Tài khoản</Text>
              <View style={styles.chipRow}>
                {wallets.map((w) => {
                  const isSelected = selectedWalletId === w.id;
                  return (
                    <TouchableOpacity
                      key={w.id}
                      style={[
                        styles.walletChip,
                        {
                          backgroundColor: isSelected ? theme.primaryLight : theme.surfaceVariant,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setSelectedWalletId(w.id)}
                    >
                      <MaterialIcons
                        name={w.iconName as any}
                        size={18}
                        color={isSelected ? theme.primary : theme.textSecondary}
                      />
                      <Text
                        style={[
                          styles.walletChipText,
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

            {/* Note Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Ghi chú</Text>
              <TextInput
                style={[
                  styles.noteInput,
                  { backgroundColor: theme.surfaceVariant, color: theme.text, borderColor: theme.border },
                ]}
                value={note}
                placeholder="Nhập ghi chú (ví dụ: Ăn trưa với đồng nghiệp...)"
                placeholderTextColor={theme.textSecondary}
                onChangeText={setNote}
              />
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[styles.btnText, { color: theme.textSecondary }]}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: type === 'INCOME' ? theme.income : theme.expense },
              ]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>Lưu Giao Dịch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentText: {
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    maxHeight: 460,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountInputWrap: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  walletChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
