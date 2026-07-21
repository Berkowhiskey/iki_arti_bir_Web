import "server-only";

/**
 * Benzersiz slug üretir. Çakışma varsa sonuna `-2`, `-3` ... ekler.
 *
 * Model bağımsızdır: hangi tabloya bakılacağını `findIdBySlug` geri çağrımı
 * belirler. Böylece Proje ve Ekip modülleri aynı mantığı paylaşır.
 *
 * @param base       Slug tabanı — `slugify()`'dan geçmiş olmalı.
 * @param findIdBySlug  Verilen slug'a sahip kaydın id'sini döndürür, yoksa null.
 * @param excludeId  Düzenlenen kaydın kendi id'si. Kendi slug'ını çakışma
 *                   saymamak için verilir; yoksa her kaydetmede adrese
 *                   gereksiz bir sayı eklenirdi.
 */
export async function uniqueSlug(
  base: string,
  findIdBySlug: (slug: string) => Promise<number | null>,
  excludeId?: number
): Promise<string> {
  const seed = base || "kayit";
  let candidate = seed;
  let counter = 2;

  // Pratikte 1-2 turda biter; üst sınır sonsuz döngüye karşı.
  for (let i = 0; i < 100; i++) {
    const clashId = await findIdBySlug(candidate);

    if (clashId === null || clashId === excludeId) return candidate;

    candidate = `${seed}-${counter++}`;
  }

  // Buraya düşmek neredeyse imkânsız; yine de benzersizliği garantiye alalım.
  return `${seed}-${Date.now()}`;
}
