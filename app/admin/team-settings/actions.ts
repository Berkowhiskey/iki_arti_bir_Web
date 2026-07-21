"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, runAction, type ActionResult } from "@/lib/actions";
import { teamSchema } from "@/lib/validations";
import { deleteUpload } from "@/lib/uploads";

/** Ekip değişiklikleri hem ana sayfayı hem panel listesini tazeler. */
function revalidateTeam() {
  revalidatePath("/");
  revalidatePath("/admin/team-settings");
}

export async function createTeamMember(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();

    const parsed = teamSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Girilen bilgilerde hata var.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    const { order, ...rest } = parsed.data;

    await prisma.teamMember.create({
      data: { ...rest, order: Number(order) },
    });

    revalidateTeam();

    return { ok: true, message: "Ekip üyesi eklendi." };
  });
}

export async function updateTeamMember(
  id: number,
  input: unknown
): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();

    const parsed = teamSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Girilen bilgilerde hata var.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    const existing = await prisma.teamMember.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!existing) {
      return { ok: false, message: "Ekip üyesi bulunamadı." };
    }

    const { order, ...rest } = parsed.data;

    await prisma.teamMember.update({
      where: { id },
      data: { ...rest, order: Number(order) },
    });

    // Fotoğraf değiştiyse eskisini diskten sil.
    if (existing.imageUrl && existing.imageUrl !== rest.imageUrl) {
      await deleteUpload(existing.imageUrl);
    }

    revalidateTeam();

    return { ok: true, message: "Ekip üyesi güncellendi." };
  });
}

export async function deleteTeamMember(id: number): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();

    const existing = await prisma.teamMember.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!existing) {
      return { ok: false, message: "Ekip üyesi bulunamadı." };
    }

    await prisma.teamMember.delete({ where: { id } });
    await deleteUpload(existing.imageUrl);

    revalidateTeam();

    return { ok: true, message: "Ekip üyesi silindi." };
  });
}
