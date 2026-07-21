import Link from "next/link";

/**
 * Ortak alt bilgi. Önce `page.tsx` içindeydi; detay sayfaları eklenince
 * ziyaretçi layout'una taşındı, böylece her sayfada görünüyor.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-beton-200 bg-white px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <Link
          href="/"
          className="font-mono text-[11px] tracking-[0.2em] text-beton-400 transition-colors hover:text-antrasit"
        >
          İKİ ARTI BİR YAPI
        </Link>
        <div className="text-xs text-beton-400">
          © {new Date().getFullYear()} Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
