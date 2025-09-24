// Tailwind CSS 클래스 결합 유틸리티
import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}