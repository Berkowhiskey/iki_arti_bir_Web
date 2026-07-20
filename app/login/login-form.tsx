"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gerekli.")
    .email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(1, "Şifre gerekli."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      // Hangi alanın hatalı olduğu bilinçli olarak belirtilmiyor:
      // "e-posta bulunamadı" demek kayıtlı hesapların sayımına imkân verir.
      toast.error("Giriş başarısız", {
        description: "E-posta veya şifre hatalı.",
      });
      return;
    }

    toast.success("Hoş geldiniz");
    startTransition(() => {
      router.push("/admin/dashboard");
      router.refresh();
    });
  };

  const busy = isSubmitting || isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-beton-300">
          E-posta
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="ornek@ikiartibiryapi.com"
          disabled={busy}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="border-white/15 bg-white/5 text-white placeholder:text-beton-500"
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-xs text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-beton-300">
          Şifre
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={busy}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          className="border-white/15 bg-white/5 text-white"
          {...register("password")}
        />
        {errors.password && (
          <p id="password-error" role="alert" className="text-xs text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={busy}
        className="w-full bg-mese-600 text-white hover:bg-mese-500"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Giriş yapılıyor...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Giriş yap
          </>
        )}
      </Button>
    </form>
  );
}
