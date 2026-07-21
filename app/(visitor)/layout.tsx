import type { ReactNode } from "react";
import { LoadingScreen } from "@/components/visitor/loading-screen";
import { SiteHeader } from "@/components/visitor/site-header";
import { SiteFooter } from "@/components/visitor/site-footer";

export default function VisitorLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LoadingScreen />
      <a
        href="#hakkimizda"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:bg-white focus:px-4 focus:py-2 focus:text-antrasit"
      >
        İçeriğe geç
      </a>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
