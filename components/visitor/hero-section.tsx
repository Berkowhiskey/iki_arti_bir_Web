"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { GridOverlay } from "./grid-overlay";
import { ArchMotifs } from "./arch-motifs";

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

  // Hero'nun kendi scroll ilerlemesi: üstü ekranın üstündeyken 0, altı üstüne geldiğinde 1.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Slogan modalı kaydıkça küçülüp kaybolur.
  const modalScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.82]);
  const modalOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const modalY = useTransform(scrollYProgress, [0, 0.6], [0, 60]);

  // Paneller hafifçe birbirinden uzaklaşır — derinlik hissi.
  const leftPanelX = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const rightPanelX = useTransform(scrollYProgress, [0, 1], [0, 40]);

  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // Hareket azaltma tercihi varsa scroll'a bağlı dönüşümleri devre dışı bırak.
  const motionStyle = reduceMotion
    ? {}
    : { scale: modalScale, opacity: modalOpacity, y: modalY };

  return (
    <section
      id="anasayfa"
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-antrasit-deep outline-none"
      aria-label="Giriş"
    >
      {/* ---- SOL PANEL: Mühendislik / brütalist beton ---- */}
      <motion.div
        className="absolute inset-y-0 left-0 w-full md:w-1/2"
        style={reduceMotion ? {} : { x: leftPanelX }}
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
          <GridOverlay progress={scrollYProgress} />

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

      {/* ---- SAĞ PANEL: Mimarlık / sıcak meşe ---- */}
      <motion.div
        className="absolute inset-y-0 right-0 hidden w-1/2 md:block"
        style={reduceMotion ? {} : { x: rightPanelX }}
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
          <ArchMotifs progress={scrollYProgress} />

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
    </section>
  );
}
