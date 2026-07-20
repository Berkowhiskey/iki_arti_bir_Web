import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Rota koruması — Next.js 16'da `middleware` konvansiyonu `proxy` olarak
 * yeniden adlandırıldı. Edge runtime'da çalışır.
 *
 * ⚠️ Burada Edge-uyumlu `auth.config.ts` kullanılır; Prisma ve bcrypt içeren
 * `lib/auth.ts` ASLA buraya import edilmemeli — Edge'de çalışmaz.
 */
export const { auth: proxy } = NextAuth(authConfig);

export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
