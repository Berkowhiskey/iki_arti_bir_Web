"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, runAction, type ActionResult } from "@/lib/actions";
import { aboutSchema } from "@/lib/validations";
import { deleteUpload } from "@/lib/uploads";

export async function updateAboutSettings(
  input: unknown
): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();

    const parsed = aboutSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Girilen bilgilerde hata var.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { title, content, imageUrl } = parsed.data;

    // Görsel değiştiyse eskisini diskten sil — public/uploads şişmesin.
    const current = await prisma.aboutSettings.findUnique({
      where: { id: 1 },
      select: { imageUrl: true },
    });

    await prisma.aboutSettings.upsert({
      where: { id: 1 },
      update: { title, content, imageUrl },
      create: { id: 1, title, content, imageUrl },
    });

    if (current?.imageUrl && current.imageUrl !== imageUrl) {
      await deleteUpload(current.imageUrl);
    }

    revalidatePath("/");

    return { ok: true, message: "Hakkımızda içeriği kaydedildi." };
  });
}
