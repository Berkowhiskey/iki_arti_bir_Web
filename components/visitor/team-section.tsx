import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TeamMemberContent } from "@/lib/queries";
import { PersonImage } from "./image-placeholder";
import { Reveal } from "./reveal";
import { DISCIPLINE_THEME } from "./discipline-theme";

/**
 * Ekip — split-screen konseptinin geri döndüğü bölüm.
 * Renk teması `discipline-theme.ts`'ten gelir (detay sayfasıyla ortak).
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

        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
          {members.map((member, index) => {
            const theme = DISCIPLINE_THEME[member.discipline];

            return (
              <Reveal
                key={member.id}
                delay={index * 0.15}
                direction={index % 2 === 0 ? "left" : "right"}
                className={theme.panel}
              >
                <article className="group relative h-full">
                  {/* Hero'daki panel dokusunun aynısı */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-70"
                    style={{ backgroundImage: theme.texture }}
                  />

                  <div className="relative">
                    <PersonImage
                      src={member.imageUrl}
                      name={member.name}
                      variant={theme.avatar}
                      className="aspect-[4/3] w-full"
                    />
                    <div className="p-8 md:p-10">
                      <h3 className="text-xl font-light text-white md:text-2xl">
                        {/* Kartın tamamını kaplayan bağlantı: başlıktan çıkan
                            görünmez bir katman. Böylece ekran okuyucuda tek ve
                            anlamlı bir bağlantı olur, kart yine de tıklanır. */}
                        <Link
                          href={`/ekip/${member.slug}`}
                          className="before:absolute before:inset-0 before:z-10 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        >
                          {member.name}
                        </Link>
                      </h3>
                      <div
                        className={`mt-2 font-mono text-[11px] tracking-[0.2em] ${theme.accent}`}
                      >
                        {member.title.toLocaleUpperCase("tr-TR")}
                      </div>
                      <div className={`mt-6 h-px w-10 ${theme.rule}`} />
                      <p
                        className={`mt-6 line-clamp-4 text-pretty text-sm leading-[1.85] ${theme.body}`}
                      >
                        {member.bio}
                      </p>
                      <div
                        className={`mt-6 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] ${theme.accent} transition-transform duration-300 group-hover:translate-x-1`}
                      >
                        DEVAMINI OKU
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
