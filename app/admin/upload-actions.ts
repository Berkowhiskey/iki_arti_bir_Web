"use server";

import { requireAdmin, runAction, type ActionResult } from "@/lib/actions";
import { saveUpload, UploadError } from "@/lib/uploads";

/**
 * Görsel yükler ve ziyaretçiye sunulacak yolu döndürür.
 *
 * Tüm CMS modülleri (Hakkımızda, Ekip, Proje kapağı, Proje galerisi) bu tek
 * action'ı kullanır. Dosya seçilir seçilmez çalışır; formun kaydedilmesini
 * beklemez, böylece kullanıcı önizlemeyi anında görür.
 *
 * ⚠️ **Yan etki:** Görsel yükleyip formu kaydetmeden çıkan bir kullanıcı diskte
 * sahipsiz bir dosya bırakır. Zararsızdır (yalnızca yer kaplar, adresini kimse
 * bilmez). Gerekirse ileride `public/uploads` içeriğiyle veritabanındaki
 * yolları karşılaştıran bir temizlik komutu yazılabilir.
 */
export async function uploadImage(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  return runAction<{ url: string }>(async () => {
    await requireAdmin();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { ok: false, message: "Dosya alınamadı." };
    }

    try {
      const url = await saveUpload(file);
      return { ok: true, message: "Görsel yüklendi.", data: { url } };
    } catch (error) {
      // Kullanıcı hatası (tür/boyut) doğrudan gösterilir; gerisi runAction'a.
      if (error instanceof UploadError) {
        return { ok: false, message: error.message };
      }
      throw error;
    }
  });
}
