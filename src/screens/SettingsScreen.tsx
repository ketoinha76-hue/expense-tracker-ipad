import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Category, Wallet, TransactionType } from '../types';
import { formatVnd, parseAmount } from '../utils/currency';
import { Theme } from '../constants/theme';

interface Props {
  wallets: Wallet[];
  categories: Category[];
  isDarkMode: boolean;
  theme: Theme;
  onToggleDarkMode: (value: boolean) => void;
  onAddWallet: (wallet: Omit<Wallet, 'id'>) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onResetData: () => void;
  onLoadSampleData: () => void;
}

export const SettingsScreen: React.FC<Props> = ({
  wallets,
  categories,
  isDarkMode,
  theme,
  onToggleDarkMode,
  onAddWallet,
  onAddCategory,
  onResetData,
  onLoadSampleData,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Wallet Modal
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletBalanceRaw, setWalletBalanceRaw] = useState('');

  // Category Modal
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<TransactionType>('EXPENSE');

  const handleSaveWallet = () => {
    if (!walletName.trim()) {
      alert('Vui lòng nhập tên ví');
      return;
    }
    const colors = ['#2563EB', '#16A34A', '#DC2626', '#D97706', '#9333EA', '#0D9488'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    onAddWallet({
      name: walletName.trim(),
      colorHex: randomColor,
      iconName: 'account-balance-wallet',
      initialBalance: parseAmount(walletBalanceRaw),
    });
    setWalletName('');
    setWalletBalanceRaw('');
    setWalletModalVisible(false);
  };

  const handleSaveCategory = () => {
    if (!catName.trim()) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }
    const colors = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#6366F1', '#EC4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    onAddCategory({
      name: catName.trim(),
      type: catType,
      colorHex: randomColor,
      iconName: catType === 'INCOME' ? 'attach-money' : 'shopping-cart',
    });
    setCatName('');
    setCatModalVisible(false);
  };

  const confirmReset = () => {
    Alert.alert(
      'Khôi phục mặc định',
      'Bạn có chắc chắn muốn xóa tất cả giao dịch và đưa cài đặt về ban đầu?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa sạch', style: 'destructive', onPress: onResetData },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isTablet && styles.tabletContainer,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={isTablet ? styles.tabletGrid : null}>
        {/* Left Column / Section 1 */}
        <View style={isTablet ? styles.tabletCol : null}>
          {/* Theme Settings */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Giao Diện & Hiển Thị</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingTextWrap}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Chế độ nền tối (Dark Mode)</Text>
                <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                  Bảo vệ mắt khi sử dụng iPad vào ban đêm
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={onToggleDarkMode}
                trackColor={{ false: '#CBD5E1', true: theme.primary }}
              />
            </View>
          </View>

          {/* Wallets Management */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Danh Sách Nguồn Tiền ({wallets.length})</Text>
              <TouchableOpacity onPress={() => setWalletModalVisible(true)} style={styles.addSmallBtn}>
                <MaterialIcons name="add" size={18} color={theme.primary} />
                <Text style={[styles.addSmallBtnText, { color: theme.primary }]}>Thêm Ví</Text>
              </TouchableOpacity>
            </View>

            {wallets.map((w) => (
              <View key={w.id} style={[styles.listItem, { borderBottomColor: theme.border }]}>
                <View style={[styles.itemDot, { backgroundColor: w.colorHex }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: theme.text }]}>{w.name}</Text>
                  <Text style={[styles.itemSub, { color: theme.textSecondary }]}>
                    Số dư ban đầu: {formatVnd(w.initialBalance)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Right Column / Section 2 */}
        <View style={isTablet ? styles.tabletCol : null}>
          {/* Categories Management */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Danh Mục Thu & Chi</Text>
              <TouchableOpacity onPress={() => setCatModalVisible(true)} style={styles.addSmallBtn}>
                <MaterialIcons name="add" size={18} color={theme.primary} />
                <Text style={[styles.addSmallBtnText, { color: theme.primary }]}>Thêm</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.catChipsWrap}>
              {categories.map((c) => (
                <View
                  key={c.id}
                  style={[
                    styles.catBadge,
                    { backgroundColor: theme.surfaceVariant, borderColor: c.colorHex },
                  ]}
                >
                  <View style={[styles.catBadgeDot, { backgroundColor: c.colorHex }]} />
                  <Text style={[styles.catBadgeText, { color: theme.text }]}>
                    {c.name} ({c.type === 'INCOME' ? 'Thu' : 'Chi'})
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Database & Data Management */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Dữ Liệu & Thử Nghiệm</Text>

            <TouchableOpacity
              style={[styles.actionRowBtn, { backgroundColor: theme.primaryLight }]}
              onPress={onLoadSampleData}
            >
              <MaterialIcons name="auto-fix-high" size={20} color={theme.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.actionRowTitle, { color: theme.primary }]}>Nạp dữ liệu mẫu trải nghiệm</Text>
                <Text style={[styles.actionRowSub, { color: theme.textSecondary }]}>
                  Tự động thêm các giao dịch và biểu đồ mẫu để xem trước
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionRowBtn, { backgroundColor: theme.expenseBg, marginTop: 12 }]}
              onPress={confirmReset}
            >
              <MaterialIcons name="delete-forever" size={20} color={theme.expense} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.actionRowTitle, { color: theme.expense }]}>Xóa toàn bộ & Khôi phục gốc</Text>
                <Text style={[styles.actionRowSub, { color: theme.textSecondary }]}>
                  Xóa tất cả các giao dịch đã ghi và đưa về mặc định
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Add Wallet Modal */}
      <Modal visible={walletModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Thêm Nguồn Tiền Mới</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.surfaceVariant, color: theme.text }]}
              placeholder="Tên ví (Ví dụ: Thẻ Techcombank...)"
              placeholderTextColor={theme.textSecondary}
              value={walletName}
              onChangeText={setWalletName}
            />
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.surfaceVariant, color: theme.text, marginTop: 12 }]}
              placeholder="Số dư ban đầu (0 ₫)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={walletBalanceRaw ? parseAmount(walletBalanceRaw).toLocaleString('vi-VN') : ''}
              onChangeText={(t) => setWalletBalanceRaw(t.replace(/[^0-9]/g, ''))}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setWalletModalVisible(false)}>
                <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]} onPress={handleSaveWallet}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Category Modal */}
      <Modal visible={catModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Thêm Danh Mục Mới</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.surfaceVariant, color: theme.text }]}
              placeholder="Tên danh mục (Ví dụ: Mua sách...)"
              placeholderTextColor={theme.textSecondary}
              value={catName}
              onChangeText={setCatName}
            />

            <View style={styles.catTypeSwitch}>
              <TouchableOpacity
                style={[styles.catTypePill, catType === 'EXPENSE' && { backgroundColor: theme.expense }]}
                onPress={() => setCatType('EXPENSE')}
              >
                <Text style={{ color: catType === 'EXPENSE' ? '#FFF' : theme.textSecondary, fontWeight: '700' }}>
                  Chi Tiêu
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.catTypePill, catType === 'INCOME' && { backgroundColor: theme.income }]}
                onPress={() => setCatType('INCOME')}
              >
                <Text style={{ color: catType === 'INCOME' ? '#FFF' : theme.textSecondary, fontWeight: '700' }}>
                  Thu Nhập
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setCatModalVisible(false)}>
                <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]} onPress={handleSaveCategory}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Thêm</Text>
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
  tabletGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  tabletCol: {
    flex: 1,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  addSmallBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  catChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  catBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  catBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  actionRowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionRowSub: {
    fontSize: 12,
    marginTop: 2,
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
    maxWidth: 440,
    borderRadius: 24,
    padding: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  modalInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  catTypeSwitch: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  catTypePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
});
