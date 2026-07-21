"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { TeamMemberContent } from "@/lib/queries";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PersonImage } from "./image-placeholder";
import { DISCIPLINE_THEME } from "./discipline-theme";

/**
 * Ekip kartları — yatay slider.
 *
 * Önce 2 sütunlu grid'di; iki kurucuyla şıktı ama üçüncü kişi eklendiğinde
 * bölüm dağılıyordu. Kartlar küçültülüp Embla tabanlı carousel'e alındı:
 * kartlar sığdığı sürece kaydırma devreye girmez, sığmayınca oklar aktifleşir.
 *
 * ⚠️ **Bu bileşen `Reveal` KULLANMAZ.** Giriş animasyonu tüm slider'ı saran tek
 * bir `Reveal` ile `team-section.tsx`'te veriliyor. Kartların her biri ayrı
 * `Reveal` ile sarılsaydı, `whileInView` + `viewport={{ once: true }}` yatay
 * kaydırmada ekran dışındaki slaytları hiç tetiklemez ve üçüncü karttan
 * sonrası kalıcı olarak `opacity: 0` kalırdı.
 */
export function TeamCarousel({ members }: { members: TeamMemberContent[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <Carousel
      opts={{
        align: "start",
        // Kartlar ekrana sığıyorsa sürükleme/oklar kendiliğinden devre dışı.
        containScroll: "trimSnaps",
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-6">
        {members.map((member) => {
          const theme = DISCIPLINE_THEME[member.discipline];

          return (
            <CarouselItem
              key={member.id}
              className="pl-6 sm:basis-1/2 lg:basis-1/3"
            >
              <motion.article
                className={`group relative h-full border border-white/10 ${theme.panel}`}
                // "Floater": kart imleçle hafifçe yükselir. Sürükleme sırasında
                // tetiklenmemesi için sadece hover'a bağlı, tap'e değil.
                whileHover={reduceMotion ? undefined : { y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                {/* Hero'daki panel dokusunun aynısı */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-70"
                  style={{ backgroundImage: theme.texture }}
                />

                <div className="relative">
                  <PersonImage
                    src={member.imageUrl}
                    name={member.name}
                    variant={theme.avatar}
                    className="aspect-4/3 w-full"
                    // Slayt genişliği: mobilde tam, sm'de 1/2, lg'de 1/3.
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-light text-white">
                      {/* Kartı kaplayan görünmez bağlantı — ekran okuyucuda
                          tek anlamlı bağlantı kalsın diye başlıktan çıkıyor.
                          Embla sürükleme sonrası tıklamayı kendisi iptal eder
                          (dragThreshold), ek önlem gerekmiyor. */}
                      <Link
                        href={`/ekip/${member.slug}`}
                        className="before:absolute before:inset-0 before:z-10 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                      >
                        {member.name}
                      </Link>
                    </h3>
                    <div
                      className={`mt-2 font-mono text-[10px] tracking-[0.2em] ${theme.accent}`}
                    >
                      {member.title.toLocaleUpperCase("tr-TR")}
                    </div>
                    <div className={`mt-5 h-px w-10 ${theme.rule}`} />
                    <p
                      className={`mt-5 line-clamp-3 text-pretty text-sm leading-[1.8] ${theme.body}`}
                    >
                      {member.bio}
                    </p>
                    <div
                      className={`mt-5 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] ${theme.accent} transition-transform duration-300 group-hover:translate-x-1`}
                    >
                      DEVAMINI OKU
                      <ArrowRight
                        className="h-3.5 w-3.5"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </motion.article>
            </CarouselItem>
          );
        })}
      </CarouselContent>

      {/* Oklar koyu zemine göre renklendirildi; sığan liste durumunda
          Embla bunları kendiliğinden `disabled` yapar. */}
      <CarouselPrevious className="-left-4 border-white/20 bg-white/5 text-beton-100 hover:bg-white/10 hover:text-white disabled:opacity-30" />
      <CarouselNext className="-right-4 border-white/20 bg-white/5 text-beton-100 hover:bg-white/10 hover:text-white disabled:opacity-30" />
    </Carousel>
  );
}
