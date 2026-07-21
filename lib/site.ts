/**
 * Sitenin mutlak adresi.
 *
 * `sitemap.xml`, `robots.txt` ve paylaşım önizlemeleri **mutlak URL** ister;
 * göreli yol kabul etmezler. Adres koda gömülmez, `.env`'den okunur — böylece
 * alan adı netleştiğinde tek satır değişir, yayına alma sırasında kod
 * değiştirmek gerekmez.
 *
 * ⚠️ **Yayına almadan önce `.env` içindeki `NEXT_PUBLIC_SITE_URL` gerçek alan
 * adıyla güncellenmeli.** Varsayılan `localhost` kalırsa sitemap arama
 * motorlarına erişilemez adresler bildirir.
 *
 * `NEXT_PUBLIC_` öneki zorunlu: değer derleme sırasında gömülür ve hem sunucu
 * hem istemci tarafında okunabilir olmalı.
 */
const FALLBACK = "http://localhost:3000";

function normalize(url: string): string {
  // Sondaki eğik çizgi temizlenir; yoksa `${SITE_URL}/ekip` gibi birleştirmeler
  // "//ekip" üretir ve arama motorları bunu ayrı bir adres sayar.
  return url.trim().replace(/\/+$/, "");
}

export const SITE_URL = normalize(
  process.env.NEXT_PUBLIC_SITE_URL || FALLBACK
);

/** Göreli yolu mutlak adrese çevirir: "/ekip/ceren" → "https://…/ekip/ceren" */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE_NAME = "İki Artı Bir Yapı";
