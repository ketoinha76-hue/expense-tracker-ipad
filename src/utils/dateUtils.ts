export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // 1 - 12
  };
}

export function getMonthStart(year: number, month: number): number {
  return new Date(year, month - 1, 1, 0, 0, 0, 0).getTime();
}

export function getMonthEnd(year: number, month: number): number {
  return new Date(year, month, 0, 23, 59, 59, 999).getTime();
}

export function getYearStart(year: number): number {
  return new Date(year, 0, 1, 0, 0, 0, 0).getTime();
}

export function getYearEnd(year: number): number {
  return new Date(year, 11, 31, 23, 59, 59, 999).getTime();
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatDateOnly(timestamp: number): string {
  const d = new Date(timestamp);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
