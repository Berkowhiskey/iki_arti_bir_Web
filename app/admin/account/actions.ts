"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin, runAction, type ActionResult } from "@/lib/actions";
import { passwordSchema } from "@/lib/validations";

export async function changePassword(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const admin = await requireAdmin();

    const parsed = passwordSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Girilen bilgilerde hata var.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { currentPassword, newPassword } = parsed.data;

    const record = await prisma.admin.findUnique({
      where: { id: admin.id },
      select: { passwordHash: true },
    });

    if (!record) {
      return { ok: false, message: "Hesap bulunamadı." };
    }

    // Mevcut şifre doğrulanmadan değişikliğe izin verilmez: oturumu ele geçiren
    // biri şifreyi değiştirip hesabı kalıcı olarak devralamasın.
    const isValid = await bcrypt.compare(currentPassword, record.passwordHash);
    if (!isValid) {
      return {
        ok: false,
        message: "Mevcut şifre hatalı.",
        fieldErrors: { currentPassword: ["Mevcut şifre hatalı."] },
      };
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash },
    });

    return { ok: true, message: "Şifreniz güncellendi." };
  });
}
