"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react";

type ArchMotifsProps = {
  /** Hero'nun scroll ilerlemesi (0 → 1). */
  progress: MotionValue<number>;
};

/**
 * Sağ paneldeki mimari görsel dil — sol paneldeki mühendislik grid'inin karşılığı.
 * Pergel geometrisi, altın oran dikdörtgeni ve plan çizgileri; hepsi ince kontur,
 * kendini çizerek beliren SVG olarak.
 */
export function ArchMotifs({ progress }: ArchMotifsProps) {
  const reduceMotion = useReducedMotion();

  // Kompozisyon scroll ile çok hafif yukarı süzülür — derinlik hissi.
  const y = useTransform(progress, [0, 1], [0, -50]);
  const opacity = useTransform(progress, [0, 0.8], [1, 0.25]);

  const draw = (delay: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { delay, duration: 1.8, ease: [0.22, 1, 0.36, 1] as const },
      opacity: { delay, duration: 0.6 },
    },
  });

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={reduceMotion ? {} : { y, opacity }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Büyük pergel dairesi — kısmen kadraj dışında */}
        <motion.circle
          cx="300"
          cy="300"
          r="180"
          stroke="var(--mese-200)"
          strokeWidth="0.75"
          strokeOpacity="0.28"
          {...draw(1.0)}
        />

        {/* İç daire — oran ilişkisi */}
        <motion.circle
          cx="300"
          cy="300"
          r="111"
          stroke="var(--mese-300)"
          strokeWidth="0.75"
          strokeOpacity="0.22"
          {...draw(1.25)}
        />

        {/* Altın oran dikdörtgeni */}
        <motion.rect
          x="120"
          y="180"
          width="180"
          height="291"
          stroke="var(--mese-200)"
          strokeWidth="0.75"
          strokeOpacity="0.25"
          {...draw(1.15)}
        />

        {/* İç bölünme — dikdörtgenin oransal kesiti */}
        <motion.line
          x1="120"
          y1="291"
          x2="300"
          y2="291"
          stroke="var(--mese-300)"
          strokeWidth="0.75"
          strokeOpacity="0.2"
          {...draw(1.5)}
        />

        {/* Plan çizgisi — yatay taban */}
        <motion.line
          x1="40"
          y1="620"
          x2="360"
          y2="620"
          stroke="var(--mese-200)"
          strokeWidth="0.75"
          strokeOpacity="0.3"
          {...draw(1.35)}
        />

        {/* Kesit oku — teknik çizim referansı */}
        <motion.line
          x1="60"
          y1="600"
          x2="60"
          y2="640"
          stroke="var(--mese-300)"
          strokeWidth="0.75"
          strokeOpacity="0.28"
          {...draw(1.6)}
        />
        <motion.line
          x1="340"
          y1="600"
          x2="340"
          y2="640"
          stroke="var(--mese-300)"
          strokeWidth="0.75"
          strokeOpacity="0.28"
          {...draw(1.65)}
        />

        {/* Eğim / çatı hattı */}
        <motion.path
          d="M 60 140 L 200 60 L 340 140"
          stroke="var(--mese-200)"
          strokeWidth="0.75"
          strokeOpacity="0.22"
          {...draw(1.45)}
        />
      </svg>

      {/* Merkez noktası — pergel ucu */}
      <motion.div
        className="absolute h-1 w-1 rounded-full bg-mese-300/50"
        style={{ left: "75%", top: "37.5%" }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      />
    </motion.div>
  );
}
