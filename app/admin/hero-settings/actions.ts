"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, runAction, type ActionResult } from "@/lib/actions";
import { emptyToNull, heroSchema } from "@/lib/validations";

export async function updateHeroSettings(
  input: unknown
): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();

    // İstemci doğrulaması geçilmiş olabilir; sunucuda yeniden doğrula.
    const parsed = heroSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Girilen bilgilerde hata var.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const slogan = parsed.data.slogan;
    const subSlogan = emptyToNull(parsed.data.subSlogan);

    await prisma.heroSettings.upsert({
      where: { id: 1 },
      update: { slogan, subSlogan },
      create: { id: 1, slogan, subSlogan },
    });

    // Ziyaretçi sayfası bu veriyi gösteriyor; önbelleği tazele.
    revalidatePath("/");

    return { ok: true, message: "Hero ayarları kaydedildi." };
  });
}
