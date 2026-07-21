"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { GridOverlay } from "./grid-overlay";
import { ArchMotifs } from "./arch-motifs";

/**
 * Masaüstünde hero'nun toplam yüksekliği (vh). 100vh sabit sahne + kalanı
 * kapıların açılması için "koşu yolu".
 *
 * ⚠️ Bu değeri değiştirirsen `STICKY_END` kendiliğinden güncellenir, ama
 * `site-header.tsx`'teki bar eşiği hero'nun gerçek yüksekliğini ölçtüğü için
 * orada elle bir şey yapmak gerekmez.
 *
 * İlk denemede 220'ydi: kapılar 98vh'de açılıp bitiyor, sahne 120vh'de
 * çözülüyordu — arada **22vh boyunca hiçbir şey olmayan beyaz ekran** kalıyor
 * ve bekleme uzun hissettiriyordu. 200'e indirilip kapı bitişi sona yaklaştırıldı.
 */
const HERO_VH = 200;

/**
 * Sticky sahnenin çözüldüğü nokta (ham scroll ilerlemesi cinsinden).
 * Sahne, section'ın altı ekranın altına gelene kadar çakılı kalır:
 * (200 - 100) / 200 = 0.5.
 */
const STICKY_END = 1 - 100 / HERO_VH;

type HeroSectionProps = {
  slogan: string;
  subSlogan: string | null;
  latestProject: {
    title: string;
    location: string;
    latitude: string;
    longitude: string;
  } | null;
};

export function HeroSection({ slogan, subSlogan, latestProject }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  /**
   * Kapı efekti yalnızca masaüstünde ve hareket azaltma kapalıyken çalışır.
   * Mobilde sağ panel zaten `hidden md:block` ile hiç render edilmiyor;
   * kullanıcı orada mevcut sade davranışın korunmasını tercih etti.
   *
   * `useIsMobile` ilk render'da `false` döner (istemcide ölçülene kadar).
   * Bu güvenli: scroll ilerlemesi 0 iken her iki dalda da panel `x = 0`,
   * yani ilk karede görsel fark yok.
   */
  const doorMode = !isMobile && !reduceMotion;

  // Hero'nun kendi scroll ilerlemesi: üstü ekranın üstündeyken 0, altı üstüne geldiğinde 1.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  /**
   * Koreografi ilerlemesi.
   *
   * Kapı modunda ham ilerleme `STICKY_END`'e bölünerek 0→1'e normalize edilir;
   * böylece tüm aralıklar "sahne çakılıyken" geçen süreye göre yazılabilir.
   * Mobilde sahne yok, ham ilerleme doğrudan kullanılır.
   */
  const p = useTransform(
    scrollYProgress,
    [0, doorMode ? STICKY_END : 1],
    [0, 1],
    { clamp: true }
  );

  /**
   * Koreografi — sıra kritik: ipucu → modal → kapılar.
   *
   * ⚠️ **Modal, kapılar açılmadan ÖNCE tamamen kaybolmalı.** Buzlu cam kart
   * `backdrop-blur-xl` kullanıyor; arkasındaki paneller kayarken bulanıklığı
   * her karede yeniden hesaplar ve Safari'de belirgin takılma yaratır.
   *
   * Mobil aralıklar Faz 2'deki değerlerle aynı bırakıldı — o taraftaki his
   * değişmesin diye.
   *
   * Masaüstü aralıkları (sticky yol = 100vh cinsinden):
   *   ipucu    0 → 12vh · modal 6 → 28vh · kapılar 30 → 90vh · beyaz 90 → 100vh
   */
  const modalOpacity = useTransform(p, doorMode ? [0.06, 0.28] : [0, 0.45], [1, 0]);
  const modalScale = useTransform(
    p,
    doorMode ? [0.06, 0.3] : [0, 0.6],
    [1, doorMode ? 0.88 : 0.82]
  );
  const modalY = useTransform(
    p,
    doorMode ? [0.06, 0.3] : [0, 0.6],
    [0, doorMode ? 48 : 60]
  );
  const scrollHintOpacity = useTransform(p, doorMode ? [0, 0.12] : [0, 0.15], [1, 0]);

  /**
   * Kapı kanatları — piksel değil **yüzde**. Yüzde elemanın kendi genişliğine
   * göre çözülür, bu yüzden `w-1/2` (masaüstü) için tek ifade yeterli.
   *
   * Bitiş 0.90'a çekildi (önce 0.82): kapılar sahnenin sonuna daha yakın
   * tamamlanıyor, arkasındaki beyaz bekleme 22vh'den 10vh'ye indi.
   */
  const leftPanelX = useTransform(p, [0.3, 0.9], ["0%", "-100%"]);
  const rightPanelX = useTransform(p, [0.3, 0.9], ["0%", "100%"]);

  /**
   * Alt bileşenler (`GridOverlay`, `ArchMotifs`) kendi içlerinde [0,1] aralığı
   * varsayıyor. Onları değiştirmek yerine girdiyi sıkıştırıyoruz: grid çizgileri
   * kapılar açılmaya başlamadan önce tam boyuna ulaşsın, kapı kayarken hâlâ
   * uzuyor görünmesin.
   */
  const contentProgress = useTransform(p, doorMode ? [0, 0.34] : [0, 1], [0, 1], {
    clamp: true,
  });

  // Hareket azaltma tercihi varsa scroll'a bağlı dönüşümleri devre dışı bırak.
  const motionStyle = reduceMotion
    ? {}
    : { scale: modalScale, opacity: modalOpacity, y: modalY };

  // Section: masaüstünde uzun bir "koşu yolu" (200vh), içindeki sahne ekrana
  // çakılıp kapılar bu yol boyunca açılır. Mobilde tek ekran.
  //
  // ⚠️ `overflow-hidden` section'da DEĞİL, sticky sahnenin üzerinde. Bir atada
  //    overflow olması onu scroll container yapar ve içteki sticky'yi kırar.
  // ⚠️ Arka plan `bg-white` — `bg-background` DEĞİL. Koyu temada `--background`
  //    siyaha döner ve kapılar açılınca koyu bir boşluk görünürdü.
  // ⚠️ `md:motion-reduce:h-screen`: hareket azaltma tercihinde koşu yolu CSS ile
  //    kaldırılır. JS ile yapmak hidrasyondan sonra 220vh→100vh sıçraması
  //    yaratırdı — tam olarak korumaya çalıştığımız kullanıcıda.
  return (
    <section
      id="anasayfa"
      ref={containerRef}
      className="relative h-screen w-full bg-white outline-none md:h-[200vh] md:motion-reduce:h-screen"
      aria-label="Giriş"
    >
      {/* Kapı sahnesi — masaüstünde ekrana çakılı kalan tek kare */}
      <div className="relative h-screen w-full overflow-hidden md:sticky md:top-0">
        {/* Kapıların ARKASINDAKİ beyaz alan */}
        <div aria-hidden="true" className="absolute inset-0 z-0 bg-white" />

        {/* ---- SOL KANAT: Mühendislik / brütalist beton ---- */}
        <motion.div
          className="absolute inset-y-0 left-0 z-10 w-full will-change-transform md:w-1/2"
          style={doorMode ? { x: leftPanelX } : {}}
        >
          <div className="relative h-full w-full bg-beton-700">
            {/* Ham beton dokusu — katmanlı gradyanlarla */}
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage: `
                  radial-gradient(ellipse at 20% 30%, var(--beton-500) 0%, transparent 55%),
                  radial-gradient(ellipse at 75% 70%, var(--beton-600) 0%, transparent 50%),
                  linear-gradient(160deg, var(--beton-600) 0%, var(--beton-800) 100%)
                `,
              }}
            />
            <GridOverlay progress={contentProgress} />

            {/* Sol alt köşe — son şantiyenin koordinatı (Faz 5.1 entegrasyonu) */}
            {latestProject && (
              <motion.div
                className="absolute bottom-10 left-8 z-10 hidden font-mono text-[11px] leading-relaxed text-beton-100/85 md:block"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.8 }}
              >
                <div className="mb-1 text-beton-200/70">SON ŞANTİYE</div>
                <div className="text-white">{latestProject.title}</div>
                <div className="text-beton-100/80">{latestProject.location}</div>
                <div className="mt-1 text-mese-200">
                  {latestProject.latitude}° N · {latestProject.longitude}° E
                </div>
              </motion.div>
            )}

            {/* Sol üst — disiplin etiketi */}
            <motion.div
              className="absolute left-8 top-24 z-10 hidden md:block"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.7 }}
            >
              <div className="font-mono text-[11px] tracking-[0.3em] text-beton-100/90">
                MÜHENDİSLİK
              </div>
              <div className="mt-2 h-px w-16 bg-mese-300/70" />
            </motion.div>
          </div>
        </motion.div>

        {/* ---- SAĞ KANAT: Mimarlık / sıcak meşe ---- */}
        <motion.div
          className="absolute inset-y-0 right-0 z-10 hidden w-1/2 will-change-transform md:block"
          style={doorMode ? { x: rightPanelX } : {}}
        >
          <div className="relative h-full w-full bg-mese-900">
            {/* Sıcak ahşap ışık oyunu */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(ellipse at 70% 25%, var(--mese-700) 0%, transparent 62%),
                  radial-gradient(ellipse at 25% 80%, var(--mese-800) 0%, transparent 58%),
                  linear-gradient(200deg, var(--mese-800) 0%, var(--antrasit) 100%)
                `,
              }}
            />

            {/* Yumuşak ışık huzmesi */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(105deg, transparent 40%, var(--mese-400) 50%, transparent 60%)",
                opacity: 0.1,
              }}
              initial={{ x: "-30%" }}
              animate={{ x: "30%" }}
              transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />

            {/* Mimari çizim motifleri — sol paneldeki grid'in karşılığı */}
            <ArchMotifs progress={contentProgress} />

            {/* Sağ üst — disiplin etiketi */}
            <motion.div
              className="absolute right-8 top-24 z-10 text-right"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.7 }}
            >
              <div className="font-mono text-[11px] tracking-[0.3em] text-mese-300/70">
                MİMARLIK
              </div>
              <div className="ml-auto mt-2 h-px w-16 bg-mese-500/60" />
            </motion.div>
          </div>
        </motion.div>

        {/* ---- ORTA: Buzlu cam slogan modalı ---- */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center px-6"
          style={motionStyle}
        >
          <motion.div
            className="w-full max-w-2xl border border-white/10 bg-white/[0.06] px-8 py-12 text-center shadow-2xl backdrop-blur-xl sm:px-14 sm:py-16"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="mb-6 font-mono text-[10px] tracking-[0.4em] text-mese-300/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              İKİ ARTI BİR YAPI
            </motion.div>

            <h1 className="text-balance text-3xl font-light leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              {slogan}
            </h1>

            {subSlogan && (
              <motion.p
                className="mx-auto mt-8 max-w-lg text-pretty text-sm leading-relaxed text-beton-200/80 sm:text-base"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.8 }}
              >
                {subSlogan}
              </motion.p>
            )}

            <motion.div
              className="mx-auto mt-10 h-px w-24 bg-gradient-to-r from-transparent via-mese-500 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.8, duration: 0.8 }}
            />
          </motion.div>
        </motion.div>

        {/* ---- Scroll ipucu ---- */}
        <motion.div
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
          style={reduceMotion ? {} : { opacity: scrollHintOpacity }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            transition={{
              opacity: { delay: 2.2, duration: 0.6 },
              y: { delay: 2.2, duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <ChevronDown className="h-5 w-5 text-beton-300/60" aria-hidden="true" />
            <span className="sr-only">Aşağı kaydırın</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
