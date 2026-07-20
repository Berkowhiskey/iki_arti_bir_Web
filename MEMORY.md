# MEMORY.md — İki Artı Bir Yapı Proje Hafıza Defteri

Bu dosya, projenin hangi tarihte hangi aşamada olduğunu ve yol boyunca alınan
mimari kararları kaydeder. Her faz sonunda `CLAUDE.md` §6 kuralı gereği güncellenir.

---

## Güncel Durum

**Son güncelleme: 20.07.2026 - 11:15**

- ✅ **Faz 1 — Altyapı ve Veritabanı Mimarisi: TAMAMLANDI**
- ⬜ Faz 2 — Ziyaretçi Arayüzü ve Framer Motion (sıradaki)
- ⬜ Faz 3 — Auth ve Admin Panel Core
- ⬜ Faz 4 — Full CMS Modülleri
- ⬜ Faz 5 — Akıllı Entegrasyonlar ve SEO

---

## 20.07.2026 - 11:15 — Faz 1 Tamamlandı

### Kurulan Sürümler

`CLAUDE.md`'de planlanan bazı sürümler, kurulum sırasında güncel paketlerle değişti:

| Teknoloji | Planlanan | Kurulan | Not |
| :--- | :--- | :--- | :--- |
| Next.js | 15+ | **16.2.10** | `create-next-app@latest` artık 16 kuruyor. "15+" şartını karşılıyor. Turbopack varsayılan. |
| React | — | 19.2.4 | |
| Tailwind CSS | — | **v4** | Config dosyası yok; CSS-first `@theme` yapısı `app/globals.css` içinde. |
| Shadcn/ui | — | **v4.13.1** | Radix tabanlı, **Nova** preset (Lucide + Geist). |
| Prisma | — | **7.8.0** | Mimari değişiklik — aşağıya bak. |
| Veritabanı | MySQL | **MariaDB 10.4.32** | XAMPP'ın sunucusu. Prisma `mysql` provider'ı ile sorunsuz çalışıyor. |
| Node.js | — | **v24.18.0** | Faz 1 sırasında 20.15.1'den yükseltildi (Prisma 7 zorunlu kıldı). |

### Kritik Mimari Kararlar

**1. Prisma 7 driver adapter mimarisi**
Prisma 7, `datasource` bloğundaki `url` alanını kaldırdı. Yeni yapı:
- Bağlantı URL'i → `prisma.config.ts` (migration/introspection komutları için)
- Çalışma anı bağlantısı → `@prisma/adapter-mariadb` driver adapter'ı
- `PrismaClient` artık `{ adapter: new PrismaMariaDb(url) }` ile kuruluyor

Bu yüzden **PrismaClient'ı her yeni yerde elle kurma** — daima `lib/prisma.ts`'teki
singleton'ı import et. Seed dosyası tek istisna (CLI dışından çalıştığı için kendi
client'ını kurar).

**2. Shadcn v4'te `form` yerine `field`**
Shadcn v4 registry'sinde `form` bileşeni artık dosya üretmiyor; yerini
`components/ui/field.tsx` aldı. Faz 4'teki React Hook Form + Zod formları bu
bileşen üzerine kurulacak.

**3. Koordinatlar `Decimal`, `Float` değil**
`Project.latitude/longitude` ve `ContactSettings.mapLat/mapLng` alanları
`Decimal @db.Decimal(10, 7)`. Float yuvarlama hatası harita hassasiyetini bozar.
Prisma bunları JS tarafında `Decimal` nesnesi olarak döndürür — ekrana basarken
`.toString()` gerekir.

**4. Türkçe karakter altyapısı**
- Veritabanı `utf8mb4 / utf8mb4_unicode_ci` ile oluşturuldu
- Tüm uzun metin alanları `@db.Text` (varsayılan `VARCHAR(191)` biyografi için yetersiz)
- `app/layout.tsx`'te fontlar `subsets: ["latin", "latin-ext"]` — **`latin-ext` şart**,
  yoksa ş/ğ/ı/İ karakterleri fallback fonta düşer
- Doğrulandı: "Gürbüz", "İnşaat Mühendisi", "Alaçatı", "İç Mekân" sorunsuz

**5. Marka renk paleti**
`app/globals.css` içinde CSS değişkeni olarak tanımlandı (Faz 2 split-screen için hazır):
- `beton-50..900` → soğuk gri, hafif mavi kırılmalı (sol panel / mühendislik)
- `mese-50..900` → sıcak ahşap tonları (sağ panel / mimarlık)
- `antrasit`, `antrasit-deep` → ortak zemin
Tailwind sınıfı olarak kullanılır: `bg-beton-800`, `text-mese-300` vb.

### Veritabanı Ortamı (Önemli)

Proje, geliştirme ortamında **XAMPP'ın MariaDB sunucusunu** (port 3306) kullanır.
Bağlantı bilgisi `.env` içindeki `DATABASE_URL` ile yönetilir.

Makinede birden fazla MySQL/MariaDB sunucusu kuruluysa port çakışması yaşanabilir;
`DATABASE_URL`'deki portun gerçekten dinlenen port olduğundan emin ol.

> **Bilgisayarı yeniden başlattığında XAMPP Control Panel'den MySQL'i tekrar
> başlatman gerekir**, yoksa `npm run dev` veritabanına bağlanamaz.

### Seed Verisi

Tümü **placeholder** — gerçek içerik Faz 4'te admin panelden girilecek.
- 2 admin (Ceren, Cansın) — şifreler `.env`'den okunuyor, bcrypt 12 round
- Hero / Hakkımızda / İletişim tekil ayar satırları
- 2 ekip üyesi, 3 proje (her kategoriden biri) + 8 galeri görseli
- Görsel yolları `/uploads/placeholder-*.jpg` — dosyalar henüz yok, kırık görünecek

> ⚠️ **Güvenlik borcu:** `.env` içindeki `DegistirBeni2026!` şifreleri Faz 3'te
> giriş doğrulandıktan hemen sonra değiştirilmeli.

### Faydalı Komutlar

```bash
npm run dev          # geliştirme sunucusu
npm run build        # production derlemesi
npm run typecheck    # tsc --noEmit
npm run db:migrate   # prisma migrate dev
npm run db:seed      # prisma db seed
npm run db:studio    # prisma studio (veri tarayıcısı)
```

### Faz 1 Doğrulama Sonuçları (20.07.2026 - 11:15)

| Test | Sonuç |
| :--- | :--- |
| `npm run build` | ✅ Temiz (5.0s, 4 statik sayfa) |
| `npx tsc --noEmit` | ✅ Hata yok |
| `npx prisma migrate dev` | ✅ `20260720080954_init` uygulandı |
| `npx prisma db seed` | ✅ Tüm kayıtlar yazıldı |
| Dev sunucu smoke testi | ✅ `localhost:3000` → HTTP 200 |
| Türkçe karakter (utf8mb4) | ✅ Doğrulandı |
| Faz 5.1 "son proje" sorgusu | ✅ Çalışıyor |

### Bilinen Açıklar / Teknik Borç

- `git init` henüz yapılmadı — proje versiyon kontrolü altında değil
- `public/uploads/` boş; seed'in işaret ettiği placeholder görseller mevcut değil
- `npm audit` 5 orta seviye uyarı veriyor (geçişli bağımlılıklar, acil değil)
- `@types/node` hâlâ `^20`, Node ise 24 — şu an sorun çıkarmıyor

---

## Sıradaki Adım: Faz 2

Ziyaretçi arayüzü ve Framer Motion animasyonları. Başlamadan önce:
1. `npm install motion` (Framer Motion'ın güncel paket adı)
2. XAMPP MySQL'in çalıştığından emin ol
3. Split-screen için `beton-*` / `mese-*` renk paleti hazır bekliyor
