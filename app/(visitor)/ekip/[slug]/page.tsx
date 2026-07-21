import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTeamMemberBySlug, getTeamMembers } from "@/lib/queries";
import { PersonImage } from "@/components/visitor/image-placeholder";
import { DISCIPLINE_THEME } from "@/components/visitor/discipline-theme";
import { Reveal } from "@/components/visitor/reveal";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);

  if (!member) return { title: "Sayfa bulunamadı" };

  return {
    title: `${member.name} — ${member.title}`,
    // Biyografinin ilk cümlesi arama sonuçlarında açıklama olarak görünür.
    description: member.bio.slice(0, 155),
    openGraph: {
      title: `${member.name} — ${member.title}`,
      description: member.bio.slice(0, 155),
      type: "profile",
    },
  };
}

export default async function TeamMemberPage({ params }: PageProps) {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);

  if (!member) notFound();

  const theme = DISCIPLINE_THEME[member.discipline];
  const paragraphs = member.bio.split("\n\n").filter(Boolean);

  // Diğer ekip üyeleri — sayfanın altındaki geçiş şeridi için.
  const others = (await getTeamMembers()).filter((m) => m.slug !== member.slug);

  return (
    <article>
      {/* Üst blok — kişinin disiplin teması burada tam sayfa hâkim */}
      <header className={`relative ${theme.panel} px-6 pt-32 pb-20 md:pt-40`}>
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-70"
          style={{ backgroundImage: theme.texture }}
        />

        <div className="relative mx-auto max-w-5xl">
          <Reveal>
            <Link
              href="/#ekip"
              className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              EKİBE DÖN
            </Link>
          </Reveal>

          <div className="mt-12 grid items-end gap-10 md:grid-cols-[300px_1fr] md:gap-16">
            <Reveal direction="left">
              <PersonImage
                src={member.imageUrl}
                name={member.name}
                variant={theme.avatar}
                className="aspect-3/4 w-full"
              />
            </Reveal>

            <Reveal direction="right" delay={0.1}>
              <div>
                <div
                  className={`font-mono text-[11px] tracking-[0.3em] ${theme.accent}`}
                >
                  {theme.label.toLocaleUpperCase("tr-TR")}
                </div>
                <h1 className="mt-4 text-balance text-4xl font-light leading-tight tracking-tight text-white md:text-5xl">
                  {member.name}
                </h1>
                <div
                  className={`mt-4 font-mono text-xs tracking-[0.2em] ${theme.accent}`}
                >
                  {member.title.toLocaleUpperCase("tr-TR")}
                </div>
                <div className={`mt-8 h-px w-16 ${theme.rule}`} />
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      {/* Biyografi — beyaz zemin, bol beyaz alan (Hakkımızda bölümünün dili) */}
      <div className="bg-white px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl space-y-6">
          {paragraphs.map((paragraph, index) => (
            <Reveal key={index} delay={index * 0.08}>
              <p className="text-pretty text-base leading-[1.9] text-beton-700 md:text-lg">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Diğer ekip üyeleri */}
      {others.length > 0 && (
        <nav
          aria-label="Diğer ekip üyeleri"
          className="border-t border-beton-200 bg-beton-50 px-6 py-20"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 font-mono text-[11px] tracking-[0.3em] text-beton-500">
              DİĞER EKİP ÜYELERİ
            </div>
            <ul className="grid gap-px overflow-hidden border border-beton-200 bg-beton-200 sm:grid-cols-2">
              {others.map((other) => (
                <li key={other.id} className="bg-white">
                  <Link
                    href={`/ekip/${other.slug}`}
                    className="group flex h-full flex-col justify-between gap-4 p-8 transition-colors hover:bg-beton-50"
                  >
                    <div>
                      <div className="text-lg font-light text-antrasit">
                        {other.name}
                      </div>
                      <div className="mt-2 font-mono text-[11px] tracking-[0.2em] text-beton-500">
                        {other.title.toLocaleUpperCase("tr-TR")}
                      </div>
                    </div>
                    <div className="font-mono text-[11px] tracking-[0.2em] text-mese-700 transition-transform duration-300 group-hover:translate-x-1">
                      PROFİLİ GÖR →
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </article>
  );
}
