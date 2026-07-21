"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/app/admin/upload-actions";
import { addProjectImage, deleteProjectImage } from "./actions";

type GalleryImage = { id: number; url: string };

/**
 * Proje galerisi — kapak görselinden ayrı, çoklu görsel yönetimi.
 *
 * Formdan bağımsız çalışır: yüklenen görsel anında veritabanına yazılır, silme
 * de anında uygulanır. Bu yüzden bileşen yalnızca **düzenleme** ekranında
 * gösterilir; henüz kaydedilmemiş bir projenin galerisi olamaz (görselin
 * bağlanacağı `projectId` yoktur).
 */
export function GalleryManager({
  projectId,
  images,
}: {
  projectId: number;
  images: GalleryImage[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSelect(files: FileList | null) {
    if (!files || files.length === 0) return;

    const selected = Array.from(files);

    startTransition(async () => {
      let added = 0;

      // Sırayla yükleniyor — aynı anda gönderilirse `order` alanı için
      // yapılan "son sıra + 1" sorgusu yarışa girip aynı değeri üretebilir.
      for (const file of selected) {
        const formData = new FormData();
        formData.append("file", file);

        const uploaded = await uploadImage(formData);

        if (!uploaded.ok || !uploaded.data) {
          toast.error(`${file.name} yüklenemedi`, {
            description: uploaded.message,
          });
          continue;
        }

        const saved = await addProjectImage(projectId, uploaded.data.url);

        if (!saved.ok) {
          toast.error(`${file.name} galeriye eklenemedi`, {
            description: saved.message,
          });
          continue;
        }

        added++;
      }

      if (added > 0) {
        toast.success(`${added} görsel galeriye eklendi.`);
        router.refresh();
      }
    });

    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDelete(imageId: number) {
    startTransition(async () => {
      const result = await deleteProjectImage(imageId);

      if (!result.ok) {
        toast.error("Silinemedi", { description: result.message });
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <section className="mx-auto mt-10 max-w-2xl">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-light tracking-tight">Galeri</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Proje detay sayfasında gösterilecek görseller. Değişiklikler anında
            kaydedilir.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ImageUp className="h-4 w-4" aria-hidden="true" />
          )}
          Görsel ekle
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        aria-label="Galeriye görsel ekle"
        onChange={(event) => handleSelect(event.target.files)}
      />

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Galeride henüz görsel yok.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <li
              key={image.id}
              className="group relative aspect-video overflow-hidden rounded-md border bg-muted"
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 200px"
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isPending}
                aria-label="Bu görseli sil"
                className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                onClick={() => handleDelete(image.id)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        JPG, PNG veya WEBP · her biri en fazla 5 MB. Birden fazla dosya
        seçebilirsiniz.
      </p>
    </section>
  );
}
