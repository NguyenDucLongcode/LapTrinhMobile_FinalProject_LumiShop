// utils/categoryLabels.ts
// Nhãn/icon danh mục dùng cho UI (khớp data/categories.json)

export const CATEGORY_ICONS: Record<string, string> = {
  '1': '🎧',
  '2': '👕',
  '3': '📚',
  '4': '🏠',
  '5': '🕶️',
};

export function getCategoryIcon(categoryId: string): string {
  return CATEGORY_ICONS[categoryId] ?? '✨';
}
