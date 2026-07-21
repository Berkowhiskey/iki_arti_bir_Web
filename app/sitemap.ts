import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";

/**
 * Dinamik site haritası — `/sitemap.xml` adresinde yayınlanır.
 *
 * Ekip ve proje detay sayfaları veritabanından okunur, böylece admin panelden
 * yeni kayıt eklendiğinde haritaya elle satır eklemek gerekmez.
 *
 * ⚠️ **Yalnızca herkese açık ve görünür kayıtlar listelenir.** Gizli kayıtların
 * (`isActive: false` / `isPublished: false`) detay sayfası zaten 404 veriyor;
 * bunları haritaya koymak arama motorlarına kırık adres bildirmek olurdu.
 * Admin rotaları da hiç girmez — onlar `robots.ts` ile ayrıca kapalı.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [team, projects] = await Promise.all([
    prisma.teamMember.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.project.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  // Ana sayfa tek sayfalık olduğu için en yüksek öncelikte.
  const home: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const teamPages: MetadataRoute.Sitemap = team.map((member) => ({
    url: absoluteUrl(`/ekip/${member.slug}`),
    lastModified: member.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: absoluteUrl(`/projeler/${project.slug}`),
    lastModified: project.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...home, ...teamPages, ...projectPages];
}
