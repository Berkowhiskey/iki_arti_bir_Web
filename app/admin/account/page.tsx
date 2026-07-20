import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Hesap" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-sm font-medium">Oturum bilgileri</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Ad:</dt>
            <dd>{session?.user?.name}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">E-posta:</dt>
            <dd>{session?.user?.email}</dd>
          </div>
        </dl>
      </div>

      <PasswordForm />
    </div>
  );
}
