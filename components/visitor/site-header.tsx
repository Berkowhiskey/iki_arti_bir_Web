"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { id: "anasayfa", label: "Anasayfa" },
  { id: "hakkimizda", label: "Hakkımızda" },
  { id: "ekip", label: "Ekibimiz" },
  { id: "projeler", label: "Projeler" },
  { id: "iletisim", label: "İletişim" },
] as const;

/**
 * Üst navigasyon.
 *
 * **Ana sayfada:** hero'da görünmez, ziyaretçi hero'yu geçince süzülerek belirir
 * ve oradan sonra kalıcıdır. Böylece hero'nun tam ekran kompozisyonu bozulmaz.
 *
 * **Detay sayfalarında** (`/ekip/...`, `/projeler/...`): hero olmadığı için bar
 * en baştan görünür ve menü öğeleri ana sayfaya hash ile götürür.
 */
export function SiteHeader() {
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [activeId, setActiveId] = useState<string>("anasayfa");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Ana sayfa dışındaki sayfalarda (ekip/proje detayları) hero yok — orada
  // bar en baştan görünür olmalı, yoksa navigasyon hiç erişilemez kalırdı.
  const isHome = pathname === "/";
  const isVisible = !isHome || isScrolledPastHero;

  // Hero'nun büyük bölümü geçilene kadar bar görünmez; geçildikten sonra
  // kaydırma yönünden bağımsız olarak kalıcıdır.
  //
  // Not: Önceden aşağı kaydırırken gizlenip yukarı kaydırırken geri gelen
  // "hide-on-scroll" deseni vardı. Tek sayfalık bu sitede ziyaretçi sürekli
  // aşağı gezindiği için bar tam ihtiyaç anında kayboluyordu — kaldırıldı.
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolledPastHero(latest >= window.innerHeight * 0.85);
  });

  // Detay sayfalarında hiçbir menü öğesi aktif görünmemeli. Bunu effect
  // içinde `setActiveId("")` ile yapmak cazipti ama effect'te senkron
  // setState gereksiz bir render turu doğurur (ESLint de uyarıyor).
  // Değer state'ten türetiliyor: state ana sayfanın son aktif bölümünü
  // hatırlar, geri dönüldüğünde vurgu yerinde olur.
  const displayedActiveId = isHome ? activeId : "";

  // Aktif bölüm takibi — hangi bölümdeysek menüde işaretlenir.
  // Detay sayfalarında bu bölümler yok, observer hiç kurulmaz.
  useEffect(() => {
    if (!isHome) return;

    const sections = NAV_ITEMS.map((item) =>
      document.getElementById(item.id)
    ).filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isHome]);

  const handleNavigate = (id: string) => {
    setIsMenuOpen(false);

    // Detay sayfasındaysak bölüm bu sayfada yok — ana sayfaya hash ile git.
    // `section[id] { scroll-margin-top }` sayesinde sabit bar başlığı örtmez.
    if (!isHome) {
      router.push(id === "anasayfa" ? "/" : `/#${id}`);
      return;
    }

    const target = document.getElementById(id);
    if (!target) return;

    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    // Klavye kullanıcısı için odağı da taşı.
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-antrasit-deep/70 backdrop-blur-xl"
          initial={reduceMotion ? false : { y: "-100%" }}
          animate={{ y: 0 }}
          exit={reduceMotion ? undefined : { y: "-100%" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <nav
            className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
            aria-label="Ana menü"
          >
            {/* Logo işareti */}
            <button
              type="button"
              onClick={() => handleNavigate("anasayfa")}
              className="flex items-center gap-1.5 font-mono text-sm font-light text-white transition-opacity hover:opacity-70"
            >
              <span>2</span>
              <span className="text-mese-300">+</span>
              <span>1</span>
              <span className="ml-2 hidden text-[10px] tracking-[0.25em] text-beton-300 sm:inline">
                İKİ ARTI BİR YAPI
              </span>
            </button>

            {/* Masaüstü menü */}
            <ul className="hidden items-center gap-8 md:flex">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    aria-current={displayedActiveId === item.id ? "true" : undefined}
                    className={`relative font-mono text-[11px] tracking-[0.15em] transition-colors ${
                      displayedActiveId === item.id
                        ? "text-mese-200"
                        : "text-beton-300 hover:text-white"
                    }`}
                  >
                    {item.label.toLocaleUpperCase("tr-TR")}
                    {displayedActiveId === item.id && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute -bottom-1.5 left-0 h-px w-full bg-mese-300"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Mobil menü */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="text-beton-200 transition-colors hover:text-white md:hidden"
                  aria-label="Menüyü aç"
                >
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-64 border-white/10 bg-antrasit-deep"
              >
                <SheetTitle className="sr-only">Ana menü</SheetTitle>
                <ul className="mt-12 flex flex-col gap-1 px-4">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleNavigate(item.id)}
                        className={`w-full py-3 text-left font-mono text-xs tracking-[0.15em] transition-colors ${
                          displayedActiveId === item.id
                            ? "text-mese-200"
                            : "text-beton-300 hover:text-white"
                        }`}
                      >
                        {item.label.toLocaleUpperCase("tr-TR")}
                      </button>
                    </li>
                  ))}
                </ul>
              </SheetContent>
            </Sheet>
          </nav>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
