import "server-only";
import { cookies } from "next/headers";
import { THEME_COOKIE_NAME, type Theme } from "./theme";

/**
 * Aktif temayı çerezden okur. Yalnızca Server Component'lerde kullanılabilir —
 * `server-only` importu, yanlışlıkla bir client component'e sızarsa derlemeyi
 * anlaşılır bir hatayla durdurur.
 */
export async function getTheme(): Promise<Theme> {
  const store = await cookies();
  return store.get(THEME_COOKIE_NAME)?.value === "dark" ? "dark" : "light";
}
