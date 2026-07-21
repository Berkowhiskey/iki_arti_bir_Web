import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeamForm } from "../team-form";

export const metadata: Metadata = { title: "Ekip üyesini düzenle" };
export const dynamic = "force-dynamic";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const memberId = Number(id);

  // Adres çubuğuna elle "abc" yazılırsa Prisma'ya NaN gitmesin.
  if (!Number.isInteger(memberId)) notFound();

  const member = await prisma.teamMember.findUnique({
    where: { id: memberId },
  });

  if (!member) notFound();

  return (
    <TeamForm
      memberId={member.id}
      defaultValues={{
        name: member.name,
        title: member.title,
        bio: member.bio,
        discipline: member.discipline,
        order: String(member.order),
        isActive: member.isActive,
        imageUrl: member.imageUrl,
      }}
    />
  );
}
