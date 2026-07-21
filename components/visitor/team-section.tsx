import type { TeamMemberContent } from "@/lib/queries";
import { Reveal } from "./reveal";
import { TeamCarousel } from "./team-carousel";

/**
 * Ekip — split-screen kimliğinin geri döndüğü bölüm.
 *
 * Bölüm başlığı Server Component olarak kalır; yalnızca slider ve kartların
 * hover animasyonu istemciye iner (`team-carousel.tsx`). Renk teması
 * `discipline-theme.ts`'ten gelir (detay sayfasıyla ortak).
 */
export function TeamSection({ members }: { members: TeamMemberContent[] }) {
  if (members.length === 0) return null;

  return (
    <section
      id="ekip"
      className="bg-antrasit-deep px-6 py-28 md:py-40"
      aria-labelledby="ekip-baslik"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center md:mb-24">
          <Reveal>
            <div className="mb-4 font-mono text-[11px] tracking-[0.3em] text-mese-300">
              02 — EKİP
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              id="ekip-baslik"
              className="text-3xl font-light tracking-tight text-white md:text-4xl"
            >
              İki disiplin, tek masa
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mx-auto mt-8 h-px w-16 bg-mese-400" />
          </Reveal>
        </div>

        {/* Tek Reveal tüm slider'ı sarar — gerekçesi team-carousel.tsx'te. */}
        <Reveal delay={0.25}>
          <TeamCarousel members={members} />
        </Reveal>
      </div>
    </section>
  );
}
