import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getTheme } from "@/lib/theme-server";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  /**
   * ⚠️ `metadataBase` olmadan Next.js göreli metadata adreslerini mutlak hale
   * getiremez ve derlemede uyarı verir. Paylaşım önizlemesi görselleri de
   * göreli yolla çalışmaz — mutlak URL şart.
   */
  metadataBase: new URL(SITE_URL),
  title: {
    default: "İki Artı Bir Yapı — Mimarlık & Mühendislik",
    template: "%s | İki Artı Bir Yapı",
  },
  description: "Yaşama değer katan benzersiz çizgiler. İzmir/Foça merkezli mimarlık ve inşaat mühendisliği.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Tema çerezden okunup doğrudan <html> sınıfına yazılır.
  // Böylece istemci script'i gerekmez: ne FOUC olur, ne hydration uyuşmazlığı.
  const theme = await getTheme();

  return (
    <html
      lang="tr"
      className={cn(
        geistSans.variable,
        geistMono.variable,
        "h-full antialiased",
        theme === "dark" && "dark"
      )}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
