// Tailwind CSS 클래스 결합 유틸리티
// clsx와 tailwind-merge 역할을 하는 간단한 구현

export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}