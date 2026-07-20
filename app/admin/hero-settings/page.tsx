import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HeroForm } from "./hero-form";

export const metadata: Metadata = { title: "Hero Ayarları" };
export const dynamic = "force-dynamic";

export default async function HeroSettingsPage() {
  const hero = await prisma.heroSettings.findUnique({ where: { id: 1 } });

  return (
    <HeroForm
      defaultValues={{
        slogan: hero?.slogan ?? "",
        subSlogan: hero?.subSlogan ?? "",
      }}
    />
  );
}
