import { Category, Wallet } from '../types';

export const DEFAULT_WALLETS: Wallet[] = [
  {
    id: 1,
    name: 'Tiền mặt',
    colorHex: '#2E7D32',
    iconName: 'account-balance-wallet',
    initialBalance: 0,
  },
  {
    id: 2,
    name: 'Ngân hàng Vietcombank',
    colorHex: '#1976D2',
    iconName: 'account-balance',
    initialBalance: 0,
  },
  {
    id: 3,
    name: 'Ví Momo',
    colorHex: '#D81B60',
    iconName: 'payment',
    initialBalance: 0,
  },
];

export const DEFAULT_CATEGORIES: Category[] = [
  // Chi tiêu (EXPENSE)
  { id: 1, name: 'Ăn uống', type: 'EXPENSE', colorHex: '#FF5722', iconName: 'restaurant' },
  { id: 2, name: 'Xăng xe / Đi lại', type: 'EXPENSE', colorHex: '#2196F3', iconName: 'directions-car' },
  { id: 3, name: 'Mua sắm', type: 'EXPENSE', colorHex: '#E91E63', iconName: 'shopping-cart' },
  { id: 4, name: 'Hóa đơn & Tiện ích', type: 'EXPENSE', colorHex: '#FF9800', iconName: 'receipt' },
  { id: 5, name: 'Giải trí', type: 'EXPENSE', colorHex: '#9C27B0', iconName: 'sports-esports' },
  { id: 6, name: 'Sức khỏe & Y tế', type: 'EXPENSE', colorHex: '#009688', iconName: 'local-hospital' },
  { id: 7, name: 'Giáo dục / Học tập', type: 'EXPENSE', colorHex: '#3F51B5', iconName: 'school' },
  { id: 8, name: 'Tiền nhà / Thuê trọ', type: 'EXPENSE', colorHex: '#795548', iconName: 'home' },
  { id: 9, name: 'Cà phê & Trà sữa', type: 'EXPENSE', colorHex: '#6D4C41', iconName: 'local-cafe' },
  { id: 10, name: 'Chi tiêu khác', type: 'EXPENSE', colorHex: '#78909C', iconName: 'category' },

  // Thu nhập (INCOME)
  { id: 11, name: 'Tiền lương', type: 'INCOME', colorHex: '#4CAF50', iconName: 'work' },
  { id: 12, name: 'Tiền thưởng', type: 'INCOME', colorHex: '#00C853', iconName: 'card-giftcard' },
  { id: 13, name: 'Đầu tư / Lãi suất', type: 'INCOME', colorHex: '#8BC34A', iconName: 'trending-up' },
  { id: 14, name: 'Phụ cấp', type: 'INCOME', colorHex: '#FFB300', iconName: 'attach-money' },
  { id: 15, name: 'Thu nhập khác', type: 'INCOME', colorHex: '#66BB6A', iconName: 'category' },
];
