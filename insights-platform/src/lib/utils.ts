import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getNextRunTime(cadence: string, lastRun?: Date): Date {
  const now = new Date();
  const base = lastRun || now;
  
  switch (cadence) {
    case 'hourly':
      return new Date(base.getTime() + 60 * 60 * 1000);
    case 'every 12 hours':
      return new Date(base.getTime() + 12 * 60 * 60 * 1000);
    case 'daily':
      return new Date(base.getTime() + 24 * 60 * 60 * 1000);
    default:
      return now;
  }
}

export function getCronExpression(cadence: string): string | null {
  switch (cadence) {
    case 'hourly':
      return '0 * * * *';
    case 'every 12 hours':
      return '0 */12 * * *';
    case 'daily':
      return '0 0 * * *';
    default:
      return null;
  }
}
