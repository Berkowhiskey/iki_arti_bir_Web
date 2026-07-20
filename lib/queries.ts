import { prisma } from "@/lib/prisma";

/**
 * Ziyaretçi sayfasının veri katmanı.
 *
 * Prisma'nın Decimal ve Date tipleri Server Component'ten Client Component'e
 * doğrudan geçirilemez (serialize edilemez). Bu yüzden buradaki fonksiyonlar
 * daima düz (plain) nesneler döndürür.
 */

export type HeroContent = {
  slogan: string;
  subSlogan: string | null;
};

export type AboutContent = {
  title: string;
  content: string;
  imageUrl: string | null;
};

export type TeamMemberContent = {
  id: number;
  name: string;
  title: string;
  bio: string;
  imageUrl: string | null;
  /** Hangi hero temasıyla gösterileceğini belirler — sıralamadan bağımsız. */
  discipline: "MUHENDISLIK" | "MIMARLIK" | "DIGER";
};

export type ProjectContent = {
  id: number;
  title: string;
  slug: string;
  category: "MIMARLIK" | "MUHENDISLIK" | "IC_DIZAYN";
  location: string;
  description: string;
  latitude: string;
  longitude: string;
  coverImage: string | null;
};

export type ContactContent = {
  email: string;
  phone: string;
  address: string;
  instagramUrl: string | null;
  linkedinUrl: string | null;
};

const FALLBACK_HERO: HeroContent = {
  slogan: "Yaşama değer katan benzersiz çizgiler.",
  subSlogan: null,
};

export async function getHeroContent(): Promise<HeroContent> {
  const hero = await prisma.heroSettings.findUnique({ where: { id: 1 } });
  if (!hero) return FALLBACK_HERO;

  return { slogan: hero.slogan, subSlogan: hero.subSlogan };
}

export async function getAboutContent(): Promise<AboutContent | null> {
  const about = await prisma.aboutSettings.findUnique({ where: { id: 1 } });
  if (!about) return null;

  return {
    title: about.title,
    content: about.content,
    imageUrl: about.imageUrl,
  };
}

export async function getTeamMembers(): Promise<TeamMemberContent[]> {
  const members = await prisma.teamMember.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  return members.map((member) => ({
    id: member.id,
    name: member.name,
    title: member.title,
    bio: member.bio,
    imageUrl: member.imageUrl,
    discipline: member.discipline,
  }));
}

export async function getPublishedProjects(): Promise<ProjectContent[]> {
  const projects = await prisma.project.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
  });

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
    category: project.category,
    location: project.location,
    description: project.description,
    // Decimal → string; Client Component'e geçebilmesi için zorunlu.
    latitude: project.latitude.toString(),
    longitude: project.longitude.toString(),
    coverImage: project.coverImage,
  }));
}

export async function getContactContent(): Promise<ContactContent | null> {
  const contact = await prisma.contactSettings.findUnique({ where: { id: 1 } });
  if (!contact) return null;

  return {
    email: contact.email,
    phone: contact.phone,
    address: contact.address,
    instagramUrl: contact.instagramUrl,
    linkedinUrl: contact.linkedinUrl,
  };
}

/**
 * Faz 5.1 — Hero'nun sol alt köşesinde gösterilecek "son eklenen şantiye".
 * Project.createdAt üzerindeki desc index bu sorgu için var.
 */
export async function getLatestProjectCoordinates(): Promise<{
  title: string;
  location: string;
  latitude: string;
  longitude: string;
} | null> {
  const latest = await prisma.project.findFirst({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) return null;

  return {
    title: latest.title,
    location: latest.location,
    latitude: latest.latitude.toString(),
    longitude: latest.longitude.toString(),
  };
}
