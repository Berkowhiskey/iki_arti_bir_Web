"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type RevealProps = {
  children: ReactNode;
  /** Sıralı görünüm için gecikme (saniye). */
  delay?: number;
  /** Metnin hangi yönden geleceği. */
  direction?: "up" | "left" | "right";
  className?: string;
};

const OFFSET = 28;

/**
 * Görünüm alanına girince içeriği akıcı şekilde ortaya çıkarır.
 * Ziyaretçi sayfasındaki tüm bölümler bunu kullanır.
 */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  className,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const initial =
    direction === "up"
      ? { opacity: 0, y: OFFSET }
      : direction === "left"
        ? { opacity: 0, x: -OFFSET }
        : { opacity: 0, x: OFFSET };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
