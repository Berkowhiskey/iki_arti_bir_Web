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

// İçerik admin panelden değiştiği için her istekte taze veri çekilir.
export const dynamic = "force-dynamic";

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

      <footer className="border-t border-beton-200 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <div className="font-mono text-[11px] tracking-[0.2em] text-beton-400">
            İKİ ARTI BİR YAPI
          </div>
          <div className="text-xs text-beton-400">
            © {new Date().getFullYear()} Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </>
  );
}
