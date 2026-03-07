import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isPast, parseISO } from "date-fns"
import { id } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy", { locale: id });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd MMM", { locale: id });
  } catch {
    return dateStr;
  }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function isOverdue(dateStr: string): boolean {
  try {
    return isPast(parseISO(dateStr));
  } catch {
    return false;
  }
}
export const STATUS_WEIGHTS: Record<string, number> = {
  todo: 10,
  "in-progress": 50,
  review: 85,
  done: 100,
};

export function calculateProgress(tasks: Array<{ status: string }>): number {
  if (tasks.length === 0) return 0;
  const totalWeight = tasks.reduce((sum, task) => sum + (STATUS_WEIGHTS[task.status] || 0), 0);
  return Math.round(totalWeight / tasks.length);
}
