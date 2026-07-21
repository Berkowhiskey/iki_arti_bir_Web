import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import { getOtherProjects, getProjectBySlug } from "@/lib/queries";
import { CATEGORY_LABELS } from "@/lib/labels";
import { ProjectImage } from "@/components/visitor/image-placeholder";
import { Reveal } from "@/components/visitor/reveal";

/**
 * Önbelleğe alınmaya hazır: `revalidatePath("/projeler/[slug]", "page")` çağrısı
 * `app/admin/portfolio/actions.ts` içinde kurulu. Sayfa şu an yine dinamik
 * render ediliyor — gerekçesi `app/(visitor)/page.tsx` başındaki notta.
 * `generateStaticParams` kullanılmama gerekçesi ekip detay sayfasında.
 */
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) return { title: "Sayfa bulunamadı" };

  const description = project.description.slice(0, 155);

  return {
    title: `${project.title} — ${project.location}`,
    description,
    openGraph: {
      title: project.title,
      description,
      type: "article",
      // Kapak görseli varsa paylaşım önizlemesinde kullanılır.
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const paragraphs = project.description.split("\n\n").filter(Boolean);
  const others = await getOtherProjects(project.id);

  // Koordinatı haritada açan bağlantı. Gömülü harita bilinçli olarak
  // kullanılmıyor: her ziyaretçi için Google'a istek gitmesi çerez/KVKK
  // yükü getirir ve sayfayı ağırlaştırır.
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${project.latitude},${project.longitude}`;

  return (
    <article>
      {/* Kapak */}
      <header className="relative bg-antrasit-deep">
        <div className="relative aspect-16/9 max-h-[70vh] w-full overflow-hidden md:aspect-21/9">
          <ProjectImage
            src={project.coverImage}
            title={project.title}
            category={project.category}
            className="h-full w-full"
          />
          {/* Metnin okunabilirliği için alttan koyulaşan katman */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-antrasit-deep via-antrasit-deep/40 to-transparent"
          />
        </div>

        <div className="relative -mt-24 px-6 pb-16 md:-mt-32">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <Link
                href="/#projeler"
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-white/60 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                PROJELERE DÖN
              </Link>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-8 font-mono text-[11px] tracking-[0.3em] text-mese-300">
                {CATEGORY_LABELS[project.category].toLocaleUpperCase("tr-TR")}
              </div>
              <h1 className="mt-4 text-balance text-4xl font-light leading-tight tracking-tight text-white md:text-5xl">
                {project.title}
              </h1>
              <div className="mt-4 flex items-center gap-2 text-sm text-beton-300">
                <MapPin className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                {project.location}
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      {/* Açıklama + teknik künye */}
      <div className="bg-white px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-5xl gap-16 md:grid-cols-[1fr_260px]">
          <div className="space-y-6">
            {paragraphs.map((paragraph, index) => (
              <Reveal key={index} delay={index * 0.08}>
                <p className="text-pretty text-base leading-[1.9] text-beton-700 md:text-lg">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>

          {/* Künye — mühendislik dilini yansıtan teknik blok */}
          <Reveal direction="right" delay={0.15}>
            <aside className="border-t-2 border-antrasit pt-6">
              <dl className="space-y-6 font-mono text-[11px]">
                <div>
                  <dt className="tracking-[0.2em] text-beton-400">KATEGORİ</dt>
                  <dd className="mt-2 text-sm text-antrasit">
                    {CATEGORY_LABELS[project.category]}
                  </dd>
                </div>
                <div>
                  <dt className="tracking-[0.2em] text-beton-400">LOKASYON</dt>
                  <dd className="mt-2 text-sm text-antrasit">
                    {project.location}
                  </dd>
                </div>
                <div>
                  <dt className="tracking-[0.2em] text-beton-400">KOORDİNAT</dt>
                  <dd className="mt-2 text-sm tabular-nums text-antrasit">
                    {project.latitude}° N
                    <br />
                    {project.longitude}° E
                  </dd>
                </div>
              </dl>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 border-b border-mese-600 pb-1 font-mono text-[11px] tracking-[0.2em] text-mese-700 transition-colors hover:text-antrasit"
              >
                HARİTADA AÇ
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              </a>
            </aside>
          </Reveal>
        </div>
      </div>

      {/* Galeri */}
      {project.images.length > 0 && (
        <section
          className="bg-beton-50 px-6 py-24"
          aria-labelledby="galeri-baslik"
        >
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <h2
                id="galeri-baslik"
                className="mb-12 font-mono text-[11px] tracking-[0.3em] text-beton-500"
              >
                GALERİ
              </h2>
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2">
              {project.images.map((image, index) => (
                <Reveal key={image.id} delay={(index % 2) * 0.1}>
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-beton-200">
                    <Image
                      src={image.url}
                      alt={image.alt ?? `${project.title} — görsel ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Diğer projeler */}
      {others.length > 0 && (
        <nav
          aria-label="Diğer projeler"
          className="border-t border-beton-200 bg-white px-6 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 font-mono text-[11px] tracking-[0.3em] text-beton-500">
              DİĞER PROJELER
            </div>
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((other) => (
                <li key={other.id}>
                  <Link
                    href={`/projeler/${other.slug}`}
                    className="group block bg-white transition-shadow duration-500 hover:shadow-xl"
                  >
                    <ProjectImage
                      src={other.coverImage}
                      title={other.title}
                      category={other.category}
                      className="aspect-4/3 w-full"
                    />
                    <div className="p-5">
                      <div className="font-mono text-[10px] tracking-[0.2em] text-mese-700">
                        {CATEGORY_LABELS[other.category].toLocaleUpperCase("tr-TR")}
                      </div>
                      <div className="mt-2 text-base font-light text-antrasit">
                        {other.title}
                      </div>
                      <div className="mt-1 text-sm text-beton-500">
                        {other.location}
                      </div>
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
