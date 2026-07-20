"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Field, FormShell } from "@/components/admin/form-shell";
import { passwordSchema, type PasswordValues } from "@/lib/validations";
import { changePassword } from "./actions";

export function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await changePassword(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof PasswordValues, { message: messages[0] });
          }
        }
      }
      toast.error("Şifre değiştirilemedi", { description: result.message });
      return;
    }

    // Şifreler formda kalmasın.
    reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast.success(result.message);
  });

  return (
    <FormShell
      title="Şifre Değiştir"
      description="Güvenliğiniz için şifrenizi düzenli olarak güncelleyin."
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      onSubmit={onSubmit}
      submitLabel="Şifreyi güncelle"
    >
      <Field
        label="Mevcut şifre"
        htmlFor="currentPassword"
        error={errors.currentPassword?.message}
      >
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword)}
          {...register("currentPassword")}
        />
      </Field>

      <Field
        label="Yeni şifre"
        htmlFor="newPassword"
        error={errors.newPassword?.message}
        hint="En az 10 karakter; büyük harf, küçük harf ve rakam içermeli."
      >
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.newPassword)}
          {...register("newPassword")}
        />
      </Field>

      <Field
        label="Yeni şifre (tekrar)"
        htmlFor="confirmPassword"
        error={errors.confirmPassword?.message}
      >
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
      </Field>
    </FormShell>
  );
}
