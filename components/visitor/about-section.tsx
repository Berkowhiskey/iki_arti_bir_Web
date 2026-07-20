import type { AboutContent } from "@/lib/queries";
import { Reveal } from "./reveal";

/** Hakkımızda — tek sütun, bol beyaz alan. */
export function AboutSection({ about }: { about: AboutContent }) {
  const paragraphs = about.content.split("\n\n").filter(Boolean);

  return (
    <section
      id="hakkimizda"
      className="bg-white px-6 py-28 md:py-40"
      aria-labelledby="hakkimizda-baslik"
    >
      <div className="mx-auto max-w-3xl">
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

        <div className="mt-12 space-y-6">
          {paragraphs.map((paragraph, index) => (
            <Reveal key={index} delay={0.25 + index * 0.1}>
              <p className="text-pretty text-base leading-[1.9] text-beton-700 md:text-lg">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
