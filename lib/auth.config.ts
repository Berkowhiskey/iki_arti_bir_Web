import type { NextAuthConfig } from "next-auth";

/**
 * Edge-uyumlu Auth yapılandırması.
 *
 * ⚠️ Bu dosya middleware tarafından Edge runtime'da çalıştırılır.
 * Prisma, bcrypt veya Node.js'e özgü hiçbir şey buraya girmemeli —
 * veritabanına erişen kısım `lib/auth.ts` içindedir.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    // Credentials provider yalnızca JWT stratejisiyle çalışır.
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 saat
  },
  callbacks: {
    /** Middleware bu callback ile hangi rotanın açık olduğuna karar verir. */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnLogin = nextUrl.pathname === "/login";

      if (isOnAdmin) {
        // Giriş yapılmamışsa Auth.js otomatik olarak /login'e yönlendirir.
        return isLoggedIn;
      }

      // Girişli kullanıcı login sayfasına gelirse panele gönder.
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL("/admin/dashboard", nextUrl));
      }

      return true;
    },

    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    session({ session, token }) {
      if (token.id) {
        session.user.id = String(token.id);
      }
      return session;
    },
  },
  // Sağlayıcılar lib/auth.ts içinde eklenir (Prisma gerektirdiği için).
  providers: [],
} satisfies NextAuthConfig;
