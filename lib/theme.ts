/**
 * Tema sabitleri — hem sunucu hem istemci tarafından kullanılır.
 *
 * ⚠️ Bu dosyaya `next/headers` gibi sunucuya özgü bir şey EKLEMEYİN.
 * Client component'ler buradan import ediyor; sunucu-only bir bağımlılık
 * eklenirse derleme kırılır. Sunucu tarafı okuma `lib/theme-server.ts`'de.
 *
 * Neden next-themes kullanmıyoruz: o kütüphane, temayı hidrasyondan önce
 * uygulamak için bir client component içinden <script> render eder. React 19
 * bileşen ağacı içindeki script'leri istemcide çalıştırmaz; bu hem konsol hatası
 * hem de DOM'da fazladan düğüm bırakarak hydration uyuşmazlığı üretiyordu.
 * Bunun yerine tema çerezde tutulur ve sunucuda <html> sınıfına yazılır.
 */

export const THEME_COOKIE_NAME = "tema";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type Theme = "light" | "dark";
