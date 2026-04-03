import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function getRiskColor(score: number) {
  if (score < 0.3) return 'text-green-400';
  if (score < 0.6) return 'text-yellow-400';
  return 'text-red-400';
}

export function getRiskLabel(score: number) {
  if (score < 0.3) return 'SAFE';
  if (score < 0.6) return 'RISKY';
  return 'RUG';
}
