import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Görsel yükleme altyapısı — dosyalar `public/uploads/` altına yazılır.
 *
 * Depolama tercihi: **yerel disk**. Proje kendi sunucusunda (VPS) yayınlanacağı
 * için dosya sistemi kalıcıdır; ek servis, API anahtarı ve ücret gerekmez.
 *
 * ⚠️ **Vercel/Netlify'a taşınırsa bu modül çalışmaz** — o platformlarda dosya
 * sistemi geçicidir, her deploy'da yüklenen görseller silinir. Taşıma durumunda
 * yalnızca bu dosyanın içi bulut depolamaya (UploadThing/S3/Cloudinary)
 * çevrilmeli; çağıran taraf `/uploads/...` yerine tam URL alacağı için
 * arayüzde değişiklik gerekmez.
 */

/** Kabul edilen türler — imza (magic bytes) ile doğrulanır, uzantıya güvenilmez. */
const ALLOWED = [
  { ext: "jpg", mime: "image/jpeg" },
  { ext: "png", mime: "image/png" },
  { ext: "webp", mime: "image/webp" },
] as const;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const ACCEPTED_MIME = ALLOWED.map((a) => a.mime).join(",");
export const MAX_UPLOAD_LABEL = "5 MB";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads/";

/** Yüklenen dosya adının üretildiği desen — silme işleminde tekrar doğrulanır. */
const SAFE_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

/**
 * Dosyanın gerçek türünü içeriğinden tespit eder.
 *
 * ⚠️ İstemcinin bildirdiği `file.type` ve dosya adı **doğrulama için
 * kullanılmaz** — ikisi de kolayca uydurulur. `.jpg` adı verilmiş bir betiği
 * yakalamanın tek güvenilir yolu baytlara bakmaktır.
 */
function detectType(bytes: Uint8Array): (typeof ALLOWED)[number] | null {
  if (bytes.length < 12) return null;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return ALLOWED[0];
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.every((byte, i) => bytes[i] === byte)) {
    return ALLOWED[1];
  }

  // WEBP: "RIFF" .... "WEBP"
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return ALLOWED[2];
  }

  return null;
}

/**
 * Dosyayı diske yazar ve ziyaretçiye sunulacak yolu (`/uploads/...`) döndürür.
 *
 * Dosya adı **tamamen yeniden üretilir** (UUID + tespit edilen uzantı); istemciden
 * gelen ad hiç kullanılmaz. Bu, dizin gezinme (`../../`), çift uzantı
 * (`resim.jpg.php`) ve ad çakışması sorunlarını tek hamlede ortadan kaldırır.
 */
export async function saveUpload(file: File): Promise<string> {
  if (file.size === 0) {
    throw new UploadError("Dosya boş görünüyor.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(`Dosya en fazla ${MAX_UPLOAD_LABEL} olabilir.`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectType(bytes);

  if (!type) {
    throw new UploadError(
      "Yalnızca JPG, PNG veya WEBP görseli yükleyebilirsiniz."
    );
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}.${type.ext}`;
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return `${PUBLIC_PREFIX}${filename}`;
}

/**
 * Yüklenmiş bir görseli diskten siler. Görsel değiştirildiğinde veya kaydı
 * silindiğinde çağrılır ki `public/uploads` şişmesin.
 *
 * Sessizce başarısız olur: dosya zaten yoksa veya yol bizim ürettiğimiz desene
 * uymuyorsa hiçbir şey yapmaz. **Bu yüzden veri silme işlemi görsel silinemedi
 * diye yarıda kalmaz** — artık bir dosya, kayıp kayıttan iyidir.
 */
export async function deleteUpload(url: string | null | undefined) {
  if (!url || !url.startsWith(PUBLIC_PREFIX)) return;

  const filename = url.slice(PUBLIC_PREFIX.length);

  // Desene uymayan hiçbir şey silinmez — dışarıdan gelen bir yol
  // `public/` içinde başka bir dosyayı hedefleyemesin diye.
  if (!SAFE_NAME.test(filename)) return;

  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // Dosya yoksa sorun değil.
  }
}
