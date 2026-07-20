"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormShell } from "@/components/admin/form-shell";
import { heroSchema, type HeroValues } from "@/lib/validations";
import { updateHeroSettings } from "./actions";

export function HeroForm({ defaultValues }: { defaultValues: HeroValues }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<HeroValues>({
    resolver: zodResolver(heroSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await updateHeroSettings(values);

    if (!result.ok) {
      // Sunucudan alan bazlı hata döndüyse ilgili alanlara işle.
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof HeroValues, { message: messages[0] });
          }
        }
      }
      toast.error("Kaydedilemedi", { description: result.message });
      return;
    }

    // Formu yeni değerlerle sıfırla ki "kaydedilmemiş değişiklik" uyarısı kalksın.
    reset(values);
    toast.success(result.message);
  });

  return (
    <FormShell
      title="Hero Ayarları"
      description="Ana sayfanın giriş ekranındaki slogan ve açıklama metni."
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      onSubmit={onSubmit}
    >
      <Field label="Slogan" htmlFor="slogan" error={errors.slogan?.message}>
        <Input
          id="slogan"
          aria-invalid={Boolean(errors.slogan)}
          {...register("slogan")}
        />
      </Field>

      <Field
        label="Alt slogan"
        htmlFor="subSlogan"
        error={errors.subSlogan?.message}
        hint="İsteğe bağlı. Sloganın altında görünen kısa tanıtım metni."
      >
        <Textarea
          id="subSlogan"
          rows={4}
          aria-invalid={Boolean(errors.subSlogan)}
          {...register("subSlogan")}
        />
      </Field>
    </FormShell>
  );
}
