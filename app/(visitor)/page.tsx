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
    </>
  );
}
