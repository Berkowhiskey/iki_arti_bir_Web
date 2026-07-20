# CLAUDE.md — İki Artı Bir Yapı Proje Anayasası

---

## 0. Proje Durum Logu

> **20.07.2026 - 11:15 — Faz 1 (Altyapı ve Veritabanı Mimarisi) TAMAMLANDI.**
> Next.js 16.2.10 + Tailwind v4 + Shadcn v4 (Radix/Nova) kuruldu. Prisma 7.8.0 ile
> 7 modelli şema MariaDB üzerinde migrate edildi ve placeholder verilerle seed'lendi.
>
> **20.07.2026 - 14:40 — Faz 2 (Ziyaretçi Arayüzü ve Framer Motion) TAMAMLANDI.**
> Split-screen hero, scroll-driven animasyonlar, açılış ekranı ve tüm içerik
> bölümleri kodlandı. Sayfa tamamen veritabanından besleniyor. Karışık düzen
> benimsendi: hero ve ekip bölünmüş, diğerleri tek sütun.
>
> **20.07.2026 - 16:20 — Faz 2 tasarım revizyonu yapıldı.**
> Kullanıcı geri bildirimi üzerine hero panellerinin tonu açıldı, mimarlık paneline
> minimalist mimari çizim motifleri eklendi ve ekip bölümü hero'nun renk ayrımını
> devraldı. `TeamMember` modeline `discipline` alanı eklendi (migration uygulandı) —
> ekip kartlarının teması artık sıralamadan değil veriden geliyor.
>
> **20.07.2026 - 17:30 — Üst navigasyon eklendi, Faz 2 kapandı.**
> Hero'da gizlenen, scroll'da belirip kalıcı olan buzlu cam navbar; yumuşak kaydırma,
> aktif bölüm takibi ve mobil menü ile. Projeler bölümünün başlığı "Tamamlanan projeler" → "Projeler"
> olarak değiştirildi (devam eden şantiyeler de vitrine dahil olsun diye).
>
> **Sıradaki: Faz 3 — Kimlik Doğrulama ve Admin Panel Core.**
>
> **Faz 4'e ertelenen kullanıcı fikirleri:** ekip üyesi detay sayfaları (TeamMember'a
> `slug` alanı gerekir) ve proje detay/galeri sayfaları. İkisi de admin CRUD hazır
> olmadan boş içerikle kalacağı için bilinçli olarak ertelendi.

**Kurulum sırasında planlanandan sapan noktalar** (detaylar `MEMORY.md`'de):

- **Next.js 16.2.10** kuruldu (plan "15+" diyordu; şartı karşılıyor).
- **Tailwind v4** — `tailwind.config.ts` yok, konfigürasyon `app/globals.css` içinde `@theme` ile yapılıyor.
- **Prisma 7** driver adapter mimarisine geçti — bağlantı URL'i şemada değil, `prisma.config.ts` içinde. Client `@prisma/adapter-mariadb` ile kuruluyor.
- **Veritabanı MariaDB 10.4.32** (XAMPP), MySQL değil. Prisma `mysql` provider'ı ile uyumlu çalışıyor.
- **Shadcn v4'te `form` bileşeni yok**, yerini `field` aldı. Faz 4 formları `components/ui/field.tsx` üzerine kurulacak.
- **Node.js 24.18.0**'a yükseltildi (Prisma 7 zorunlu kıldı).

---

## 1. Proje Vizyonu ve Tasarım Felsefesi

- **Şirket Profili:** İzmir/Foça merkezli, Ceren Gürbüz (Mimar) ve Cansın Gürbüz (İnşaat Mühendisi) tarafından kurulan "İki Artı Bir Yapı - Mimarlık & Mühendislik" firmasının kurumsal, dinamik ve full-stack web portalı.
- **Slogan:** "Yaşama değer katan benzersiz çizgiler."
- **Görsel Konsept (Split-Screen UI):**
  - **Sol Panel (Mühendislik - Cansın):** Brütalist ham beton dokuları, keskin strüktürel çizgiler, milimetrik mimari grid/ızgara katmanı overlay tasarımı, soğuk gri ve antrasit tonları.
  - **Sağ Panel (Mimarlık - Ceren):** Sıcak meşe/ahşap detayları, lüks iç mekân dokuları, elit ve yumuşak ışık/gölge oyunları, antrasit ve beyaz alan dengesi.
- **Kullanıcı Deneyimi (UX):** Ziyaretçi sayfası tamamen akıcı, sayfa kaydıkça (Scroll-driven) canlanan Framer Motion animasyonlarına dayanacaktır. Admin paneli ise bu estetikle uyumlu, minimalist ve Tailwind/Shadcn tabanlı bir yapıda olacaktır.

---

## 2. Detaylı Teknoloji Stack'i (Neyin Nerede Kullanılacağı)

| Teknoloji / Kütüphane | Kullanım Alanı ve Amacı | Açıklama / Entegrasyon Detayı |
| :--- | :--- | :--- |
| **Next.js 15+ (App Router)** | Tüm Proje Altyapısı | Hem Ziyaretçi (Frontend) hem de Admin API (Backend) süreçlerini tek projede yönetmek için. SSR ve Resim Optimizasyonu aktif kullanılacak. |
| **Tailwind CSS** | Tüm Görsel Tasarım | Hem Ziyaretçi split-screen ekranlarının hem de Admin paneli arayüzünün sıfırdan, hafif ve modern şekilde kodlanması için. |
| **Shadcn/ui** | Admin ve Form Componentleri | Admin Dashboard'un sol menü (Sidebar), veri tabloları, butonlar, dialog pencereleri ve form elementlerinin sıfırdan, minimalist üretilmesi için. |
| **Framer Motion** | Ziyaretçi Sayfası Animasyonları | Hero alanındaki modalın scroll ile küçülüp kaybolması, grid çizgilerinin kaydıkça uzaması ve metinlerin akıcı şekilde belirmesi (Reveal) için. |
| **MySQL + Prisma ORM** | Veritabanı ve Veri Yönetimi | Şantiyeler, ekip üyeleri, hakkımızda metinleri ve iletişim bilgilerinin tutulması için. Prisma, JS/TS nesnelerini MySQL şemalarına eşitleyecek. |
| **Auth.js (NextAuth v5)** | Admin Panel Güvenliği | Ceren ve Cansın'ın sisteme güvenli giriş yapabilmesi için. İki ayrı "Super Admin" hesabı tanımlanacak, rol ayrımı olmayacak. |
| **React Hook Form + Zod** | CMS Form Yönetimi & Doğrulama | Admin panelindeki tüm dinamik içerik formlarının (Metinler, koordinatlar, linkler) validasyonu ve hatasız veritabanına yazılması için. |
| **Lucide React** | İkon Seti | Sitedeki teknik çizim, mimari ve kurumsal tüm minimalist ikonların standartlaştırılması için. |

---

## 3. Mimari Klasör Yapısı (Folder Architecture)

```
iki-arti-bir-yapi/
├── app/
│   ├── (visitor)/           # Ziyaretçi Sayfaları (One-Page Layout)
│   │   ├── layout.tsx       # Ziyaretçi özel layout ve Framer Motion container
│   │   └── page.tsx         # Ana Landing Page (Split-screen, Hero, About, Team, Portfolio, Contact)
│   ├── (admin)/             # Yönetim Paneli (CMS) Sayfaları
│   │   ├── layout.tsx       # Admin Dashboard Sidebar ve Topbar Düzeni
│   │   ├── dashboard/       # Genel Analitik / Karşılama Ekranı
│   │   ├── hero-settings/   # Slogan ve Genel Ayarlar Paneli
│   │   ├── about-settings/  # Hakkımızda Metin ve Görsel Yönetimi
│   │   ├── team-settings/   # Ekip Ekleme / Silme / Düzenleme Modülü
│   │   ├── portfolio/       # Şantiyeler ve Projeler Yönetim Modülü
│   │   └── contact-settings/# İletişim Bilgileri ve Link Yönetimi
│   ├── api/                 # Next.js Backend API Routes
│   │   ├── auth/            # Auth.js / NextAuth Giriş-Çıkış API
│   │   └── cms/             # İçerik Yönetimi CRUD API'leri (About, Team, Projects vb.)
│   └── login/               # Admin Giriş Sayfası (Korumalı)
├── components/              # Yeniden Kullanılabilir Componentler
│   ├── ui/                  # Shadcn/ui İlkel Bileşenleri (Button, Input, Sidebar vb.)
│   ├── visitor/             # Ziyaretçiye Özel Componentler (HeroSection, GridAnimation vb.)
│   └── admin/               # Admin Paneline Özel Formlar ve Tablolar
├── prisma/
│   ├── schema.prisma        # MySQL Veritabanı Şeması ve Modelleri
│   └── seed.ts              # İlk Kurulumda Admin Hesaplarını ve Varsayılan Verileri Oluşturma
├── lib/                     # Ortak Fonksiyonlar ve Konfigürasyonlar
│   ├── prisma.ts            # Prisma Client Singleton Instance
│   └── auth.ts              # NextAuth Yapılandırması ve Güvenlik Duvarı
├── hooks/                   # Özel React Hook'ları (Scroll takipleri vb.)
├── public/                  # Statik Dosyalar (Logolar, Dokular, Varsayılan Görseller)
├── CLAUDE.md                # Proje Anayasası (Bu dosya)
└── MEMORY.md                # Proje Hafıza ve Durum Defteri
```

---

## 4. Detaylı Geliştirme Fazları ve Yol Haritası (Roadmap)

### Faz 1: Altyapı ve Veritabanı Mimarisi (Foundation)

- **Adım 1.1:** Next.js 15 projesini App Router mimarisinde başlat. `Tailwind CSS` konfigürasyonunu tamamla.
- **Adım 1.2:** `Shadcn/ui` entegrasyonunu yap ve gerekli temel bileşenleri (`button`, `input`, `dialog`, `sidebar`) yükle.
- **Adım 1.3:** `Prisma` kurulumunu yap. `schema.prisma` dosyasında `Admin`, `HeroSettings`, `AboutSettings`, `TeamMember`, `Project` ve `ContactSettings` modellerini MySQL kurallarına uygun olarak tasarla.
- **Adım 1.4:** `prisma/seed.ts` dosyasını hazırla. Ceren ve Cansın için iki adet şifrelenmiş admin hesabı ve sitenin ilk açılışı için varsayılan hakkımızda/iletişim verilerini veritabanına bas. Veritabanı migration işlemini çalıştır.

### Faz 2: Ziyaretçi Arayüzü ve Gelişmiş Animasyonlar (Visitor UI & Framer Motion)

- **Adım 2.1:** Claude Design split-screen (Bölünmüş Ekran) arayüzünü Tailwind ile kodla. Sol tarafa beton/grid temasını, sağ tarafa ahşap/antrasit temasını giydir.
- **Adım 2.2:** `Framer Motion` ile sayfa açılış (Loading) animasyonunu yap. Ardından ortadaki buzlu cam (Frosted Glass) efektli slogan modalını yerleştir.
- **Adım 2.3:** Scroll-Driven animasyonları kur. Kullanıcı sayfayı aşağı kaydırdıkça ortadaki modalın küçülerek kaybolmasını (`useScroll` ve `useTransform` ile), sol taraftaki mühendislik grid çizgilerinin ise aşağı doğru uzamasını sağla.
- **Adım 2.4:** Sırasıyla `Hakkımızda`, `Ekip` ve `İletişim` alanlarını minimalist ve bol beyaz alan içerecek şekilde anasayfaya (One-Page) ekle.

### Faz 3: Kimlik Doğrulama ve Admin Panel Core Tasarımı (Auth & CMS Base)

- **Adım 3.1:** `NextAuth.js` entegrasyonunu tamamla. `/login` sayfasını tasarla ve veritabanındaki admin hesaplarıyla güvenli girişi sağla. Middleware kullanarak `/admin` altındaki tüm rotaları korumaya al.
- **Adım 3.2:** Admin Dashboard genel layout'unu Shadcn Sidebar kullanarak sıfardan tasarla. Sol menüye tüm yönetim modüllerini yerleştir. Dark Mode desteğini ekle.

### Faz 4: Full CMS Modüllerinin Kodlanması (Backend & Dashboard CRUD)

- **Adım 4.1:** Hero ve İletişim Ayarları Modülü: Slogan metnini ve iletişim bilgilerini güncelleyen formları `React Hook Form` ve `Zod` ile kodla, API rotalarını yaz.
- **Adım 4.2:** Hakkımızda Ayarları Modülü: Metin düzenleme ve görsel değiştirme (dosya yükleme/URL kaydetme) altyapısını kur.
- **Adım 4.3:** Ekip Yönetimi Modülü: Ekibe yeni üye ekleme, fotoğraf yükleme, unvan ve biyografi düzenleme süreçlerini içeren dinamik veri tablosunu (Data Table) inşa et.
- **Adım 4.4:** Dinamik Portfolyo (Şantiye) Modülü: Yeni proje ekleme ekranını kodla. Formda Proje Adı, Kategori (Mimarlık/Mühendislik/İç Dizayn), Lokasyon (Örn: Foça/İzmir), Açıklama, Fotoğraflar ve Koordinat (Enlem/Boylam) alanlarını zorunlu kıl.

### Faz 5: Akıllı Entegrasyonlar ve İnce İşler (Smart Integration)

- **Adım 5.1:** Dinamik Koordinat Entegrasyonu: Veritabanından en son eklenen şantiye/proje kaydını çeken API'yi anasayfa Hero alanına bağla. Son projenin koordinatlarını sol alt köşedeki grid alanına dinamik olarak yazdır.
- **Adım 5.2:** SEO optimizasyonlarını, meta etiketlerini, Next.js `Metadata` API'sini kullanarak yapılandır. Resimlerin `next/image` ile lazy-load ve WebP formatında gelmesini sağla. Sitenin performans testlerini (Lighthouse) gerçekleştir.

---

## 5. Kodlama ve Mimari Kurallar

- **Bileşen Ayrımı:** Ziyaretçi arayüzünde SEO ve performans için maksimum oranda Server Component (RSC) kullanılacaktır. Yalnızca Framer Motion hook'ları ve interaktif slider/form içeren bileşenler `"use client"` olarak işaretlenecektir.
- **Form Güvenliği:** Admin panelindeki hiçbir form validasyonsuz gönderilemez. Tüm inputlar Zod şemalarından geçmek zorundadır.
- **Hata Yönetimi (Error Handling):** Tüm API rotaları `try-catch` blokları ile sarmalanacak ve admin arayüzünde Toast bildirimleri ile kullanıcıya işlem sonucu (Başarılı/Hatalı) net gösterilecektir.

---

## 6. Yapay Zeka Ajanı Süreç Takipleri ve Hafıza Kuralları

> ⚠️ **CLAUDE CODE İÇİN KESİN KURAL:** Her bir fazın tamamlanması, kritik bir özelliğin (Auth, Prisma şeması, Framer Motion entegrasyonu vb.) başarıyla ayağa kaldırılması veya mimari bir değişiklik yaşanması durumunda; `CLAUDE.md` ve `MEMORY.md` dosyalarını güncellemek zorundasın. Güncelleme yaparken, ilgili markdown dosyasının en üstüne veya ilgili log bloğuna **GG.AA.YYYY - SS:DD** (Gün.Ay.Yıl - Saat:Dakika) formatında net tarih ve zaman damgası eklemelisin. Bu işlem, projenin hangi gün ve saatte, hangi aşamada kaldığını kesintisiz takip edebilmemiz için elzemdir.

Sistem mimarisinden klasör ağacına, animasyon senaryosundan hafıza yönetimine kadar her detay hazır! Bu devasa rehber projenin hatasız, hızlı ve tam istediğin premium kalitede çıkmasını sağlayacak.
