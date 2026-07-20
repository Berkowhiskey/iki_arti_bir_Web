"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, runAction, type ActionResult } from "@/lib/actions";
import { contactSchema, emptyToNull } from "@/lib/validations";

export async function updateContactSettings(
  input: unknown
): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();

    const parsed = contactSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Girilen bilgilerde hata var.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { email, phone, address } = parsed.data;

    const data = {
      email,
      phone,
      address,
      instagramUrl: emptyToNull(parsed.data.instagramUrl),
      linkedinUrl: emptyToNull(parsed.data.linkedinUrl),
      // Koordinatlar Decimal alana string olarak verilir — kayan nokta yok.
      mapLat: emptyToNull(parsed.data.mapLat),
      mapLng: emptyToNull(parsed.data.mapLng),
    };

    await prisma.contactSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    revalidatePath("/");

    return { ok: true, message: "İletişim bilgileri kaydedildi." };
  });
}
