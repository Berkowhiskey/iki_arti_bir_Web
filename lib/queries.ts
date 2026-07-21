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
  slug: string;
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
    slug: member.slug,
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

// --------------------------------------------------- Detay sayfası sorguları

/** Ekip üyesi detay sayfası — /ekip/[slug] */
export async function getTeamMemberBySlug(
  slug: string
): Promise<TeamMemberContent | null> {
  const member = await prisma.teamMember.findUnique({ where: { slug } });

  // Pasif üyenin sayfası da açılmaz — ana sayfada gizliyse burada da gizli.
  if (!member || !member.isActive) return null;

  return {
    id: member.id,
    name: member.name,
    slug: member.slug,
    title: member.title,
    bio: member.bio,
    imageUrl: member.imageUrl,
    discipline: member.discipline,
  };
}

export type ProjectDetail = ProjectContent & {
  images: { id: number; url: string; alt: string | null }[];
};

/** Proje detay sayfası — /projeler/[slug] */
export async function getProjectBySlug(
  slug: string
): Promise<ProjectDetail | null> {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { order: "asc" },
        select: { id: true, url: true, alt: true },
      },
    },
  });

  // Yayında olmayan projenin detay sayfası da açılmaz.
  if (!project || !project.isPublished) return null;

  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    category: project.category,
    location: project.location,
    description: project.description,
    latitude: project.latitude.toString(),
    longitude: project.longitude.toString(),
    coverImage: project.coverImage,
    images: project.images,
  };
}

/**
 * Detay sayfasının altındaki "diğer projeler" şeridi — mevcut proje hariç.
 * Aynı kategoridekiler önce gelir, sonra kalanlar; en fazla `take` kayıt.
 */
export async function getOtherProjects(
  excludeId: number,
  take = 3
): Promise<ProjectContent[]> {
  const projects = await prisma.project.findMany({
    where: { isPublished: true, id: { not: excludeId } },
    orderBy: { order: "asc" },
    take,
  });

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
    category: project.category,
    location: project.location,
    description: project.description,
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
