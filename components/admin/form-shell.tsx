"use client";

import type { ReactNode } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type FormShellProps = {
  title: string;
  description?: string;
  isSubmitting: boolean;
  isDirty: boolean;
  onSubmit: () => void;
  children: ReactNode;
  submitLabel?: string;
};

/** Tüm CMS formlarının ortak iskeleti — başlık, alanlar ve kaydet çubuğu. */
export function FormShell({
  title,
  description,
  isSubmitting,
  isDirty,
  onSubmit,
  children,
  submitLabel = "Kaydet",
}: FormShellProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
      className="mx-auto max-w-2xl"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="space-y-6 rounded-lg border bg-card p-6">{children}</div>

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              {submitLabel}
            </>
          )}
        </Button>
        {isDirty && !isSubmitting && (
          <span className="text-xs text-muted-foreground">
            Kaydedilmemiş değişiklikler var.
          </span>
        )}
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

/** Etiket + alan + hata mesajı üçlüsü, erişilebilirlik bağlantılarıyla. */
export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
