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

/**
 * Ekip üyesinin görsel teması — admin panelinde gösterilen adlar.
 *
 * ⚠️ Anahtarlar veritabanındaki `Discipline` enum'undan gelir ve
 * **değiştirilemez**; yalnızca görünen etiketler palet adlarına çevrildi.
 * Alan aslında sadece kartın hangi renkle çizileceğini belirliyor, bir
 * meslek/disiplin bilgisi taşımıyor — adlandırma bunu yansıtsın diye.
 */
export const DISCIPLINE_LABELS = {
  MIMARLIK: "Meşe",
  MUHENDISLIK: "Beton",
  DIGER: "Antrasit",
} as const;
