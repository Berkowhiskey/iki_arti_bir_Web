# İki Artı Bir Yapı — Mimarlık & Mühendislik Web Portalı

> *"Yaşama değer katan benzersiz çizgiler."*

İzmir/Foça merkezli bir mimarlık ve inşaat mühendisliği firması için geliştirilen,
kendi içerik yönetim sistemine sahip full-stack kurumsal web portalı.

**Durum:** 🚧 Geliştirme aşamasında — Faz 2 tamamlandı (ziyaretçi arayüzü çalışır durumda).

---

## Proje Hakkında

Site iki ayrı ihtiyacı tek bir üründe birleştiriyor:

**Ziyaretçi tarafı**, firmanın iki kurucusunun uzmanlığını görsel olarak yansıtan bir
**split-screen (bölünmüş ekran)** kurgusu üzerine tasarlanıyor — sol panel mühendisliği
temsil eden brütalist beton dokuları ve strüktürel grid çizgileriyle, sağ panel ise
mimarlığı temsil eden sıcak meşe tonları ve yumuşak ışık oyunlarıyla. Sayfa kaydıkça
canlanan scroll-driven animasyonlar bu iki dünyayı birbirine bağlıyor.

**Yönetim tarafı**, firma sahiplerinin geliştiriciye ihtiyaç duymadan sitedeki tüm
içeriği (slogan, hakkımızda metni, ekip üyeleri, şantiye/proje portfolyosu, iletişim
bilgileri) yönetebildiği korumalı bir admin paneli.

> **Not:** Depodaki tüm içerik **placeholder**'dır. Gerçek metinler, fotoğraflar ve
> iletişim bilgileri yalnızca admin panel üzerinden girilir ve versiyon kontrolüne
> dahil edilmez.

---

## Teknoloji Yığını

| Katman | Teknoloji | Sürüm |
| :--- | :--- | :--- |
| Framework | Next.js (App Router) | 16.2.10 |
| UI Kütüphanesi | React | 19.2.4 |
| Dil | TypeScript | 5.x |
| Stil | Tailwind CSS | v4 (CSS-first) |
| Bileşenler | Shadcn/ui (Radix) | v4.13.1 |
| ORM | Prisma | 7.8.0 |
| Veritabanı | MySQL / MariaDB | 10.4+ |
| Form & Doğrulama | React Hook Form + Zod | — |
| Animasyon | Motion (Framer Motion) | 12.42.2 |
| Kimlik Doğrulama | Auth.js (NextAuth v5) | *(Faz 3)* |
| İkonlar | Lucide React | — |

---

## Öne Çıkan Teknik Kararlar

Bu projede bilinçli olarak alınmış, tekrar edilmeye değer bazı kararlar:

**Koordinatlarda `Decimal`, `Float` değil**
Proje konumları `Decimal(10, 7)` olarak saklanıyor. `Float` kayan nokta yuvarlama
hatası yaptığı için harita hassasiyetini metrelerce kaydırabiliyor — coğrafi veride
kabul edilemez bir sapma.

**Prisma 7 driver adapter mimarisi**
Prisma 7 ile `datasource` bloğundaki `url` alanı kaldırıldı. Bağlantı artık
`prisma.config.ts` (migration/introspection) ve `@prisma/adapter-mariadb` (çalışma anı)
üzerinden iki ayrı katmanda yönetiliyor. `PrismaClient` singleton'ı `globalThis`
üzerinde cache'leniyor ki dev modundaki hot-reload bağlantı havuzunu tüketmesin.

**Türkçe karakter altyapısı — iki ayrı katmanda**
Sadece veritabanını `utf8mb4` yapmak yetmiyor. Google Fonts subset'ine `latin-ext`
eklenmezse `ş`, `ğ`, `ı`, `İ` karakterleri fallback fonta düşüp tipografiyi bozuyor —
sık atlanan bir detay. Her iki katman da yapılandırıldı ve doğrulandı.

**Tekil ayar tabloları**
Hero, Hakkımızda ve İletişim ayarları `id = 1` sabitli tek satırlık tablolarda tutulup
`upsert` ile güncelleniyor. Böylece "kayıt var mı yok mu" kontrolü ve satır çoğalması
riski tamamen ortadan kalkıyor.

**Görsel tema veriden gelir, konumdan değil**
Ekip kartlarının hangi paletle (beton/meşe) çizileceği `TeamMember.discipline`
alanından okunur — kartın sırasından değil. Konuma dayalı bir çözüm, yönetici panelden
sıralama değiştirildiği anda renkleri karıştırırdı. Küçük bir enum alanı, sessizce
bozulacak bir bağımlılığı ortadan kaldırıyor.

**Scroll-driven animasyon, `useScroll` hedefe bağlanarak**
Hero'daki scroll ilerlemesi tüm sayfaya değil, hero elementinin kendisine bağlı
(`offset: ["start start", "end start"]`). Böylece slogan modalının küçülüp kaybolması
ve grid çizgilerinin uzaması, sayfanın toplam uzunluğundan bağımsız olarak hep aynı
his veriyor — yeni bölüm eklendiğinde animasyon zamanlaması bozulmuyor.

**Hareket azaltma tercihi baştan kurgulandı**
Animasyonlu her bileşen `useReducedMotion` kontrol ediyor. Vestibüler rahatsızlığı
olan kullanıcılar için scroll dönüşümleri tamamen devre dışı kalıyor ve açılış
ekranı kısalıyor — sonradan eklenen bir yama değil, mimarinin parçası.

**Tema altyapısı CSS değişkeni tabanlı**
Split-screen'in iki paleti (`beton-50..900` soğuk gri, `mese-50..900` sıcak ahşap)
Tailwind v4'ün `@theme` bloğunda tanımlı. Arayüz kodlanmadan önce tasarım sistemi
hazır — `bg-beton-800`, `text-mese-300` gibi sınıflar doğrudan kullanılabiliyor.

---

## Veri Modeli

```
Admin              → Yönetici hesapları (bcrypt, 12 round)
HeroSettings       → Slogan ve alt slogan                              (tekil satır)
AboutSettings      → Hakkımızda metni ve görseli                       (tekil satır)
ContactSettings    → İletişim bilgileri, sosyal medya, ofis koordinatı (tekil satır)
TeamMember         → Ekip üyeleri (sıralanabilir, aktif/pasif, disiplin teması)
Project            → Şantiyeler — kategori, lokasyon, koordinat, yayın durumu
  └─ ProjectImage  → Proje galerisi (cascade delete, sıralanabilir)
```

Kategoriler: `MIMARLIK` · `MUHENDISLIK` · `IC_DIZAYN`

---

## Kurulum

**Gereksinimler:** Node.js 20.19+ (önerilen 22 LTS veya üzeri), MySQL 8 ya da MariaDB 10.4+

```bash
# 1. Bağımlılıkları kur
npm install

# 2. Ortam değişkenlerini ayarla
cp .env.example .env
#    .env içindeki DATABASE_URL ve SEED_ADMIN_* değerlerini doldur

# 3. Veritabanını oluştur (utf8mb4 zorunlu)
mysql -u root -e "CREATE DATABASE iki_arti_bir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Şemayı uygula ve başlangıç verisini yükle
npm run db:migrate
npm run db:seed

# 5. Geliştirme sunucusunu başlat
npm run dev
```

Site `http://localhost:3000` adresinde çalışır.

### Komutlar

| Komut | Açıklama |
| :--- | :--- |
| `npm run dev` | Geliştirme sunucusu (Turbopack) |
| `npm run build` | Production derlemesi |
| `npm run typecheck` | TypeScript tip kontrolü |
| `npm run db:migrate` | Migration oluştur ve uygula |
| `npm run db:seed` | Başlangıç verisini yükle |
| `npm run db:studio` | Prisma Studio — görsel veri tarayıcısı |

---

## Klasör Yapısı

```
├── app/
│   ├── (visitor)/        # Ziyaretçi sayfaları (one-page layout)
│   ├── (admin)/          # Yönetim paneli (CMS)
│   ├── api/              # Backend API rotaları
│   └── login/            # Admin giriş sayfası
├── components/
│   ├── ui/               # Shadcn/ui bileşenleri
│   ├── visitor/          # Ziyaretçiye özel bileşenler
│   └── admin/            # Admin formları ve tabloları
├── prisma/
│   ├── schema.prisma     # Veritabanı şeması
│   ├── migrations/       # Migration geçmişi
│   └── seed.ts           # Başlangıç verisi
├── lib/                  # Prisma singleton, yardımcı fonksiyonlar
├── hooks/                # Özel React hook'ları
└── public/uploads/       # Yüklenen görseller (versiyon kontrolü dışında)
```

---

## Yol Haritası

- [x] **Faz 1** — Altyapı, Prisma şeması, migration ve seed
- [x] **Faz 2** — Split-screen ziyaretçi arayüzü ve scroll-driven Framer Motion animasyonları
- [ ] **Faz 3** — Auth.js entegrasyonu, korumalı admin layout, dark mode
- [ ] **Faz 4** — CMS modülleri (CRUD), görsel yükleme, veri tabloları
- [ ] **Faz 5** — Dinamik koordinat entegrasyonu, SEO ve performans optimizasyonu

---

## Güvenlik Notları

- `.env` versiyon kontrolüne **dahil değildir**; şablon için `.env.example` kullanılır
- Admin şifreleri bcrypt (12 round) ile hash'lenir, seed dosyasına sabit gömülmez
- Tüm form girdileri Zod şemalarından geçer
- Yüklenen görseller repoya girmez, sunucudaki kalıcı diskte tutulur

---

## Lisans

Bu bir müşteri projesidir. Kaynak kod, teknik yaklaşımı sergilemek amacıyla portfolyo
olarak paylaşılmıştır; ticari kullanım veya yeniden dağıtım için izin gereklidir.
