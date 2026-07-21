# MEMORY.md — İki Artı Bir Yapı Proje Hafıza Defteri

Bu dosya, projenin hangi tarihte hangi aşamada olduğunu ve yol boyunca alınan
mimari kararları kaydeder. Her faz sonunda `CLAUDE.md` §6 kuralı gereği güncellenir.

---

## Güncel Durum

**Son güncelleme: 21.07.2026 - 14:05**

- ✅ **Faz 1 — Altyapı ve Veritabanı Mimarisi: TAMAMLANDI**
- ✅ **Faz 2 — Ziyaretçi Arayüzü ve Framer Motion: TAMAMLANDI**
- ✅ **Faz 3 — Kimlik Doğrulama ve Admin Panel Core: TAMAMLANDI**
- ✅ **Faz 4 — Full CMS Modülleri: TAMAMLANDI (3/3)**
  - ✅ Parça 1: Şifre değiştirme + Hero / Hakkımızda / İletişim formları
  - ✅ Parça 2: Görsel yükleme altyapısı + Ekip ve Proje CRUD
  - ✅ Parça 3: Ekip ve proje detay sayfaları
- 🟡 **Faz 5 — Akıllı Entegrasyonlar ve SEO: kısmen**
  - ✅ 5.1 Dinamik koordinat entegrasyonu (Faz 2'de yapılmıştı, doğrulandı)
  - ✅ 5.2a sitemap.xml + robots.txt
  - ✅ 5.2b Önbellekleme — **incelendi, bilinçli olarak yapılmadı** (gerekçe aşağıda)
  - ⬜ 5.2c OpenGraph genişletme, JSON-LD, Lighthouse ölçümü (kullanıcı erteledi)

---

## 21.07.2026 - 14:05 — Faz 5: SEO Altyapısı ve Önbellek Engeli

### 5.1 Zaten Yapılmıştı

CLAUDE.md 5.1 adımı "son projenin koordinatlarını hero'ya yazdır" diyor. Bu
**Faz 2'de kodlanmış**: `getLatestProjectCoordinates()` → `page.tsx` →
`hero-section.tsx` sol alt köşe. Doğrulandı, ek iş gerekmedi.

### Kurulan: Site Adresi Altyapısı

`sitemap.xml`, `robots.txt` ve paylaşım önizlemeleri **mutlak URL** ister.
Adres koda gömülmedi, `.env`'deki `NEXT_PUBLIC_SITE_URL`'den okunuyor
(`lib/site.ts`). `.env.example` da güncellendi.

> ⚠️ **Yayına almadan önce `NEXT_PUBLIC_SITE_URL` gerçek alan adıyla
> değiştirilmeli.** Şu an `http://localhost:3000`. Unutulursa sitemap arama
> motorlarına erişilemez adresler bildirir ve SEO çalışması boşa gider.
> `NEXT_PUBLIC_` öneki zorunlu (değer derlemede gömülür).

### Kurulan: sitemap.ts ve robots.ts

Sitemap **dinamik** — ekip ve proje slug'ları veritabanından okunuyor, yeni
kayıt eklendiğinde elle satır eklemek gerekmiyor. Yalnızca `isActive: true` /
`isPublished: true` kayıtlar listeleniyor; gizli kayıtların detay sayfası zaten
404 verdiği için haritaya konmaları kırık adres bildirmek olurdu.

> ⚠️ **`robots.txt` bir güvenlik önlemi DEĞİLDİR.** Yalnızca iyi niyetli
> tarayıcılara "girme" der. Panelin gerçek koruması `proxy.ts` + admin
> layout'taki oturum kontrolüdür (Faz 3). Buradaki kayıt sadece panel
> adreslerinin arama sonuçlarına düşmemesi için.

`metadataBase` kök layout'a eklendi — onsuz Next.js göreli metadata adreslerini
mutlak hale getiremiyor ve derlemede uyarı veriyor.

### ⚠️ ÇÖZÜLMEMİŞ: Ziyaretçi Sayfaları Statikleşemiyor

**Plan:** `force-dynamic` kaldırılıp sayfalar önbelleğe alınacak, admin
action'larındaki `revalidatePath` ile tazelenecekti.

**Yapılanlar:** `force-dynamic` üç ziyaretçi sayfasından kaldırıldı; detay
rotaları için eksik olan tazeleme çağrıları eklendi:
`revalidatePath("/ekip/[slug]", "page")` ve `revalidatePath("/projeler/[slug]", "page")`.
(`"page"` tipi o rotaya uyan **tüm** slug'ları kapsar.)

**Sonuç: sayfalar yine dinamik.** Build çıktısında `/` hâlâ `ƒ`.

**Sebep:** Kök layout (`app/layout.tsx`) temayı çerezden okuyor
(`getTheme()` → `cookies()`). **`cookies()` dinamik bir API'dir ve altındaki
tüm rotaları dinamik yapar** — ziyaretçi sayfaları dahil. Yani engel
ziyaretçi sayfalarında değil, kök layout'ta.

**Denenmeyen çözüm ve neden denenmediği:** Tema sınıfı `<html>` yerine admin
layout'undaki bir `<div>`'e taşınabilir; `@custom-variant dark (&:is(.dark *))`
tanımı buna izin verir. **Ama `<body>` o sarmalayıcının dışında kalır** —
koyu temada gövde arka planı açık kalıp kenarlarda beyaz alanlar oluşabilir.
Ayrıca `Toaster` kök layout'ta ve o da sarmalayıcının dışında kalırdı.
Tema sistemi bu projede **iki kez kırıldı** (bkz. Faz 3 notları: script hatası,
hydration uyuşmazlığı); görsel doğrulama yapılamadan dokunulmadı.

**Değerlendirilen seçenekler:**
1. **Olduğu gibi bırak.** Sorgular hızlı, site küçük. Asıl Lighthouse
   kazanımları görsel/font tarafında. Risk sıfır.
2. **Tema sınıfını admin sarmalayıcısına taşı.** `Toaster` da admin ve login'e
   ayrı ayrı taşınır (ziyaretçi tarafı toast kullanmıyor — doğrulandı).
   Tarayıcıda koyu tema görsel kontrolü şart.
3. **Çoklu kök layout** (route group başına ayrı `<html>`). En temizi ama en
   büyük yeniden yapılandırma.

### ✅ VERİLEN KARAR (21.07.2026 - 14:15): Seçenek 1 — dokunulmuyor

Kullanıcı ve ajan hemfikir: **ziyaretçi sayfaları dinamik kalacak.**

**Gerekçe:** Bu ölçekte kazanç mütevazı (birkaç hızlı Prisma sorgusu), risk ise
gerçek — tema sistemi projede iki kez kırıldı ve düzeltmenin görsel doğrulaması
tarayıcı gerektiriyor. Site müşteri sunumuna girdiği için kırılganlık yaratacak
bir değişiklik bilinçli olarak ertelendi.

> **Bu bir eksiklik değil, tartılmış bir karardır.** İleride gerçek trafik altında
> performans sorunu görülürse seçenek 2 veya 3'e dönülebilir; `revalidatePath`
> altyapısı zaten hazır, tek engel çerez okuması. Yeniden açmadan önce bu
> bölümün tamamını okuyun.

> Kod içindeki yorumlar bu durumu doğru anlatacak şekilde düzeltildi —
> "önbelleğe alınır" yazan yorumlar gerçeği yansıtmıyordu.

### Test Sonuçları (21.07.2026 - 14:05)

| Test | Sonuç |
| :--- | :--- |
| `npm run build` | ✅ Temiz, 20 rota (`robots.txt` + `sitemap.xml` statik) |
| `npx tsc --noEmit` | ✅ |
| `/robots.txt` çıktısı | ✅ Admin, login ve api kapalı; sitemap bildirildi |
| `/sitemap.xml` çıktısı | ✅ 5 adres (ana sayfa + 2 ekip + 2 proje) |
| **Gizli kayıtlar sitemap'te** | ✅ **0** — dışlanıyor |
| Admin adresleri sitemap'te | ✅ 0 |
| Ziyaretçi sayfaları statik mi? | ❌ Hayır — yukarıdaki tema çerezi engeli |

Gizli kayıt testi yine geçici kayıt oluşturup silinerek yapıldı.

---

## 21.07.2026 - 13:27 — Faz 4 / Parça 3 Tamamlandı (Faz 4 KAPANDI)

Ekip üyesi ve proje detay sayfaları eklendi. Faz 2'den beri "admin CRUD hazır
olmadan boş kalır" gerekçesiyle ertelenen iki fikir de böylece kapandı.

| Rota | İçerik |
| :--- | :--- |
| `/ekip/[slug]` | Disiplin temalı üst blok, tam biyografi, diğer üyeler |
| `/projeler/[slug]` | Kapak, açıklama, teknik künye, galeri, diğer projeler |

### `TeamMember.slug` — Elle Yazılan Migration

`prisma migrate dev` tek adımda "NOT NULL + UNIQUE kolon ekle" üretiyor; tabloda
2 kayıt varken bu çalışamıyor (varsayılan değer yok, üstelik hepsi aynı olurdu →
unique ihlali). Migration **elle üç adıma bölündü**:

1. `slug` nullable olarak eklendi
2. Mevcut satırlara `uye-<id>` yazıldı (id'ye dayandığı için çakışma imkânsız)
3. `NOT NULL` + unique index

Okunabilir adresler (`ceren-gurbuz`) ayrı bir script'le yazıldı:
`npm run db:backfill-slugs`. Türkçe karakter çevirisi SQL'de yapılamadığı için
uygulamadaki `slugify()` kullanıldı. Script **idempotent** — yalnızca `uye-<id>`
desenindeki slug'lara dokunur, elle düzenlenmiş adresleri bozmaz.

> ⚠️ **Var olan tabloya zorunlu+unique kolon eklerken bu deseni tekrarlayın:**
> nullable ekle → doldur → sıkılaştır. Prisma'nın tek adımlık çıktısı bu durumda
> her zaman patlar.

> Migration sonrası `npx prisma generate` yine elle çalıştırıldı (Faz 1 ve Faz 2
> revizyonunda da aynısı gerekmişti — bu kurulumda `migrate` client'ı otomatik
> yeniden üretmiyor).

### Seed'de Slug Koruması

`seedTeam()` mevcut üyeyi güncellerken `slug` yazmıyor — panelden veya
backfill'den gelen adres, seed tekrar çalışınca sıfırlanmasın diye. **Admin
şifresindeki kararla aynı mantık** (bkz. 21.07.2026 - 10:45).

### Detay Sayfaları İçin Layout Onarımı

Detay sayfaları `(visitor)` layout'unu paylaşıyor ve üç şey bozuktu:

1. **Navbar hiç görünmüyordu.** Bar `scrollY >= viewport * 0.85` şartıyla
   beliriyor; detay sayfasında hero olmadığı için bu şart hiç sağlanmıyordu →
   navigasyon tamamen erişilemez. Artık `pathname !== "/"` ise bar **en baştan
   görünür**.
2. **Menü linkleri ölüydü.** `scrollIntoView` ile `#ekip` aranıyordu ama o bölüm
   detay sayfasında yok. Artık ana sayfa dışındayken `router.push("/#ekip")`.
3. **Footer yoktu.** `page.tsx` içindeydi; `components/visitor/site-footer.tsx`
   olarak çıkarılıp layout'a taşındı.

**Açılış animasyonu** artık yalnızca ana sayfaya girişte oynuyor. Paylaşılan bir
proje linkiyle gelen ziyaretçide tam ekran perde beklenmedik olur ve içeriği
1.4 sn kilitlerdi. Giriş adresi `useState` initializer'ıyla **bir kez**
yakalanıyor — doğrudan `pathname === "/"` yazılsaydı, detay sayfasından ana
sayfaya dönüldüğünde animasyon oturumun ortasında tekrar oynardı.

### ⚠️ Effect İçinde setState (ESLint Hatası)

İlk denemede detay sayfasında menü vurgusunu temizlemek için effect içine
`setActiveId("")` yazıldı; ESLint `react-hooks/set-state-in-effect` hatası verdi.
**Çözüm: değeri state'ten türet.** `const displayedActiveId = isHome ? activeId : ""`
— hem uyarı gitti hem gereksiz render turu ortadan kalktı, üstelik state ana
sayfanın son aktif bölümünü hatırladığı için geri dönüldüğünde vurgu yerinde.

### Harita: Gömülü Değil, Bağlantı

Kullanıcı tercihi. Koordinat teknik künyede yazılı, yanında "Haritada aç"
bağlantısı Google Haritalar'ı yeni sekmede açıyor. Gömülü iframe bilinçli olarak
kullanılmadı: her ziyaretçi için Google'a istek gitmesi çerez/KVKK yükü getirir,
sayfayı ağırlaştırır ve Lighthouse puanını düşürür (Faz 5.2'yi zorlaştırırdı).

### Bu Turda Yapılan Tekrar Temizliği

- `DISCIPLINE_THEME` → `components/visitor/discipline-theme.ts` (ekip bölümü +
  detay sayfası ortak). MEMORY zaten hero/ekip dokularının elle senkron
  tutulduğu konusunda uyarıyordu; üçüncü bir kopya çıkarmamak için toplandı.
- `CATEGORY_LABELS` / `DISCIPLINE_LABELS` → `lib/labels.ts`. Üç ayrı dosyada
  kopyalanmıştı (ziyaretçi + iki admin listesi).
- `uniqueSlug` → `lib/unique-slug.ts`. Model bağımsız hale getirildi (hangi
  tabloya bakılacağını geri çağrım belirliyor); Proje ve Ekip aynı mantığı
  paylaşıyor.

### Kartların Tıklanabilirliği

Ekip ve proje kartlarının tamamı tıklanabilir. Desen: başlıktaki `<Link>`,
`before:absolute before:inset-0` ile kartı kaplıyor. Böylece ekran okuyucuda
**tek ve anlamlı** bir bağlantı olur (kartı sarmalayan `<a>` içine başlık, metin
ve buton koymak erişilebilirlik açısından kötüdür).

### Test Sonuçları (21.07.2026 - 13:27)

| Test | Sonuç |
| :--- | :--- |
| `npm run build` | ✅ Temiz, **18 rota** |
| `npx tsc --noEmit` | ✅ |
| `npx eslint` | ✅ 0 uyarı (1 hata devralınmış — `hooks/use-mobile.ts`) |
| Detay sayfaları duman testi | ✅ **22/22** |
| Olmayan slug → 404 | ✅ |
| **Gizli kayıtların detayı → 404** | ✅ `isActive:false` / `isPublished:false` |
| `generateMetadata` başlıkları | ✅ Kişiye/projeye özel |
| Dev sunucusu konsolu | ✅ Hata yok |

Gizli kayıt testi **geçici kayıt oluşturup silinerek** yapıldı; mevcut veriye
dokunulmadı.

> **Not:** Ziyaretçi tarafı artık uçtan uca test edildi. Admin **yazma** yolu
> hâlâ otomatik test edilemiyor (Server Action'lar build'e özgü eylem kimliğiyle
> çağrılıyor) — tarayıcı testi gerekiyor.

---

## 21.07.2026 - 11:08 — Faz 4 / Parça 2 Tamamlandı

Görsel yükleme altyapısı, Ekip CRUD ve Proje CRUD (galeri dahil) kodlandı.
CLAUDE.md Faz 4.2, 4.3 ve 4.4 adımlarının tamamı karşılandı.

### Görsel Depolama Kararı: Yerel Disk

Kullanıcı onayıyla **yerel disk** seçildi (`public/uploads/`), bulut servisi değil.
Gerekçe: proje **kendi sunucusunda / VPS'te** yayınlanacak, dolayısıyla dosya
sistemi kalıcı. Ek servis, API anahtarı, ücret ve kota derdi yok.

> ⚠️ **Vercel/Netlify'a taşınırsa bu çalışmaz** — o platformlarda dosya sistemi
> geçicidir, her deploy'da yüklenen görseller silinir. Taşıma gerekirse yalnızca
> `lib/uploads.ts`'in içi değiştirilir; çağıran taraf yol yerine tam URL alacağı
> için arayüzde değişiklik gerekmez.

### ⚠️ Yükleme Güvenliğinin Üç Direği

Dosya yükleme, panelin en riskli yüzeyi. Üç kural birlikte çalışıyor:

1. **Dosya adı istemciden ALINMAZ.** Ad tamamen yeniden üretilir:
   `randomUUID() + tespit edilen uzantı`. Bu tek karar dizin gezinme
   (`../../etc/passwd`), çift uzantı (`resim.jpg.php`) ve ad çakışmasını
   aynı anda çözer.
2. **Tür, uzantıdan veya `file.type`'tan DEĞİL içerikten okunur** (magic bytes).
   İkisi de istemci tarafından uydurulabilir; baytlar uydurulamaz. SVG bilinçli
   olarak kabul edilmiyor — içinde script taşıyabilir.
3. **Yol veritabanına yazılmadan önce Zod'dan geçer** (`uploadPath` şeması).
   Action'lar açık HTTP uç noktaları olduğu için istemci `imageUrl` alanına
   `https://…` veya `javascript:…` yollayabilirdi; bu değer sonra ziyaretçi
   sayfasında `<img src>` olarak render edilirdi.

> `deleteUpload()` de aynı deseni tekrar doğrular ve **sessizce başarısız olur**.
> Böylece "görsel silinemedi" diye bir kayıt silme işlemi yarıda kalmaz —
> artık kalan bir dosya, kayıp bir kayıttan iyidir.

### ⚠️ Server Action Gövde Sınırı

Server Action gövdesi varsayılan olarak **1 MB** ile sınırlı; görsel yükleme
bunu anında aşıp "Body exceeded 1mb limit" veriyor. `next.config.ts` içinde
`experimental.serverActions.bodySizeLimit: "6mb"` ayarlandı.

> Bu değer `lib/uploads.ts`'teki `MAX_UPLOAD_BYTES` (5 MB) ile **elle senkron**.
> Birini değiştirirken diğerini de güncelle; gövde sınırı biraz yüksek kalmalı
> (çok parçalı gövde ek yükü de sayılıyor).

### Kurulan Modüller

| Rota | İçerik |
| :--- | :--- |
| `/admin/team-settings` | Ekip listesi (tablo, foto, durum rozeti) |
| `/admin/team-settings/new` · `/[id]` | Ekleme / düzenleme formu |
| `/admin/portfolio` | Proje listesi (kapak, kategori, galeri sayısı) |
| `/admin/portfolio/new` · `/[id]` | Ekleme / düzenleme + galeri yönetimi |

Yeni ortak bileşenler:
- `components/admin/image-field.tsx` — tekil görsel seçme/önizleme/kaldırma
- `components/admin/delete-dialog.tsx` — silme onayı (geri alınamaz işlem)
- `app/admin/upload-actions.ts` — tüm modüllerin paylaştığı tek yükleme action'ı

### Alınan Küçük Kararlar ve Gerekçeleri

- **Görsel, form kaydedilmeden yüklenir.** Kullanıcı önizlemeyi anında görsün
  diye. Bedeli: yükleyip kaydetmeden çıkan kullanıcı diskte sahipsiz dosya
  bırakır. Zararsız; gerekirse ileride bir temizlik komutu yazılabilir.
- **"Kaldır" diskten silmez**, yalnızca formdaki değeri temizler. Diskteki eski
  dosya kayıt kaydedilince silinir — kullanıcı vazgeçip sayfadan çıkarsa mevcut
  görseli kaybetmesin diye.
- **Slug boş bırakılabilir**, proje adından üretilir (`slugify` Türkçe
  karakterleri ASCII'ye çevirir). Çakışma olursa sonuna `-2`, `-3` eklenir.
  Düzenlemede kaydın kendi slug'ı çakışma sayılmaz.
- **Galeri yalnızca düzenleme ekranında** var: henüz kaydedilmemiş projenin
  `id`'si yok, görselin bağlanacağı yer de yok.
- **Galeri görselleri sırayla yüklenir**, paralel değil. "Son sıra + 1" sorgusu
  eşzamanlı isteklerde yarışa girip aynı `order` değerini üretebilirdi.
- **`isActive` / `isPublished` kapatmak kaydı silmez**, sadece gizler.

### ⚠️ `watch()` Değil `useWatch`

Kontrollü alanlar (`ImageField`, `Select`, `Switch`) `register` ile bağlanamaz;
değerleri izlenmeli. İlk denemede `watch("alan")` kullanıldı ve ESLint
`react-hooks/incompatible-library` uyarısı verdi — `watch()` güvenli şekilde
memoize edilemiyor. `useWatch({ control, name })` hem uyarıyı kaldırıyor hem
yalnızca ilgili alan değişince render ediyor. **Yeni formlarda doğrudan
`useWatch` kullanın.**

### Bulunan ve Kapatılan Boşluk: Hakkımızda Görseli Render Edilmiyordu

`lib/queries.ts` `about.imageUrl` alanını Faz 2'den beri çekiyordu ama
`about-section.tsx` onu hiç kullanmıyordu — o dönem yükleme olmadığı için alan
hep `null`'du ve fark edilmemişti. Panelden yüklenebilir hale gelince bağlandı;
görsel yoksa bölüm eskisi gibi metin ağırlıklı kalıyor.

> Ders: veri katmanına alan eklemek, arayüzde kullanıldığı anlamına gelmiyor.
> Yeni alan eklerken **tüketildiği yeri de doğrulayın**.

### Bilinen Durum: ESLint'te 1 Hata (Bizim Değil)

`hooks/use-mobile.ts` — Shadcn'in `sidebar` bileşeniyle gelen dosya,
`react-hooks/set-state-in-effect` hatası veriyor. **Faz 3'ten beri var**,
Parça 2'de eklenmedi. Üretilen kod olduğu için dokunulmadı; düzeltmek
`useSyncExternalStore`'a geçmeyi gerektirir.

### Test Sonuçları (21.07.2026 - 11:08)

| Test | Sonuç |
| :--- | :--- |
| `npm run build` | ✅ Temiz, 16 rota |
| `npx tsc --noEmit` | ✅ |
| `npx eslint` | ✅ 0 uyarı (1 hata devralınmış, yukarıda) |
| Tüm action'larda `requireAdmin()` | ✅ **11/11** |
| Yükleme güvenlik testleri | ✅ **11/11** |
| Zod şema testleri (Parça 2) | ✅ **29/29** |
| Oturumsuz yeni rotalar | ✅ 4/4 → 307 `/login` |
| Oturumla yeni rotalar | ✅ 7/7 HTTP 200 |
| Geçersiz id (`abc`, `999999`) | ✅ 404 |
| Dev sunucusu konsolu | ✅ Hata/uyarı yok |

**Yükleme güvenlik testinde doğrulananlar:** `.jpg` adlı PHP betiği reddedildi ·
SVG reddedildi · boş dosya reddedildi · 5 MB üstü reddedildi ·
`../../../etc/passwd.png` zararsızlaştırıldı · `evil.png.php` `.png` olarak
kaydedildi · `deleteUpload` desen dışı yolları silmedi.

> **Not:** Parça 1'deki gibi, form **yazma** yolu (butona basıp veritabanına
> kaydetme) otomatik test edilemedi — Server Action'lar build'e özgü eylem
> kimliğiyle çağrılıyor. Okuma yolu, yetki, doğrulama ve yükleme katmanı test
> edildi; **CRUD akışlarını tarayıcıda denemek gerekiyor.**

---

## 21.07.2026 - 10:45 — Seed Şifre Koruması ve Veritabanı Bağlantı Teşhisi

### Değişen: `seed.ts` artık mevcut hesapların şifresini EZMİYOR

Faz 4'te şifre değiştirme ekranı gelince eski `upsert` mantığı tehlikeli hale
geldi: `update: { passwordHash }` bloğu, `npm run db:seed` her çalıştığında
panelden değiştirilmiş şifreyi `.env`'deki eski değere **geri döndürüyordu.**

**Yeni davranış:** hesap varsa yalnızca `name` güncellenir; `passwordHash`
sadece hesap **ilk kez oluşturulurken** yazılır. bcrypt hash'i de artık yalnızca
create dalında hesaplanıyor (mevcut hesapta 12 round boşa gitmesin diye).

> ⚠️ **Bu, MEMORY.md'nin Faz 3 bölümündeki bir talimatı geçersiz kıldı.**
> Orada "`.env`'deki şifreleri güncelleyip `npm run db:seed` çalıştırmak yeterli"
> yazıyordu — **artık çalışmaz.** Şifre değiştirmenin tek yolu `/admin/account`
> ekranı. Unutulan şifre için tek çare veritabanındaki `passwordHash` satırını
> elle silip/sıfırlayıp seed'i yeniden çalıştırmak.

### Güvenlik Borcunun Güncel Durumu

`.env` şifreleri bcrypt ile karşılaştırılarak doğrulandı:

| Hesap | `.env` şifresi hâlâ geçerli mi? | Durum |
| :--- | :--- | :--- |
| ceren@ikiartibiryapi.com | ❌ Hayır | ✅ Panelden değiştirilmiş |
| cansin@ikiartibiryapi.com | ✅ Evet | ⚠️ **Hâlâ `DegistirBeni2026!`** |

> **Yan fayda:** Ceren'in şifresinin değişmiş olması, Faz 4/Parça 1'de "uçtan uca
> test edilemedi" diye açık bırakılan **form yazma yolunun gerçekten çalıştığını
> kanıtlıyor.** Server Action → doğrulama → veritabanına yazma zinciri sağlam.

**Kalan iş:** Cansın'ın şifresi `/admin/account` ekranından değiştirilmeli.

### Teşhis: "pool timeout" = Veritabanı Kapalı

Dev sunucusu açılırken `DriverAdapterError` verdi:

```
pool timeout: failed to retrieve a connection from pool after 10002ms
(pool connections: active=0 idle=0 limit=10)
```

**Sebep:** XAMPP MariaDB çalışmıyordu (bilgisayar yeniden başlatılmıştı).
`localhost:3306` dinlenmiyordu. Çözüm: XAMPP Control Panel → MySQL → Start.
Dev sunucusunu yeniden başlatmaya gerek yok; Prisma sonraki istekte bağlanır.

**Okuma anahtarı:** `active=0 idle=0` → havuz **tek bir bağlantı bile kuramadı**,
yani sunucu erişilemez durumda. Bağlantı kurulup sonra kopsaydı bu sayılar
sıfırdan farklı olurdu. Sorgunun kendisinde (`getTeamMembers`) hata aramayın —
yığın izi sadece "ilk veritabanına dokunan kod" olduğu için orayı gösterir.

### ⚠️ Makinede İKİ Ayrı MySQL Sunucusu Var

Teşhis sırasında ortaya çıktı ve ileride yanıltabilir:

| Sunucu | Port | Bizim projeyle ilgisi |
| :--- | :--- | :--- |
| **XAMPP MariaDB** | **3306** | ✅ `iki_arti_bir` burada |
| Oracle MySQL 8 | 3307 (+ 33060 X Protocol) | ❌ Alakasız, ayrı kurulum |

> ⚠️ **Görev Yöneticisi'nde `mysqld` görmek "veritabanı ayakta" demek DEĞİLDİR.**
> Oracle MySQL 8 sürekli çalışıyor. Doğru kontrol port bazlı olmalı:
> `Test-NetConnection 127.0.0.1 -Port 3306`. **33060** portu MySQL X Protocol'e
> aittir ve MariaDB'de bulunmaz — hangi sunucuyu gördüğünüzü bu ayırt eder.
>
> İyi haber: portlar farklı olduğu için **çakışma yok**, XAMPP sorunsuz başlıyor.

---

## 21.07.2026 - 00:40 — Disk Doldu, Turbopack Çöktü (Kod Kaynaklı Değil)

Dev sunucusu açılmaz oldu, tarayıcı "Internal Server Error" verdi ve terminale
yüzlerce satır Turbopack paniği düştü:

```
Persisting failed: Unable to write SST file
There is not enough space on the disk. (os error 112)
ENOSPC: no space left on device
thread 'tokio-runtime-worker' panicked ... StorageFull
```

**Sebep:** C: sürücüsü %100 dolmuştu (952 GB'ın 0.13 GB'ı boş). Turbopack derleme
çıktısını ve `.next/dev` önbelleğini yazamayınca panikliyor. **Kodla hiçbir ilgisi
yok.**

**Teşhis refleksi:** Çıktıda `ENOSPC` veya `os error 112` görürseniz doğrudan disk
alanına bakın; hata mesajının uzunluğu yanıltmasın, kod tarafında arayacak bir şey
yok.

**Çözüm:** Disk temizlendi (16 GB açıldı). `.next` silinip yeniden oluşturuldu.
Proje bütünlüğü doğrulandı: 51 kaynak dosya, Faz 4 dosyalarının 16/16'sı, `.env`,
`node_modules`, veritabanı (2 admin / 2 ekip / 3 proje) ve git geçmişi — hepsi
sağlam. Typecheck ve production build temiz geçti.

> ⚠️ **Turbopack disk alanına duyarlıdır.** Geliştirme sırasında birkaç GB boş
> alan bırakın; `.next/dev` önbelleği kolayca yüzlerce MB'a çıkar.

> **Temizlik notu:** `%TEMP%` klasörünü toptan silmek riskli — çalışan araçların
> geçici dosyaları da oradadır. Hedefli temizlik (`.next`, `npm cache clean`)
> tercih edin.

---

## 20.07.2026 - 23:15 — Faz 4 / Parça 1 Tamamlandı

### Mimari Karar: Server Actions (CLAUDE.md'den Sapma)

`CLAUDE.md` §3 klasör ağacı `app/api/cms/` altında REST uçları öngörüyordu.
Kullanıcı onayıyla **Server Actions** tercih edildi: fetch/JSON/hata yakalama
tekrarı ortadan kalkıyor, tipler uçtan uca güvenli kalıyor ve önbellek
`revalidatePath` ile tek satırda tazeleniyor.

> Yine de ileride mobil uygulama veya dış entegrasyon gerekirse `app/api/cms/`
> altına REST uçları eklenebilir; Server Actions bunu engellemiyor.

### ⚠️ En Kritik Güvenlik Kuralı

**Server Action'lar herkese açık HTTP uç noktalarıdır.** Panel `proxy.ts` ile
korunsa bile action'ın kendisi doğrudan çağrılabilir. Bu yüzden:

> **Veri değiştiren HER action, ilk satırında `requireAdmin()` çağırmak
> ZORUNDADIR.** Yeni action eklerken bunu atlarsanız panel korumalı görünür ama
> veri dışarıdan değiştirilebilir olur.

`lib/actions.ts` bu altyapıyı sağlar:
- `requireAdmin()` — oturumu doğrular, admin id'sini döndürür
- `runAction()` — try-catch sarmalayıcı (CLAUDE.md §5 gereği); beklenmedik hatanın
  detayı sunucu loguna, kullanıcıya genel mesaj gider
- `ActionResult` — `{ ok, message, fieldErrors? }` ortak dönüş tipi

### Doğrulama Katmanı

`lib/validations.ts` şemaları **istemci ve sunucu tarafından paylaşılır**.
İstemci doğrulaması yalnızca kullanıcı deneyimidir; action aynı şemayla yeniden
doğrular ve alan bazlı hataları forma geri yansıtır.

> ⚠️ **`z.preprocess` kullanmayın.** Girdi tipini `unknown`'a çevirdiği için
> `zodResolver` tip uyuşmazlığı üretir — ilk denemede bu hatayla karşılaşıldı.
> Opsiyonel alanlar boş string kabul eder; `null`'a çevirme işi action'da
> `emptyToNull()` ile yapılır.

**bcrypt tuzağı:** Şifre uzunluğu 72 karakterle sınırlandı. bcrypt 72 baytın
ötesini **sessizce yok sayar** — sınır konmazsa kullanıcı uzun şifre girdiğini
sanır ama fazlası hiç doğrulanmaz.

### Kurulan Modüller

| Rota | İçerik |
| :--- | :--- |
| `/admin/hero-settings` | Slogan + alt slogan |
| `/admin/about-settings` | Başlık + metin (görsel Parça 2'de) |
| `/admin/contact-settings` | İletişim, sosyal medya, ofis koordinatı |
| `/admin/account` | Şifre değiştirme + oturum bilgileri |

Ortak bileşenler: `components/admin/form-shell.tsx` (`FormShell` + `Field`) —
başlık, kaydet çubuğu, "kaydedilmemiş değişiklik" uyarısı ve erişilebilir
etiket/hata bağlantıları.

Her action `revalidatePath("/")` çağırır; ziyaretçi sayfası `force-dynamic`
olduğu için değişiklik anında yansır.

### Şifre Değiştirme — Güvenlik Borcu Kapatıldı

Faz 1'den beri taşınan `DegistirBeni2026!` borcu artık panelden çözülebilir.
Mevcut şifre doğrulanmadan değişikliğe izin verilmiyor — oturumu ele geçiren biri
şifreyi değiştirip hesabı kalıcı olarak devralamasın diye.

### Test Sonuçları (20.07.2026 - 23:15)

| Test | Sonuç |
| :--- | :--- |
| `npm run build` | ✅ Temiz, 10 rota |
| `npx tsc --noEmit` | ✅ |
| `npx eslint` | ✅ |
| Tüm action'larda `requireAdmin()` | ✅ 4/4 |
| Tüm action'larda `"use server"` | ✅ 4/4 |
| Oturumla sayfalar | ✅ 5/5 HTTP 200 |
| Girişsiz sayfalar | ✅ 307 → `/login` |
| Formlar DB'den doluyor | ✅ |
| Zod şema birim testleri | ✅ 25/25 |

> **Not:** Form kaydetme akışı (butona tıklayıp veritabanına yazma) uçtan uca
> test edilmedi — Server Action'lar build'e özgü bir eylem kimliğiyle çağrıldığı
> için curl ile tetiklemek pratik değil. Doğrulama şemaları, yetki kontrolü ve
> okuma yolu test edildi; yazma yolunu tarayıcıda denemek gerekiyor.

---

## 20.07.2026 - 19:10 — Faz 3 Tamamlandı

### Kimlik Doğrulama Mimarisi

**Auth.js v5** (`next-auth@5.0.0-beta.31`) — peer dependency'leri Next 16'yı açıkça
destekliyor (`^14 || ^15 || ^16`). Credentials provider + JWT oturum (8 saat).

**Yapılandırma bilinçli olarak ikiye bölündü:**

| Dosya | Runtime | İçerik |
| :--- | :--- | :--- |
| `lib/auth.config.ts` | **Edge** | Sayfa yolları, callback'ler, oturum stratejisi. `providers: []` |
| `lib/auth.ts` | **Node** | Credentials provider, Prisma sorgusu, bcrypt karşılaştırma |

> ⚠️ **`lib/auth.ts`'i ASLA `proxy.ts`'e import etmeyin.** Proxy Edge runtime'da
> çalışır; Prisma (mariadb driver adapter) ve bcrypt orada çalışmaz. Rota koruması
> yalnızca `auth.config.ts` kullanır.

### `middleware.ts` → `proxy.ts` (Next 16 Değişikliği)

Next.js 16, `middleware` dosya konvansiyonunu **deprecate etti**; yerine `proxy`
geldi. Dev sunucusu bunu uyarı olarak bildirdi ve resmi dokümana göre taşındı:
dosya adı `proxy.ts`, dışa aktarılan fonksiyon adı `proxy`. `config.matcher` aynı.

Matcher: `["/admin/:path*", "/login"]`

### Güvenlik Kararları

- **Savunma derinliği:** Proxy koruması yeterli olsa da `app/admin/layout.tsx`
  ayrıca `auth()` kontrolü yapıp `/login`'e yönlendiriyor. Matcher yanlışlıkla
  değişirse panel yine de açılmaz.
- **Kullanıcı sayımına karşı:** `authorize()` içinde e-posta bulunamasa bile sahte
  bir hash ile `bcrypt.compare` çalıştırılıyor. Aksi halde yanıt süresi farkından
  hangi e-postaların kayıtlı olduğu anlaşılabilirdi (timing attack).
- **Hata mesajı:** Giriş ekranı daima "E-posta veya şifre hatalı" diyor; hangi
  alanın yanlış olduğu açıklanmıyor.
- **Admin sayfaları** `robots: { index: false }` ile arama motorlarına kapalı.

### Rota Yapısı — CLAUDE.md'den Sapma

`CLAUDE.md` §3 klasör ağacı `app/(admin)/dashboard/` gösteriyor. Ancak route group
parantezleri URL'e yansımaz — bu yapı `/dashboard` üretirdi ve Faz 3.1'in istediği
"`/admin` altındaki rotaları koru" kuralıyla çelişirdi.

**Uygulanan:** `app/admin/…` (gerçek yol segmenti) → URL'ler `/admin/dashboard` vb.

### Yakalanan Hata: TooltipProvider

Panel ilk denemede **HTTP 500** verdi: `Tooltip must be used within TooltipProvider`.
Shadcn'in `SidebarMenuButton` bileşeni `tooltip` prop'u aldığında Radix Tooltip
kullanıyor ve sarmalayıcı gerektiriyor — kurulum çıktısında uyarılmıştı, atlanmıştı.
`app/admin/layout.tsx` artık `TooltipProvider` ile sarılı.

> İlginç detay: sayfa **içeriği doğru render oluyordu**, hata render sonrası
> fırlıyordu. HTML'e bakarak "çalışıyor" sanmak mümkündü — HTTP durum kodunu
> kontrol etmek bu yüzden önemli.

### Test Sonuçları (20.07.2026 - 19:10)

| # | Test | Sonuç |
| :-- | :--- | :--- |
| 1 | Girişsiz `/admin/dashboard` | ✅ 307 → `/login?callbackUrl=…` |
| 2 | Girişsiz `/admin` | ✅ 307 → `/login` |
| 3 | `/login` erişilebilir | ✅ 200 |
| 4 | Ana sayfa açık kaldı | ✅ 200 |
| 5 | Yanlış şifre | ✅ Reddedildi, oturum açılmadı |
| 6 | Doğru şifre | ✅ Oturum çerezi oluştu |
| 7 | Oturumla panel | ✅ 200, veriler doğru |
| 8 | `/admin` → `/admin/dashboard` | ✅ 307 |
| 9 | Girişliyken `/login` | ✅ 302 → panele |
| 10 | Kurcalanmış çerez | ✅ Reddedildi |
| 11 | Çıkış sonrası erişim | ✅ Reddedildi |

`npm run build` ✅ · `npx tsc --noEmit` ✅

### Test Yazarken Düşülen Tuzak

`dotenv` v17 **stdout'a bir banner basıyor** (`◇ injected env (6) from .env`).
Kabuktan `PW=$(node -e "require('dotenv').config(); …")` ile şifre okumak bu
banner'ı da değişkene katıyor (17 yerine 90 karakter) ve giriş testi sahte olarak
başarısız oluyor. Kabuk scriptlerinde `.env`'den doğrudan okuyun.

### Yakalanan Hata 3: next-themes Kaldırıldı (React 19 Uyumsuzluğu)

Hata 2'nin çözümü (ThemeProvider'ı kök layout'a taşımak) yetmedi; script hatası
devam etti ve yanına bir de **hydration uyuşmazlığı** eklendi.

**Teşhis — iki hata tek kökten:**

1. `next-themes`, tema script'ini bir **client component** içinden render eder.
2. React 19, bileşen ağacı içindeki `<script>`'leri istemcide render etmez
   (→ *"Encountered a script tag while rendering React component"*).
3. Dolayısıyla istemci ağacında script yok, ama sunucu DOM'unda var — **bir düğüm
   fazla**. Hydration sırasında her şey bir kayıyor.
4. React, beklediği `<div data-slot="sidebar-wrapper">` yerine `<script>` ile
   karşılaşıyor. Script'in `data-slot`'u ve `style`'ı olmadığı için hata ekranında
   `data-slot={null}`, `style={{}}` görünüyordu (→ *hydration failed*).

Sunucu HTML'i incelenerek doğrulandı: tema `</script>`'i ile `sidebar-wrapper`
div'i yan yanaydı. `next-themes` 0.4.6 son sürüm — beklenecek bir düzeltme yok.

**Çözüm: script'e olan ihtiyaç ortadan kaldırıldı.**

Tema artık bir **çerezde** tutulup sunucuda doğrudan `<html>` sınıfına yazılıyor:

| Dosya | Rol |
| :--- | :--- |
| `lib/theme.ts` | Sabitler ve tip — **hem sunucu hem istemci** kullanır |
| `lib/theme-server.ts` | `getTheme()` — `next/headers` ile çerezi okur, `server-only` |
| `components/admin/theme-toggle.tsx` | Düğme; çereze yazar + sınıfı anında uygular |
| `app/layout.tsx` | Çerezi okuyup `<html>`'e `dark` sınıfını basar |

`next-themes` bağımlılığı tamamen kaldırıldı. `components/ui/sonner.tsx` de ondan
`useTheme` import ediyordu — o da bağımsızlaştırıldı (Sonner'ın CSS değişkenleri
zaten `.dark` sınıfını takip ediyor).

> ⚠️ **`lib/theme.ts`'e `next/headers` gibi sunucu-only bir şey EKLEMEYİN.**
> Client component'ler oradan import ediyor. İlk denemede sabitler ve `getTheme()`
> aynı dosyadaydı; client component dosyayı import edince `next/headers` de
> sürüklenip derleme kırıldı (HTTP 500). Bu yüzden ikiye ayrıldı ve sunucu
> tarafına `server-only` paketi eklendi — yanlışlıkla sızarsa anlaşılır hata verir.

**Kazanç:** bir bağımlılık eksildi, FOUC yok (tema ilk HTML'de doğru), script yok,
hydration uyuşmazlığı yok. Ziyaretçi sitesi varsayılan olarak açık temada kalır;
dark mode yalnızca admin panelindeki düğmeyle açılır.

**Doğrulama:** panel HTTP 200 · `body` ilk çocuğu artık doğrudan `sidebar-wrapper`
(araya giren script yok) · çerez `dark` iken `<html class="… dark">` · typecheck,
ESLint ve production build temiz.

### Yakalanan Hata 2: ThemeProvider Yanlış Katmandaydı

Panele girildiğinde konsola şu hata düşüyordu:

> *Encountered a script tag while rendering React component. Scripts inside React
> components are never executed when rendering on the client.*

**Sebep:** `next-themes`, tema sınıfını hidrasyondan önce `<html>`'e yazmak için bir
`<script>` enjekte eder (açılışta beyaz parlamayı önlemek için). `ThemeProvider`
`app/admin/layout.tsx` içindeydi; `/login` → panel geçişi **istemci tarafı navigasyon**
olduğu için provider tarayıcıda mount oluyor, istemcide render edilen script ise
hiç çalışmıyordu. Yani tema script'i sessizce işlevsizdi.

**Çözüm:** `ThemeProvider` kök layout'a (`app/layout.tsx`) taşındı; bileşen de
`components/admin/` yerine `components/theme-provider.tsx` altına alındı.

> ⚠️ **ThemeProvider'ı iç layout'lara taşımayın.** Kök layout'ta olmak zorunda,
> yoksa script sunucu HTML'ine girmez.

**Yapılandırma tercihi:** `defaultTheme="light"`, `enableSystem={false}`.
Ziyaretçi sitesi bilinçli olarak sabit tasarımdır — işletim sistemi koyu temadaysa
kendiliğinden değişmemeli. Dark mode yalnızca admin panelindeki düğmeyle açılır.

### ⚠️ Devredilen Güvenlik Borcu

`.env` içindeki `SEED_ADMIN_*` şifreleri hâlâ `DegistirBeni2026!`.
**Giriş artık çalıştığına göre bu şifreler değiştirilmeli.** Faz 4'te admin panele
şifre değiştirme ekranı eklenene kadar, `.env`'deki değerleri güncelleyip
`npm run db:seed` çalıştırmak yeterli (seed `upsert` ile hash'i günceller).

> ❌ **GEÇERSİZ (21.07.2026 - 10:45):** Yukarıdaki `db:seed` yöntemi artık
> çalışmaz. Seed, mevcut hesapların şifresini bilinçli olarak ezmiyor —
> gerekçesi 21.07.2026 - 10:45 girdisinde. Şifre `/admin/account` ekranından
> değiştirilir. Borcun güncel durumu için de aynı girdiye bakın.

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

- ~~`git init` henüz yapılmadı~~ → ✅ **Kapandı.** Proje git altında, `origin/main`'e push'lanıyor.
- ~~`public/uploads/` boş~~ → ✅ **Kapandı** (Faz 4/Parça 2). Yükleme altyapısı kuruldu;
  seed'in kırık görsel yolları da Faz 2'de temizlenmişti.
- `npm audit` 5 orta seviye uyarı veriyor (geçişli bağımlılıklar, acil değil) — **hâlâ açık**
- `@types/node` hâlâ `^20`, Node ise 24 — şu an sorun çıkarmıyor — **hâlâ açık**

---

> **Bu noktadan yukarısı tarihsel kayıttır.** Projenin güncel durumu ve sıradaki
> adım için dosyanın en başındaki **"Güncel Durum"** bölümüne bakın.
