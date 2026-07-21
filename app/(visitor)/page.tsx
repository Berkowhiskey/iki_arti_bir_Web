import { HeroSection } from "@/components/visitor/hero-section";
import { AboutSection } from "@/components/visitor/about-section";
import { TeamSection } from "@/components/visitor/team-section";
import { ProjectsSection } from "@/components/visitor/projects-section";
import { ContactSection } from "@/components/visitor/contact-section";
import {
  getAboutContent,
  getContactContent,
  getHeroContent,
  getLatestProjectCoordinates,
  getPublishedProjects,
  getTeamMembers,
} from "@/lib/queries";

/**
 * `force-dynamic` Faz 5'te kaldırıldı, ama sayfa **hâlâ dinamik render
 * ediliyor** — kök layout (`app/layout.tsx`) temayı çerezden okuduğu için.
 * `cookies()` dinamik bir API'dir ve altındaki tüm rotaları dinamik yapar.
 *
 * ⚠️ Yani bu sayfayı statikleştirmek için önce **tema okuması kök layout'tan
 * çıkarılmalı**. Gerekli önbellek tazeleme çağrıları (`revalidatePath`) admin
 * action'larında zaten kurulu; engel yalnızca çerez okuması.
 * Ayrıntılı gerekçe ve seçenekler MEMORY.md'de (21.07.2026 - Faz 5).
 */

export default async function HomePage() {
  const [hero, about, team, projects, contact, latestProject] = await Promise.all([
    getHeroContent(),
    getAboutContent(),
    getTeamMembers(),
    getPublishedProjects(),
    getContactContent(),
    getLatestProjectCoordinates(),
  ]);

  return (
    <>
      <HeroSection
        slogan={hero.slogan}
        subSlogan={hero.subSlogan}
        latestProject={latestProject}
      />
      {about && <AboutSection about={about} />}
      <TeamSection members={team} />
      <ProjectsSection projects={projects} />
      {contact && <ContactSection contact={contact} />}
    </>
  );
}
