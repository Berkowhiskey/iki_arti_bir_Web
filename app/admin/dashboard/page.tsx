import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Contact, Info, Sparkles, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Panel" };

export const dynamic = "force-dynamic";

const SHORTCUTS = [
  {
    href: "/admin/hero-settings",
    label: "Hero Ayarları",
    description: "Slogan ve giriş metinleri",
    icon: Sparkles,
  },
  {
    href: "/admin/about-settings",
    label: "Hakkımızda",
    description: "Tanıtım metni ve görseli",
    icon: Info,
  },
  {
    href: "/admin/team-settings",
    label: "Ekip",
    description: "Üye ekle, düzenle, sırala",
    icon: Users,
  },
  {
    href: "/admin/portfolio",
    label: "Projeler",
    description: "Şantiye ve proje yönetimi",
    icon: Building2,
  },
  {
    href: "/admin/contact-settings",
    label: "İletişim",
    description: "Bilgiler ve sosyal medya",
    icon: Contact,
  },
] as const;

export default async function DashboardPage() {
  const session = await auth();

  const [teamCount, projectCount, publishedCount] = await Promise.all([
    prisma.teamMember.count({ where: { isActive: true } }),
    prisma.project.count(),
    prisma.project.count({ where: { isPublished: true } }),
  ]);

  const stats = [
    { label: "Aktif ekip üyesi", value: teamCount },
    { label: "Toplam proje", value: projectCount },
    { label: "Yayında", value: publishedCount },
  ];

  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-2xl font-light tracking-tight">
          Hoş geldiniz{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sitedeki tüm içeriği buradan yönetebilirsiniz.
        </p>
      </div>

      <section aria-labelledby="ozet-baslik">
        <h2 id="ozet-baslik" className="sr-only">
          Özet
        </h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border bg-card p-5">
              <dt className="text-xs tracking-wide text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="mt-2 text-3xl font-light tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="modul-baslik">
        <h2 id="modul-baslik" className="mb-4 text-sm font-medium">
          Yönetim modülleri
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SHORTCUTS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-start gap-4 rounded-lg border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-accent"
            >
              <item.icon
                className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {item.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Modüllerin içerikleri Faz 4&apos;te devreye alınacaktır.
        </p>
      </section>
    </div>
  );
}
