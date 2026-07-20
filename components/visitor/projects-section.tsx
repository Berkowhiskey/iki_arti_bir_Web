import type { ProjectContent } from "@/lib/queries";
import { ProjectImage } from "./image-placeholder";
import { Reveal } from "./reveal";

const CATEGORY_LABELS = {
  MIMARLIK: "Mimarlık",
  MUHENDISLIK: "Mühendislik",
  IC_DIZAYN: "İç Dizayn",
} as const;

/** Şantiyeler / projeler — tek sütun başlık, ızgara yerleşimli kartlar. */
export function ProjectsSection({ projects }: { projects: ProjectContent[] }) {
  if (projects.length === 0) return null;

  return (
    <section
      id="projeler"
      className="bg-beton-50 px-6 py-28 md:py-40"
      aria-labelledby="projeler-baslik"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 md:mb-24">
          <Reveal>
            <div className="mb-4 font-mono text-[11px] tracking-[0.3em] text-mese-700">
              03 — PORTFOLYO
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              id="projeler-baslik"
              className="text-3xl font-light tracking-tight text-antrasit md:text-4xl"
            >
              Projeler
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 h-px w-16 bg-mese-600" />
          </Reveal>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={index * 0.1}>
              <article className="group h-full bg-white transition-shadow duration-500 hover:shadow-xl">
                <ProjectImage
                  src={project.coverImage}
                  title={project.title}
                  category={project.category}
                  className="aspect-[4/3] w-full"
                />
                <div className="p-6">
                  <div className="font-mono text-[10px] tracking-[0.2em] text-mese-700">
                    {CATEGORY_LABELS[project.category].toLocaleUpperCase("tr-TR")}
                  </div>
                  <h3 className="mt-3 text-lg font-light leading-snug text-antrasit">
                    {project.title}
                  </h3>
                  <div className="mt-2 text-sm text-beton-500">
                    {project.location}
                  </div>
                  <p className="mt-4 line-clamp-3 text-pretty text-sm leading-relaxed text-beton-600">
                    {project.description}
                  </p>
                  <div className="mt-5 border-t border-beton-200 pt-4 font-mono text-[10px] text-beton-400">
                    {project.latitude}° N · {project.longitude}° E
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
