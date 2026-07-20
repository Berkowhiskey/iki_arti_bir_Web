"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormShell } from "@/components/admin/form-shell";
import { contactSchema, type ContactValues } from "@/lib/validations";
import { updateContactSettings } from "./actions";

export function ContactForm({
  defaultValues,
}: {
  defaultValues: ContactValues;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await updateContactSettings(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof ContactValues, { message: messages[0] });
          }
        }
      }
      toast.error("Kaydedilemedi", { description: result.message });
      return;
    }

    reset(values);
    toast.success(result.message);
  });

  return (
    <FormShell
      title="İletişim Bilgileri"
      description="Ana sayfanın iletişim bölümünde gösterilen bilgiler ve sosyal medya adresleri."
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      onSubmit={onSubmit}
    >
      <Field label="E-posta" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </Field>

      <Field label="Telefon" htmlFor="phone" error={errors.phone?.message}>
        <Input
          id="phone"
          type="tel"
          aria-invalid={Boolean(errors.phone)}
          {...register("phone")}
        />
      </Field>

      <Field label="Adres" htmlFor="address" error={errors.address?.message}>
        <Textarea
          id="address"
          rows={3}
          aria-invalid={Boolean(errors.address)}
          {...register("address")}
        />
      </Field>

      <div className="border-t pt-6">
        <h2 className="mb-4 text-sm font-medium">Sosyal medya</h2>
        <div className="space-y-6">
          <Field
            label="Instagram"
            htmlFor="instagramUrl"
            error={errors.instagramUrl?.message}
            hint="İsteğe bağlı. Boş bırakılırsa sitede gösterilmez."
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
              placeholder="https://linkedin.com/company/..."
              aria-invalid={Boolean(errors.linkedinUrl)}
              {...register("linkedinUrl")}
            />
          </Field>
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="mb-1 text-sm font-medium">Ofis konumu</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Google Haritalar&apos;da konuma sağ tıklayıp koordinatları
          kopyalayabilirsiniz. İsteğe bağlıdır.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Enlem" htmlFor="mapLat" error={errors.mapLat?.message}>
            <Input
              id="mapLat"
              inputMode="decimal"
              placeholder="38.6689000"
              aria-invalid={Boolean(errors.mapLat)}
              {...register("mapLat")}
            />
          </Field>

          <Field label="Boylam" htmlFor="mapLng" error={errors.mapLng?.message}>
            <Input
              id="mapLng"
              inputMode="decimal"
              placeholder="26.7561000"
              aria-invalid={Boolean(errors.mapLng)}
              {...register("mapLng")}
            />
          </Field>
        </div>
      </div>
    </FormShell>
  );
}
