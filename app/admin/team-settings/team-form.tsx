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
import { teamSchema, type TeamValues } from "@/lib/validations";
import { createTeamMember, updateTeamMember } from "./actions";

type TeamFormProps = {
  defaultValues: TeamValues;
  /** Düzenleme modunda kaydın id'si; yeni kayıtta undefined. */
  memberId?: number;
};

/**
 * Tema seçenekleri.
 *
 * ⚠️ `value`'lar veritabanındaki `Discipline` enum'undan gelir ve
 * **değiştirilemez**; yalnızca etiketler palet adlarına çevrildi. Alan bir
 * meslek bilgisi taşımıyor, sadece kartın hangi renkle çizileceğini belirliyor.
 */
const THEME_OPTIONS = [
  { value: "MUHENDISLIK", label: "Beton" },
  { value: "MIMARLIK", label: "Meşe" },
  { value: "DIGER", label: "Antrasit" },
] as const;

export function TeamForm({ defaultValues, memberId }: TeamFormProps) {
  const router = useRouter();
  const isEdit = memberId !== undefined;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TeamValues>({
    resolver: zodResolver(teamSchema),
    defaultValues,
  });

  // Kontrollü alanlar (ImageField, Select, Switch) `register` ile bağlanamaz;
  // değerleri `useWatch` ile izlenir. `watch()` yerine bu tercih ediliyor —
  // yalnızca ilgili alan değişince yeniden render eder.
  const imageUrl = useWatch({ control, name: "imageUrl" });
  const discipline = useWatch({ control, name: "discipline" });
  const isActive = useWatch({ control, name: "isActive" });

  const onSubmit = handleSubmit(async (values) => {
    const result = isEdit
      ? await updateTeamMember(memberId, values)
      : await createTeamMember(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof TeamValues, { message: messages[0] });
          }
        }
      }
      toast.error("Kaydedilemedi", { description: result.message });
      return;
    }

    toast.success(result.message);

    if (isEdit) {
      // Formu yeni değerlerle "temiz" hale getir, sayfada kal.
      reset(values);
      router.refresh();
    } else {
      // Yeni kayıt sonrası listeye dön — ekleme ekranında kalmanın anlamı yok.
      router.push("/admin/team-settings");
    }
  });

  return (
    <FormShell
      title={isEdit ? "Ekip üyesini düzenle" : "Yeni ekip üyesi"}
      description="Ana sayfadaki ekip bölümünde gösterilecek bilgiler."
      isSubmitting={isSubmitting}
      // Yeni kayıtta form baştan boş olduğu için isDirty beklenmemeli.
      isDirty={isEdit ? isDirty : true}
      onSubmit={onSubmit}
      submitLabel={isEdit ? "Kaydet" : "Ekle"}
    >
      <Field label="İsim" htmlFor="name" error={errors.name?.message}>
        <Input
          id="name"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
      </Field>

      <Field
        label="Unvan"
        htmlFor="title"
        error={errors.title?.message}
        hint="Örn: Mimar, İnşaat Mühendisi"
      >
        <Input
          id="title"
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
      </Field>

      <Field label="Biyografi" htmlFor="bio" error={errors.bio?.message}>
        <Textarea
          id="bio"
          rows={8}
          aria-invalid={Boolean(errors.bio)}
          {...register("bio")}
        />
      </Field>

      <Field
        label="Tema"
        htmlFor="discipline"
        error={errors.discipline?.message}
        hint="Kartın ana sayfada hangi renkle gösterileceğini belirler; sıralamadan bağımsızdır."
      >
        <Select
          value={discipline}
          onValueChange={(value) =>
            setValue("discipline", value as TeamValues["discipline"], {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="discipline" className="w-full">
            <SelectValue placeholder="Seçin" />
          </SelectTrigger>
          <SelectContent>
            {THEME_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <ImageField
        label="Fotoğraf"
        value={imageUrl}
        onChange={(url) =>
          setValue("imageUrl", url, { shouldDirty: true, shouldValidate: true })
        }
        aspect="3/4"
        hint="İsteğe bağlı. Boş bırakılırsa ana sayfada isim baş harfi gösterilir."
      />
      {errors.imageUrl?.message && (
        <p role="alert" className="text-xs text-destructive">
          {errors.imageUrl.message}
        </p>
      )}

      {/* Sosyal medya — kişiye ait hesaplar. İletişim ayarlarındaki firma
          hesaplarından ayrıdır ve yalnızca detay sayfasında gösterilir. */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Instagram"
          htmlFor="instagramUrl"
          error={errors.instagramUrl?.message}
          hint="İsteğe bağlı. Boş bırakılırsa ikon gösterilmez."
        >
          <Input
            id="instagramUrl"
            type="url"
            placeholder="https://instagram.com/kullaniciadi"
            aria-invalid={Boolean(errors.instagramUrl)}
            {...register("instagramUrl")}
          />
        </Field>

        <Field
          label="LinkedIn"
          htmlFor="linkedinUrl"
          error={errors.linkedinUrl?.message}
          hint="İsteğe bağlı."
        >
          <Input
            id="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/in/kullaniciadi"
            aria-invalid={Boolean(errors.linkedinUrl)}
            {...register("linkedinUrl")}
          />
        </Field>
      </div>

      <Field
        label="Adres (slug)"
        htmlFor="slug"
        error={errors.slug?.message}
        hint="Detay sayfasının adresi: /ekip/… Boş bırakırsanız isimden otomatik üretilir."
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
          <label htmlFor="isActive" className="text-sm font-medium">
            Sitede görünsün
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Kapatılırsa kayıt silinmez, yalnızca ana sayfada gizlenir.
          </p>
        </div>
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) =>
            setValue("isActive", checked, { shouldDirty: true })
          }
        />
      </div>
    </FormShell>
  );
}
