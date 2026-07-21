/**
 * Disiplin renk temaları — ekip bölümü ve ekip detay sayfası ortak kullanır.
 *
 * Renkler hero ile aynı mantıkta: mühendislik beton, mimarlık meşe. Tema
 * `discipline` alanından gelir, kartın **sırasından değil** — böylece admin
 * panelden sıralama değiştirildiğinde renkler karışmaz.
 *
 * ⚠️ Bu dokular `hero-section.tsx`'teki panel gradyanlarıyla **elle senkron**.
 * Hero'nun gradyanını değiştirirsen buradakini de güncelle, yoksa iki bölüm
 * birbirinden ayrışır.
 */
export const DISCIPLINE_THEME = {
  MUHENDISLIK: {
    panel: "bg-beton-700",
    texture:
      "radial-gradient(ellipse at 20% 30%, var(--beton-500) 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, var(--beton-600) 0%, transparent 50%), linear-gradient(160deg, var(--beton-600) 0%, var(--beton-800) 100%)",
    accent: "text-beton-100",
    rule: "bg-beton-100/40",
    body: "text-beton-100/80",
    avatar: "beton",
    label: "Mühendislik",
  },
  MIMARLIK: {
    panel: "bg-mese-900",
    texture:
      "radial-gradient(ellipse at 70% 25%, var(--mese-700) 0%, transparent 62%), radial-gradient(ellipse at 25% 80%, var(--mese-800) 0%, transparent 58%), linear-gradient(200deg, var(--mese-800) 0%, var(--antrasit) 100%)",
    accent: "text-mese-200",
    rule: "bg-mese-300/40",
    body: "text-mese-100/80",
    avatar: "mese",
    label: "Mimarlık",
  },
  DIGER: {
    panel: "bg-antrasit",
    texture:
      "linear-gradient(160deg, var(--antrasit) 0%, var(--antrasit-deep) 100%)",
    accent: "text-beton-200",
    rule: "bg-white/20",
    body: "text-beton-300",
    avatar: "neutral",
    label: "Ekip",
  },
} as const;
