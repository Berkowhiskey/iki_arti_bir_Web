"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  THEME_COOKIE_MAX_AGE,
  THEME_COOKIE_NAME,
  type Theme,
} from "@/lib/theme";

/**
 * Tema düğmesi. Başlangıç değeri sunucudan gelir (çerezden okunmuş hâli),
 * bu yüzden ilk render sunucu ile birebir aynıdır — hydration uyuşmazlığı olmaz.
 */
export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);

    // Anında görsel geri bildirim için sınıfı doğrudan uygula.
    document.documentElement.classList.toggle("dark", next === "dark");

    // Sonraki isteklerde sunucunun doğru temayı üretmesi için çereze yaz.
    document.cookie = `${THEME_COOKIE_NAME}=${next}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
  };

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
    >
      {isDark ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
}
