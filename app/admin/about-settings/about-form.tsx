"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormShell } from "@/components/admin/form-shell";
import { ImageField } from "@/components/admin/image-field";
import { aboutSchema, type AboutValues } from "@/lib/validations";
import { updateAboutSettings } from "./actions";

export function AboutForm({ defaultValues }: { defaultValues: AboutValues }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AboutValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues,
  });

  const imageUrl = useWatch({ control, name: "imageUrl" });

  const onSubmit = handleSubmit(async (values) => {
    const result = await updateAboutSettings(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof AboutValues, { message: messages[0] });
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
      title="Hakkımızda"
      description="Ana sayfadaki tanıtım bölümünün başlığı ve metni."
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      onSubmit={onSubmit}
    >
      <Field label="Başlık" htmlFor="title" error={errors.title?.message}>
        <Input
          id="title"
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
      </Field>

      <Field
        label="Metin"
        htmlFor="content"
        error={errors.content?.message}
        hint="Paragrafları ayırmak için aralarına boş bir satır bırakın."
      >
        <Textarea
          id="content"
          rows={14}
          aria-invalid={Boolean(errors.content)}
          {...register("content")}
        />
      </Field>

      <ImageField
        label="Bölüm görseli"
        value={imageUrl}
        onChange={(url) =>
          setValue("imageUrl", url, { shouldDirty: true, shouldValidate: true })
        }
        hint="İsteğe bağlı. JPG, PNG veya WEBP · en fazla 5 MB."
      />
      {errors.imageUrl?.message && (
        <p role="alert" className="text-xs text-destructive">
          {errors.imageUrl.message}
        </p>
      )}
    </FormShell>
  );
}
