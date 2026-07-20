import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Yönetim Girişi",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-antrasit-deep px-6 py-16">
      {/* Hero'nun split-screen kimliğinin sakin bir yorumu */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 15% 20%, var(--beton-700) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 80%, var(--mese-800) 0%, transparent 55%),
            linear-gradient(160deg, var(--antrasit) 0%, var(--antrasit-deep) 100%)
          `,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--beton-100) 1px, transparent 1px), linear-gradient(to bottom, var(--beton-100) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 font-mono text-2xl font-light text-white">
              <span>2</span>
              <span className="text-mese-300">+</span>
              <span>1</span>
            </div>
            <div className="mt-3 font-mono text-[10px] tracking-[0.3em] text-mese-300/80">
              YÖNETİM PANELİ
            </div>
            <p className="mt-4 text-sm text-beton-400">
              Devam etmek için giriş yapın.
            </p>
          </div>

          <LoginForm />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] text-beton-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            SİTEYE DÖN
          </Link>
        </div>
      </div>
    </div>
  );
}
