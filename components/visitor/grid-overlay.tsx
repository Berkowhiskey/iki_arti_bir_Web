"use client";

import { motion, useReducedMotion, type MotionValue } from "motion/react";

type GridOverlayProps = {
  /** Hero'nun scroll ilerlemesi (0 → 1). Çizgiler bu değere göre uzar. */
  progress: MotionValue<number>;
};

/** Milimetrik mimari ızgara — sol paneldeki mühendislik katmanı. */
export function GridOverlay({ progress }: GridOverlayProps) {
  const reduceMotion = useReducedMotion();

  // Dikey çizgiler sayfa kaydıkça aşağı doğru uzar.
  const verticalLines = [12, 28, 44, 60, 76, 92];
  const horizontalLines = [18, 38, 58, 78];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* İnce zemin ızgarası — sabit, dokusal katman */}
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--beton-100) 1px, transparent 1px), linear-gradient(to bottom, var(--beton-100) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Strüktürel dikey çizgiler — scroll ile uzayan katman */}
      {verticalLines.map((left, index) => (
        <motion.div
          key={`v-${left}`}
          className="absolute top-0 w-px origin-top bg-beton-100/45"
          style={{
            left: `${left}%`,
            height: "100%",
            scaleY: reduceMotion ? 1 : progress,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 + index * 0.08, duration: 0.5 }}
        />
      ))}

      {/* Yatay ölçü çizgileri — teknik çizim hissi */}
      {horizontalLines.map((top, index) => (
        <motion.div
          key={`h-${top}`}
          className="absolute left-0 h-px w-full origin-left bg-beton-100/30"
          style={{ top: `${top}%` }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.9 + index * 0.12, duration: 0.8, ease: "easeOut" }}
        />
      ))}

      {/* Köşe işaretleri — teknik çizim referans noktaları */}
      <motion.div
        className="absolute left-8 top-8 h-10 w-10 border-l border-t border-beton-100/55"
        initial={{ opacity: 0, x: -8, y: -8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      />
      <motion.div
        className="absolute bottom-8 right-8 h-10 w-10 border-b border-r border-beton-100/55"
        initial={{ opacity: 0, x: 8, y: 8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      />
    </div>
  );
}
