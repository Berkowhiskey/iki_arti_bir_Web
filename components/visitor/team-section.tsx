import type { TeamMemberContent } from "@/lib/queries";
import { PersonImage } from "./image-placeholder";
import { Reveal } from "./reveal";

/**
 * Ekip — split-screen konseptinin geri döndüğü bölüm.
 *
 * Renkler hero ile birebir aynı mantıkta: mühendislik beton, mimarlık meşe.
 * Tema `discipline` alanından gelir, kartın sırasından DEĞİL — böylece admin
 * panelden sıralama değiştirildiğinde renkler karışmaz.
 */

const DISCIPLINE_THEME = {
  MUHENDISLIK: {
    panel: "bg-beton-700",
    texture:
      "radial-gradient(ellipse at 20% 30%, var(--beton-500) 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, var(--beton-600) 0%, transparent 50%), linear-gradient(160deg, var(--beton-600) 0%, var(--beton-800) 100%)",
    accent: "text-beton-100",
    rule: "bg-beton-100/40",
    body: "text-beton-100/80",
    avatar: "beton",
  },
  MIMARLIK: {
    panel: "bg-mese-900",
    texture:
      "radial-gradient(ellipse at 70% 25%, var(--mese-700) 0%, transparent 62%), radial-gradient(ellipse at 25% 80%, var(--mese-800) 0%, transparent 58%), linear-gradient(200deg, var(--mese-800) 0%, var(--antrasit) 100%)",
    accent: "text-mese-200",
    rule: "bg-mese-300/40",
    body: "text-mese-100/80",
    avatar: "mese",
  },
  DIGER: {
    panel: "bg-antrasit",
    texture:
      "linear-gradient(160deg, var(--antrasit) 0%, var(--antrasit-deep) 100%)",
    accent: "text-beton-200",
    rule: "bg-white/20",
    body: "text-beton-300",
    avatar: "neutral",
  },
} as const;

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
                        {member.name}
                      </h3>
                      <div
                        className={`mt-2 font-mono text-[11px] tracking-[0.2em] ${theme.accent}`}
                      >
                        {member.title.toLocaleUpperCase("tr-TR")}
                      </div>
                      <div className={`mt-6 h-px w-10 ${theme.rule}`} />
                      <p
                        className={`mt-6 text-pretty text-sm leading-[1.85] ${theme.body}`}
                      >
                        {member.bio}
                      </p>
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
