"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FormShell } from "@/components/admin/form-shell";
import { ImageField } from "@/components/admin/image-field";
import { projectSchema, type ProjectValues } from "@/lib/validations";
import { createProject, updateProject } from "./actions";

type ProjectFormProps = {
  defaultValues: ProjectValues;
  projectId?: number;
};

const CATEGORY_OPTIONS = [
  { value: "MIMARLIK", label: "Mimarlık" },
  { value: "MUHENDISLIK", label: "Mühendislik" },
  { value: "IC_DIZAYN", label: "İç Dizayn" },
] as const;

export function ProjectForm({ defaultValues, projectId }: ProjectFormProps) {
  const router = useRouter();
  const isEdit = projectId !== undefined;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  // Gerekçesi team-form.tsx'te — kontrollü alanlar için `watch()` değil `useWatch`.
  const coverImage = useWatch({ control, name: "coverImage" });
  const category = useWatch({ control, name: "category" });
  const isPublished = useWatch({ control, name: "isPublished" });

  const onSubmit = handleSubmit(async (values) => {
    const result = isEdit
      ? await updateProject(projectId, values)
      : await createProject(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof ProjectValues, { message: messages[0] });
          }
        }
      }
      toast.error("Kaydedilemedi", { description: result.message });
      return;
    }

    toast.success(result.message);

    if (isEdit) {
      reset(values);
      router.refresh();
    } else {
      router.push("/admin/portfolio");
    }
  });

  return (
    <FormShell
      title={isEdit ? "Projeyi düzenle" : "Yeni proje"}
      description="Ana sayfadaki portfolyo bölümünde gösterilecek şantiye/proje bilgileri."
      isSubmitting={isSubmitting}
      isDirty={isEdit ? isDirty : true}
      onSubmit={onSubmit}
      submitLabel={isEdit ? "Kaydet" : "Ekle"}
    >
      <Field label="Proje adı" htmlFor="title" error={errors.title?.message}>
        <Input
          id="title"
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
      </Field>

      <Field
        label="Kategori"
        htmlFor="category"
        error={errors.category?.message}
      >
        <Select
          value={category}
          onValueChange={(value) =>
            setValue("category", value as ProjectValues["category"], {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="Seçin" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field
        label="Lokasyon"
        htmlFor="location"
        error={errors.location?.message}
        hint="Örn: Foça / İzmir"
      >
        <Input
          id="location"
          aria-invalid={Boolean(errors.location)}
          {...register("location")}
        />
      </Field>

      <Field
        label="Açıklama"
        htmlFor="description"
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          rows={10}
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Enlem"
          htmlFor="latitude"
          error={errors.latitude?.message}
          hint="Örn: 38.6689000"
        >
          <Input
            id="latitude"
            inputMode="decimal"
            aria-invalid={Boolean(errors.latitude)}
            {...register("latitude")}
          />
        </Field>

        <Field
          label="Boylam"
          htmlFor="longitude"
          error={errors.longitude?.message}
          hint="Örn: 26.7561000"
        >
          <Input
            id="longitude"
            inputMode="decimal"
            aria-invalid={Boolean(errors.longitude)}
            {...register("longitude")}
          />
        </Field>
      </div>

      <p className="-mt-2 text-xs text-muted-foreground">
        Koordinatı Google Haritalar&apos;da konuma sağ tıklayıp ilk satıra
        tıklayarak kopyalayabilirsiniz.
      </p>

      <ImageField
        label="Kapak görseli"
        value={coverImage}
        onChange={(url) =>
          setValue("coverImage", url, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
        hint="Portfolyo kartında görünen görsel. İsteğe bağlı."
      />
      {errors.coverImage?.message && (
        <p role="alert" className="text-xs text-destructive">
          {errors.coverImage.message}
        </p>
      )}

      <Field
        label="Adres (slug)"
        htmlFor="slug"
        error={errors.slug?.message}
        hint="Boş bırakırsanız proje adından otomatik üretilir. Örn: foca-villa-projesi"
      >
        <Input
          id="slug"
          aria-invalid={Boolean(errors.slug)}
          {...register("slug")}
        />
      </Field>

      <Field
        label="Sıra"
        htmlFor="order"
        error={errors.order?.message}
        hint="Küçük sayı önce gösterilir."
      >
        <Input
          id="order"
          inputMode="numeric"
          className="max-w-24"
          aria-invalid={Boolean(errors.order)}
          {...register("order")}
        />
      </Field>

      <div className="flex items-center justify-between rounded-md border p-4">
        <div>
          <label htmlFor="isPublished" className="text-sm font-medium">
            Sitede yayında
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Kapatılırsa proje silinmez, yalnızca ana sayfada gizlenir.
          </p>
        </div>
        <Switch
          id="isPublished"
          checked={isPublished}
          onCheckedChange={(checked) =>
            setValue("isPublished", checked, { shouldDirty: true })
          }
        />
      </div>
    </FormShell>
  );
}
