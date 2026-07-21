/**
 * Enum → Türkçe etiket eşlemeleri.
 *
 * Hem ziyaretçi arayüzü hem admin paneli kullanır. Önce üç ayrı dosyada
 * kopyalanmıştı; yeni bir kategori eklendiğinde birini güncellemeyi unutmak
 * kolay olduğu için tek yere toplandı.
 */

export const CATEGORY_LABELS = {
  MIMARLIK: "Mimarlık",
  MUHENDISLIK: "Mühendislik",
  IC_DIZAYN: "İç Dizayn",
} as const;

export const DISCIPLINE_LABELS = {
  MIMARLIK: "Mimarlık",
  MUHENDISLIK: "Mühendislik",
  DIGER: "Diğer",
} as const;
