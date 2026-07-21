"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/app/admin/upload-actions";

type ImageFieldProps = {
  label: string;
  /** Kayıtlı görselin yolu (`/uploads/...`) veya henüz yoksa null. */
  value: string | null;
  onChange: (url: string | null) => void;
  hint?: string;
  /** Önizleme kutusunun en-boy oranı. Portre görseller için "3/4". */
  aspect?: "16/9" | "3/4" | "1/1";
  /**
   * Görselin kutuya nasıl oturacağı. Fotoğraflar için `cover` (kırpar),
   * logolar için `contain` (kırpmaz, boşluk bırakır).
   *
   * ⚠️ **Ziyaretçi tarafındaki değerle aynı olmalı.** Panelde `cover`,
   * sitede `contain` kullanılırsa yönetici burada düzgün gördüğü logonun
   * sitede kırpıldığını fark edemez.
   */
  fit?: "cover" | "contain";
};

const ASPECT_CLASS = {
  "16/9": "aspect-video",
  "3/4": "aspect-3/4",
  "1/1": "aspect-square",
} as const;

/**
 * Görsel seçme / önizleme / kaldırma alanı.
 *
 * Dosya seçilir seçilmez yüklenir ve `onChange` ile yeni yol forma bildirilir.
 * Form kaydedilmeden görsel diske yazılmış olur — sahipsiz dosya ihtimali
 * `upload-actions.ts` içinde açıklandı.
 *
 * "Kaldır" yalnızca formdaki değeri temizler; diskteki eski dosya, kayıt
 * kaydedildiğinde ilgili action tarafından silinir. Böylece kullanıcı
 * kaydetmeden vazgeçerse mevcut görsel kaybolmaz.
 */
export function ImageField({
  label,
  value,
  onChange,
  hint,
  aspect = "16/9",
  fit = "cover",
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(value);

  function handleSelect(file: File | undefined) {
    if (!file) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadImage(formData);

      if (!result.ok || !result.data) {
        toast.error("Yüklenemedi", { description: result.message });
        return;
      }

      setPreview(result.data.url);
      onChange(result.data.url);
      toast.success(result.message);
    });

    // Aynı dosya tekrar seçilebilsin diye input sıfırlanır; yoksa "change"
    // olayı ikinci kez tetiklenmez.
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove() {
    setPreview(null);
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>

      <div
        className={`relative overflow-hidden rounded-md border bg-muted ${ASPECT_CLASS[aspect]} max-w-sm`}
      >
        {preview ? (
          <Image
            src={preview}
            alt=""
            fill
            sizes="384px"
            className={fit === "contain" ? "object-contain p-4" : "object-cover"}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Görsel yok
          </div>
        )}

        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          <ImageUp className="h-4 w-4" aria-hidden="true" />
          {preview ? "Değiştir" : "Görsel seç"}
        </Button>

        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Kaldır
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label={label}
        onChange={(event) => handleSelect(event.target.files?.[0])}
      />

      <p className="text-xs text-muted-foreground">
        {hint ?? "JPG, PNG veya WEBP · en fazla 5 MB."}
      </p>
    </div>
  );
}
