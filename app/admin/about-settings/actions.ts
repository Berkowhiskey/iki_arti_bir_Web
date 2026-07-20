"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, runAction, type ActionResult } from "@/lib/actions";
import { aboutSchema } from "@/lib/validations";

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

    const { title, content } = parsed.data;

    await prisma.aboutSettings.upsert({
      where: { id: 1 },
      update: { title, content },
      create: { id: 1, title, content },
    });

    revalidatePath("/");

    return { ok: true, message: "Hakkımızda içeriği kaydedildi." };
  });
}
