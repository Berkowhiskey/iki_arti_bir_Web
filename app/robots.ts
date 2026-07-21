import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * `/robots.txt` — arama motorlarına neyi tarayabileceklerini bildirir.
 *
 * ⚠️ **Bu bir güvenlik önlemi DEĞİLDİR.** `robots.txt` yalnızca iyi niyetli
 * tarayıcılara "buraya girme" der; kimseyi engellemez. Admin panelinin gerçek
 * koruması `proxy.ts` + `app/admin/layout.tsx` içindeki oturum kontrolüdür
 * (bkz. Faz 3). Buradaki kayıt, panel adreslerinin arama sonuçlarında
 * görünmesini engellemek içindir.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Panel ve giriş ekranı arama sonuçlarında görünmemeli.
      disallow: ["/admin", "/admin/", "/login", "/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
