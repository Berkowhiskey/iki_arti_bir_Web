"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Açılış animasyonu — iki panel ortadan ayrılarak siteyi açar.
 * "İki artı bir" kimliğine gönderme: iki parça, tek bütün.
 */
export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), reduceMotion ? 200 : 1400);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  // Açılış sırasında sayfanın kaymasını engelle.
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Sol panel — beton */}
          <motion.div
            className="h-full w-1/2 bg-beton-900"
            initial={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
          {/* Sağ panel — antrasit */}
          <motion.div
            className="h-full w-1/2 bg-antrasit-deep"
            initial={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Ortadaki logo işareti */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 text-beton-100">
              <motion.span
                className="font-mono text-3xl font-light"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                2
              </motion.span>
              <motion.span
                className="font-mono text-3xl font-light text-mese-400"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                +
              </motion.span>
              <motion.span
                className="font-mono text-3xl font-light"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                1
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
