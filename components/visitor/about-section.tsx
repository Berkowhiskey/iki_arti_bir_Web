import Image from "next/image";
import type { AboutContent } from "@/lib/queries";
import { Reveal } from "./reveal";

/**
 * Hakkımızda — bol beyaz alan.
 *
 * Logo yüklenmişse iki kolon (logo solda, metin sağda); yüklenmemişse eski
 * tek sütun düzeni korunur. Grid'i koşulsuz kurup boş hücre bırakmak, logosu
 * olmayan kurulumda metni sayfanın sağ yarısına sıkıştırırdı.
 */
export function AboutSection({ about }: { about: AboutContent }) {
  const paragraphs = about.content.split("\n\n").filter(Boolean);
  const hasLogo = Boolean(about.imageUrl);

  return (
    <section
      id="hakkimizda"
      className="bg-white px-6 py-28 md:py-40"
      aria-labelledby="hakkimizda-baslik"
    >
      <div className={hasLogo ? "mx-auto max-w-5xl" : "mx-auto max-w-3xl"}>
        <Reveal>
          <div className="mb-4 font-mono text-[11px] tracking-[0.3em] text-mese-700">
            01 — HAKKIMIZDA
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2
            id="hakkimizda-baslik"
            className="text-balance text-3xl font-light leading-tight tracking-tight text-antrasit md:text-4xl"
          >
            {about.title}
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-8 h-px w-16 bg-mese-600" />
        </Reveal>

        <div
          className={
            hasLogo
              ? "mt-12 grid gap-10 md:grid-cols-[minmax(0,280px)_1fr] md:gap-16"
              : "mt-12"
          }
        >
          {about.imageUrl && (
            /* Gecikme sabit ve düşük tutuldu: paragrafların gecikmesi
               metin uzadıkça büyüyor (0.25 + index * 0.1), logo onların
               arasında belirirse sıra karışık görünürdü. */
            <Reveal delay={0.15} direction="left">
              <div className="relative aspect-square w-full bg-white">
                <Image
                  src={about.imageUrl}
                  alt={`${about.title} — logo`}
                  fill
                  sizes="(max-width: 768px) 100vw, 280px"
                  /* Logo kırpılmamalı: object-cover değil contain.
                     Panel önizlemesi de fit="contain" kullanıyor. */
                  className="object-contain"
                />
              </div>
            </Reveal>
          )}

          <div className="space-y-6">
            {paragraphs.map((paragraph, index) => (
              <Reveal key={index} delay={0.25 + index * 0.1}>
                <p className="text-pretty text-base leading-[1.9] text-beton-700 md:text-lg">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
