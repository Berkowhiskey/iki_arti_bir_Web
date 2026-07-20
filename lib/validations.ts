import { z } from "zod";

/**
 * Zod şemaları — istemci ve sunucu tarafından PAYLAŞILIR.
 *
 * İstemcide React Hook Form anlık geri bildirim için kullanır; sunucuda Server
 * Action aynı şemayla yeniden doğrular. İstemci doğrulaması yalnızca kullanıcı
 * deneyimidir, güvenlik değildir — sunucu tarafı doğrulama asla atlanmaz.
 *
 * ⚠️ **`z.preprocess` kullanmayın.** Girdi tipini `unknown`'a çevirdiği için
 * `zodResolver` ile tip uyuşmazlığı üretir. Opsiyonel alanlar boş string kabul
 * eder ve `null`'a çevirme işi Server Action'da yapılır (`emptyToNull`).
 */

/** Opsiyonel metin alanları formdan boş string olarak gelir; DB'ye null yazılır. */
export function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Boş bırakılabilen alan: ya boş string ya da kurala uyan değer. */
function optional<T extends z.ZodType<string>>(schema: T) {
  return z.union([z.literal(""), schema]);
}

// ---------------------------------------------------------------- Hero

export const heroSchema = z.object({
  slogan: z
    .string()
    .trim()
    .min(1, "Slogan boş bırakılamaz.")
    .max(200, "Slogan en fazla 200 karakter olabilir."),
  subSlogan: z
    .string()
    .trim()
    .max(500, "Alt slogan en fazla 500 karakter olabilir."),
});

export type HeroValues = z.infer<typeof heroSchema>;

// ---------------------------------------------------------- Hakkımızda

export const aboutSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Başlık boş bırakılamaz.")
    .max(120, "Başlık en fazla 120 karakter olabilir."),
  content: z
    .string()
    .trim()
    .min(1, "Metin boş bırakılamaz.")
    .max(5000, "Metin en fazla 5000 karakter olabilir."),
});

export type AboutValues = z.infer<typeof aboutSchema>;

// ------------------------------------------------------------- İletişim

/**
 * Koordinatlar string olarak tutulur: Prisma Decimal alanına string verilir,
 * böylece kayan nokta yuvarlama hatası hiç devreye girmez.
 */
const latitudeValue = z
  .string()
  .trim()
  .regex(/^-?\d{1,2}(\.\d{1,7})?$/, "Enlem formatı geçersiz (örn: 38.6689000).")
  .refine((value) => {
    const num = Number(value);
    return num >= -90 && num <= 90;
  }, "Enlem -90 ile 90 arasında olmalı.");

const longitudeValue = z
  .string()
  .trim()
  .regex(/^-?\d{1,3}(\.\d{1,7})?$/, "Boylam formatı geçersiz (örn: 26.7561000).")
  .refine((value) => {
    const num = Number(value);
    return num >= -180 && num <= 180;
  }, "Boylam -180 ile 180 arasında olmalı.");

const urlValue = (label: string) =>
  z
    .string()
    .trim()
    .url(`${label} geçerli bir adres olmalı (https:// ile başlamalı).`);

export const contactSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "E-posta boş bırakılamaz.")
    .email("Geçerli bir e-posta girin."),
  phone: z
    .string()
    .trim()
    .min(1, "Telefon boş bırakılamaz.")
    .max(30, "Telefon en fazla 30 karakter olabilir."),
  address: z
    .string()
    .trim()
    .min(1, "Adres boş bırakılamaz.")
    .max(300, "Adres en fazla 300 karakter olabilir."),
  instagramUrl: optional(urlValue("Instagram adresi")),
  linkedinUrl: optional(urlValue("LinkedIn adresi")),
  mapLat: optional(latitudeValue),
  mapLng: optional(longitudeValue),
});

export type ContactValues = z.infer<typeof contactSchema>;

// ---------------------------------------------------------- Şifre değiştirme

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifrenizi girin."),
    newPassword: z
      .string()
      .min(10, "Yeni şifre en az 10 karakter olmalı.")
      // bcrypt 72 baytın ötesini sessizce yok sayar — sınırı açıkça koyuyoruz.
      .max(72, "Yeni şifre en fazla 72 karakter olabilir.")
      .regex(/[a-zçğıöşü]/, "Yeni şifre en az bir küçük harf içermeli.")
      .regex(/[A-ZÇĞİÖŞÜ]/, "Yeni şifre en az bir büyük harf içermeli.")
      .regex(/\d/, "Yeni şifre en az bir rakam içermeli."),
    confirmPassword: z.string().min(1, "Yeni şifreyi tekrar girin."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Yeni şifre mevcut şifreyle aynı olamaz.",
    path: ["newPassword"],
  });

export type PasswordValues = z.infer<typeof passwordSchema>;
