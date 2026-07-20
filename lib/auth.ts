import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { prisma } from "./prisma";

/**
 * Tam Auth yapılandırması — Prisma ve bcrypt kullandığı için yalnızca
 * Node.js runtime'da çalışır. Middleware bunu DEĞİL, auth.config.ts'i kullanır.
 */

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const admin = await prisma.admin.findUnique({
          where: { email: email.toLowerCase() },
        });

        // Kullanıcı yoksa da bcrypt karşılaştırması yapılır: aksi halde yanıt
        // süresi farkından e-postanın kayıtlı olup olmadığı anlaşılabilir
        // (kullanıcı adı sayımı / timing attack).
        const hash =
          admin?.passwordHash ??
          "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvaliduu";

        const isValid = await bcrypt.compare(password, hash);

        if (!admin || !isValid) return null;

        return {
          id: String(admin.id),
          name: admin.name,
          email: admin.email,
        };
      },
    }),
  ],
});
