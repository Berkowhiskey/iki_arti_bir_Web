import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AboutForm } from "./about-form";

export const metadata: Metadata = { title: "Hakkımızda" };
export const dynamic = "force-dynamic";

export default async function AboutSettingsPage() {
  const about = await prisma.aboutSettings.findUnique({ where: { id: 1 } });

  return (
    <AboutForm
      defaultValues={{
        title: about?.title ?? "",
        content: about?.content ?? "",
        imageUrl: about?.imageUrl ?? null,
      }}
    />
  );
}
