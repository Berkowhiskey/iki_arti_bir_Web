# MEMORY.md — İki Artı Bir Yapı Proje Hafıza Defteri

Bu dosya, projenin hangi tarihte hangi aşamada olduğunu ve yol boyunca alınan
mimari kararları kaydeder. Her faz sonunda `CLAUDE.md` §6 kuralı gereği güncellenir.

---

## Güncel Durum

**Son güncelleme: 20.07.2026 - 17:30**

- ✅ **Faz 1 — Altyapı ve Veritabanı Mimarisi: TAMAMLANDI**
- ✅ **Faz 2 — Ziyaretçi Arayüzü ve Framer Motion: TAMAMLANDI**
- ⬜ Faz 3 — Auth ve Admin Panel Core (sıradaki)
- ⬜ Faz 4 — Full CMS Modülleri
- ⬜ Faz 5 — Akıllı Entegrasyonlar ve SEO

---

## 20.07.2026 - 17:30 — Üst Navigasyon ve Faz 4 Fikir Havuzu

### Eklenen: Üst Navigasyon Barı

[site-header.tsx](components/visitor/site-header.tsx) — hero'da **görünmez**, ziyaretçi
hero'yu geçince (viewport yüksekliğinin %85'i) yukarıdan süzülerek belirir ve
**oradan sonra kalıcıdır**. Böylece hero'nun tam ekran kompozisyonu ve slogan modalı
bozulmuyor, ama navigasyon da her an elinin altında kalıyor.

> **İlk denemede yapılan hata:** Bar önce "aşağı kaydırınca gizlen, yukarı kaydırınca
> göster" (hide-on-scroll) deseniyle yazılmıştı. Bu desen uzun metinli, çok sayfalı
> sitelerde okuma alanı kazandırdığı için yaygındır — ama tek sayfalık bu sitede
> ziyaretçi sürekli aşağı gezindiği için bar tam ihtiyaç duyulduğu anda kaçıyordu.
> Kullanıcı testinde fark edildi, kaldırıldı. **Geri eklemeyin.**

- **Yumuşak kaydırma:** `scrollIntoView({ behavior: "smooth" })`; hareket azaltma
  tercihinde `"auto"`ya düşer. `globals.css`'te `html { scroll-behavior: smooth }`
  da aynı media query ile korumalı.
- **Aktif bölüm takibi:** `IntersectionObserver` (`rootMargin: -45% 0px -45% 0px`),
  aktif menü öğesinin altında `layoutId` ile kayan bir çizgi.
- **Kayma payı:** `section[id] { scroll-margin-top: 5rem }` — sabit bar başlıkları
  örtmesin diye. Hero istisna (`0`), çünkü zaten tam ekran.
- **Erişilebilirlik:** Bölüme atlarken odak da taşınıyor (`tabindex="-1"` + `focus`),
  yoksa klavye kullanıcısı görsel olarak kayıyor ama odağı sayfa başında kalıyordu.
- **Mobil:** Shadcn `Sheet` ile sağdan açılan menü.

> ⚠️ Menü öğeleri `NAV_ITEMS` dizisinden geliyor ve her `id`, ilgili `<section id="...">`
> ile **birebir eşleşmek zorunda**. Yeni bölüm eklerken ikisini birlikte güncelle.

### Değiştirilen: Projeler Bölümü Başlığı

"Tamamlanan projeler" → **"Projeler"**. Gerekçe (kullanıcı): ziyaretçiler yalnızca
biten işleri değil, devam eden şantiyeleri de görebilmeli; "tamamlanan" ifadesi
vitrini gereksiz daraltıyor. Üstteki etiket de `ŞANTİYELER` → `PORTFOLYO` oldu,
hem aynı daralmayı yapmasın hem başlıkla tekrara düşmesin diye.

### Faz 4 İçin Bekleyen Fikirler (kullanıcıdan)

Bunlar **bilinçli olarak ertelendi** — admin CRUD hazır olmadan içerikleri boş kalır:

1. **Ekip üyesi detay sayfaları** — her üyenin kendi tanıtım sayfası.
   → `TeamMember`'a `slug` alanı gerekiyor (migration).
2. **Proje detay sayfaları** — galeri, uzun açıklama, konum.
   → `Project.slug` zaten var; `ProjectImage` ilişkisi de hazır ama seed'de kayıt yok,
   çünkü diskte gerçek görsel yok. Admin yükleme akışı gelince anlamlı olacak.

> Her iki sayfa da `(visitor)` route group'u altına eklenmeli:
> `app/(visitor)/ekip/[slug]/page.tsx` ve `app/(visitor)/projeler/[slug]/page.tsx`.

### Doğrulama (20.07.2026 - 17:30)

| Test | Sonuç |
| :--- | :--- |
| `npm run build` | ✅ Temiz |
| `npx tsc --noEmit` | ✅ Hata yok |
| Bölüm id'leri ↔ menü hedefleri | ✅ 5/5 eşleşiyor |
| `scroll-margin-top` CSS'e derlendi | ✅ |
| Başlık "Projeler" | ✅ Eski başlık kalmadı |

---

## 20.07.2026 - 16:20 — Tasarım Geri Bildirimi ve Revizyon

Kullanıcı siteyi ilk kez canlı gördü. Genel değerlendirme olumlu: animasyonlar,
scroll davranışı ve genel tema onaylandı. Üç revizyon talebi geldi:

1. **Hero sol panel (beton/mühendislik)** — grid dokusu beğenildi, rengi bir tık açılacak.
2. **Hero sağ panel (meşe/mimarlık)** — rengi açılacak ve minimalist mimari motifler eklenecek.
   Sol panelde grid çizgileri mühendisliği anlatıyordu; sağ panelin de kendi görsel dili olmalı.
3. **Ekip bölümü** — hero'daki beton/meşe renk ayrımı buraya da taşınacak.

### Alınan Karar: `TeamMember.discipline` Alanı

Ekip renklerini hero ile eşleştirirken bir çelişki çıktı: hero'da **sol = mühendislik**,
**sağ = mimarlık**. Ama ekip listesinde Ceren (Mimar) `order: 1` ile solda, Cansın
(Mühendis) sağdaydı — yani ters.

Konumdan (index) renk türetmek kırılgan olurdu: admin Faz 4'te sıralamayı değiştirdiği
anda renkler karışırdı. Bu yüzden şemaya **`Discipline` enum alanı** eklendi. Artık her
üyenin hangi tema ile gösterileceği veriden gelir, sıralamadan tamamen bağımsızdır.

> Faz 4'te ekip formuna bu alan için bir seçim kutusu eklenmeli.

### Uygulanan Değişiklikler

| Dosya | Değişiklik |
| :--- | :--- |
| `prisma/schema.prisma` | `Discipline` enum + `TeamMember.discipline` (varsayılan `DIGER`) |
| `prisma/migrations/…_add_team_discipline` | Migration uygulandı |
| `prisma/seed.ts` | Ceren → `MIMARLIK`, Cansın → `MUHENDISLIK` |
| `lib/queries.ts` | `TeamMemberContent` tipine `discipline` eklendi |
| `components/visitor/hero-section.tsx` | Sol panel `beton-900` → `beton-700`; sağ panel `antrasit` → `mese-900` |
| `components/visitor/arch-motifs.tsx` | **Yeni** — sağ panelin mimari görsel dili |
| `components/visitor/grid-overlay.tsx` | Çizgi renkleri `beton-300` → `beton-100`, açılan zemine göre kontrast |
| `components/visitor/team-section.tsx` | `DISCIPLINE_THEME` haritası; hero dokularının birebir aynısı |
| `components/visitor/image-placeholder.tsx` | `PersonImage`'a `variant` prop'u (beton / mese / neutral) |

**Mimari motifler** ([arch-motifs.tsx](components/visitor/arch-motifs.tsx)): pergel
daireleri, altın oran dikdörtgeni, plan ve kesit çizgileri, çatı eğimi. Hepsi ince
konturlu SVG; `pathLength` animasyonuyla kendini çizerek beliriyor ve scroll'da hafifçe
süzülüyor. Sol paneldeki grid mühendisliği anlatıyordu — bu da mimarlığın karşılığı.

> ⚠️ **Renk değiştirirken dikkat:** Hero panel dokuları ve `team-section.tsx`
> içindeki `DISCIPLINE_THEME.texture` değerleri **elle senkronize**. Hero'nun
> gradyanını değiştirirsen ekip kartlarınınkini de güncelle, yoksa iki bölüm
> birbirinden ayrışır.

### Bu Turda Öğrenilen

`prisma migrate dev` bu kurulumda **Prisma Client'ı otomatik yeniden üretmiyor**.
Şemaya alan eklendikten sonra `npx prisma generate` elle çalıştırılmazsa seed ve
typecheck "Property does not exist" hatası verir. Faz 1'de de aynısı yaşanmıştı —
şema değişikliğinden sonra refleks olarak `generate` çalıştırın.

### Doğrulama (20.07.2026 - 16:20)

| Test | Sonuç |
| :--- | :--- |
| `npm run build` | ✅ Temiz |
| `npx tsc --noEmit` | ✅ Hata yok |
| Disiplin–tema eşleşmesi | ✅ Ceren → meşe, Cansın → beton |
| Mimari motifler render | ✅ SVG çıktıda mevcut |

### Not: Sol Alttaki "n" Yuvarlağı

Kullanıcının sorduğu gösterge **Next.js Dev Tools** indicator'ı. Sadece geliştirme
modunda görünür; production build çıktısında (`.next/static`) dev-overlay dosyaları
bulunmuyor, doğrulandı. Yayında çıkmayacak. Geliştirmede de gizlemek istenirse
`next.config.ts` içine `devIndicators: false` eklenebilir.

---

## 20.07.2026 - 14:40 — Faz 2 Tamamlandı

### Sayfa Düzeni Kararı

Split-screen konsepti **karışık düzende** uygulandı:
- **Hero** → tam ekran bölünmüş (sol beton/grid, sağ meşe/ışık)
- **Hakkımızda** → tek sütun, bol beyaz alan
- **Ekip** → bölünmüş (iki kurucu doğal olarak iki panele düşüyor)
- **Şantiyeler** → 3'lü ızgara kartlar
- **İletişim** → tek sütun

Gerekçe: uzun metinleri dar sütunlara sıkıştırmadan konsepti anlamlı olduğu yerde
kullanmak. Mobilde tüm bölünmüş yapılar tek sütuna iner.

### Animasyon Mimarisi

**Paket:** Framer Motion artık `motion` adıyla yayınlanıyor (v12.42.2).
İçe aktarma `from "motion/react"` şeklinde — eski `framer-motion` değil.

**Scroll-driven kurgu** ([hero-section.tsx](components/visitor/hero-section.tsx)):
- `useScroll` hero'nun kendi elementine bağlı (`offset: ["start start", "end start"]`)
- Slogan modalı: `scale` 1→0.82, `opacity` 1→0, `y` 0→60
- Grid dikey çizgileri: `scaleY` scroll ilerlemesine doğrudan bağlı — aşağı doğru uzar
- Paneller scroll'da hafifçe birbirinden uzaklaşır (derinlik hissi)

**Erişilebilirlik:** Tüm animasyonlu bileşenler `useReducedMotion` kontrol eder.
Kullanıcı sistem düzeyinde hareket azaltma seçtiyse scroll dönüşümleri devre dışı
kalır ve açılış ekranı 1400ms yerine 200ms sürer. Yeni animasyon eklerken bu
kontrolü atlamayın.

### Server / Client Bileşen Ayrımı

`CLAUDE.md` §5 gereği maksimum RSC kullanıldı:
- **Server:** `page.tsx`, tüm bölüm bileşenleri (about/team/projects/contact), `queries.ts`
- **Client:** yalnızca `hero-section`, `grid-overlay`, `loading-screen`, `reveal`

> ⚠️ **Prisma Decimal tuzağı:** `Decimal` ve `Date` tipleri Server'dan Client'a
> serialize edilemez. [lib/queries.ts](lib/queries.ts) bu yüzden daima düz nesne
> döndürür ve koordinatları `.toString()` ile string'e çevirir. Yeni sorgu
> eklerken aynı kurala uyun.

### Yakalanan İki Hata

**1. Seed, olmayan dosyalara işaret ediyordu**
Faz 1'de seed `imageUrl`/`coverImage` alanlarına `/uploads/placeholder-*.jpg`
yolları yazıyordu ama bu dosyalar hiç oluşturulmamıştı. Sonuç: `src` boş olmadığı
için placeholder bileşeni devreye girmiyor, `next/image` var olmayan dosyayı
yüklemeye çalışıp kırık görsel veriyordu.
**Çözüm:** Tüm görsel alanları `null`. Placeholder ancak `null` iken çalışır.
Geçersiz 8 galeri kaydı da temizlendi.

**2. İki kurucunun baş harfleri aynı**
Ceren Gürbüz ve Cansın Gürbüz → ikisi de "CG". Placeholder'lar ayırt edilemiyordu.
**Çözüm:** Baş harf yerine ilk isim gösteriliyor (CEREN / CANSIN).

### Faz 2 Doğrulama Sonuçları (20.07.2026 - 14:40)

| Test | Sonuç |
| :--- | :--- |
| `npm run build` | ✅ Temiz (4.3s) |
| `npx tsc --noEmit` | ✅ Hata yok |
| Dev sunucu render | ✅ Tüm bölümler veritabanından besleniyor |
| Kırık görsel referansı | ✅ Sıfır |
| Placeholder devrede | ✅ 4 kişi + 6 proje görseli |
| Türkçe karakterler | ✅ Bozulma yok |

> **Not:** Ana sayfa artık `force-dynamic` — admin panelden yapılan içerik
> değişiklikleri anında yansısın diye. Faz 5'te ISR/revalidate ile optimize
> edilebilir.

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
