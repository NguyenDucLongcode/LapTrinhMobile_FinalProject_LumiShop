// utils/dateHelpers.ts
// Tiện ích xử lý ngày tháng với date-fns — Timezone-safe

import {
  formatDistanceToNow,
  differenceInHours,
  differenceInMinutes,
  format,
  isPast,
  isWithinInterval,
  addHours,
  parseISO,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { AssignmentStatus } from '../types';

export type UrgencyLevel = 'overdue' | 'urgent' | 'normal' | 'completed';

/**
 * Tính thời gian còn lại tới deadline
 * VD: "Còn 2 ngày 5 giờ", "Đã quá hạn 3 giờ"
 */
export function getTimeRemaining(dueAt: string): string {
  const due = parseISO(dueAt);
  const now = new Date();

  if (isPast(due)) {
    const hoursAgo = Math.abs(differenceInHours(due, now));
    if (hoursAgo < 1) {
      const minsAgo = Math.abs(differenceInMinutes(due, now));
      return `Quá hạn ${minsAgo} phút`;
    }
    if (hoursAgo < 24) return `Quá hạn ${hoursAgo} giờ`;
    const daysAgo = Math.floor(hoursAgo / 24);
    return `Quá hạn ${daysAgo} ngày`;
  }

  const totalHours = differenceInHours(due, now);
  if (totalHours < 1) {
    const mins = differenceInMinutes(due, now);
    return `Còn ${mins} phút`;
  }
  if (totalHours < 24) {
    return `Còn ${totalHours} giờ`;
  }
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;
  if (remainingHours === 0) return `Còn ${days} ngày`;
  return `Còn ${days} ngày ${remainingHours} giờ`;
}

/**
 * Format ngày tháng đẹp kiểu Việt Nam
 * VD: "Hạn: 25/10 - Còn 2 ngày"
 */
export function formatDueDate(dueAt: string): string {
  const due = parseISO(dueAt);
  const dateStr = format(due, 'dd/MM');
  const remaining = getTimeRemaining(dueAt);
  return `Hạn: ${dateStr} – ${remaining}`;
}

/**
 * Format ngày đầy đủ
 * VD: "25/10/2026 23:59"
 */
export function formatFullDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'dd/MM/yyyy HH:mm');
}

/**
 * Format relative time
 * VD: "2 ngày trước"
 */
export function formatRelative(dateStr: string): string {
  const date = parseISO(dateStr);
  return formatDistanceToNow(date, { addSuffix: true, locale: vi });
}

/**
 * Kiểm tra deadline trong vòng 48h tới
 */
export function isDueWithin48h(dueAt: string): boolean {
  const due = parseISO(dueAt);
  const now = new Date();
  const in48h = addHours(now, 48);
  return !isPast(due) && isWithinInterval(due, { start: now, end: in48h });
}

/**
 * Kiểm tra đã quá hạn chưa
 */
export function isOverdue(dueAt: string): boolean {
  return isPast(parseISO(dueAt));
}

/**
 * Format ngày cho calendar (YYYY-MM-DD)
 */
export function toCalendarDate(dueAt: string): string {
  return format(parseISO(dueAt), 'yyyy-MM-dd');
}

/**
 * Lấy urgency level cho styling
 */
export function getUrgencyLevel(dueAt: string, status: AssignmentStatus): UrgencyLevel {
  if (status === 'completed') return 'completed';
  if (isOverdue(dueAt)) return 'overdue';
  if (isDueWithin48h(dueAt)) return 'urgent';
  return 'normal';
}
