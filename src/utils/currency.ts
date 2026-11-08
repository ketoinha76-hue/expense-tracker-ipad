import { TransactionType } from '../types';

export function formatVnd(
  amount: number,
  showPrefix: boolean = false,
  type?: TransactionType | null
): string {
  const absAmount = Math.abs(amount || 0);
  const formattedNumber = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  let sign = '';
  if (showPrefix && type) {
    sign = type === 'INCOME' ? '+ ' : '- ';
  }
  return `${sign}${formattedNumber} ₫`;
}

export function parseAmount(text: string): number {
  const cleanString = text.replace(/[^0-9]/g, '');
  return parseInt(cleanString, 10) || 0;
}
