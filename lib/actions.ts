import "server-only";
import { auth } from "@/lib/auth";

/**
 * Server Action ortak altyapısı.
 *
 * ⚠️ **Server Action'lar herkese açık HTTP uç noktalarıdır.** Panel middleware ile
 * korunsa bile action'ın kendisi doğrudan çağrılabilir. Bu yüzden veri değiştiren
 * HER action, ilk satırında `requireAdmin()` çağırmak zorundadır.
 */

/**
 * Action'ların ortak dönüş tipi.
 *
 * `TData`, başarı durumunda geri taşınacak ek veriyi tanımlar (örn. yüklenen
 * görselin yolu). Çoğu action veri döndürmez; `data` opsiyonel olduğu için
 * `ActionResult` sade haliyle kullanılmaya devam eder.
 */
export type ActionResult<TData = undefined> =
  | { ok: true; message: string; data?: TData }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export class UnauthorizedError extends Error {
  constructor() {
    super("Bu işlem için giriş yapmanız gerekiyor.");
    this.name = "UnauthorizedError";
  }
}

/** Oturumu doğrular ve admin kaydının id'sini döndürür. */
export async function requireAdmin(): Promise<{ id: number; name: string }> {
  const session = await auth();
  const id = Number(session?.user?.id);

  if (!session?.user || Number.isNaN(id)) {
    throw new UnauthorizedError();
  }

  return { id, name: session.user.name ?? "" };
}

/**
 * Action gövdesini sarmalar: yetki ve beklenmedik hataları tek yerde yönetir.
 * CLAUDE.md §5 gereği her action try-catch ile korunur.
 */
export async function runAction<TData = undefined>(
  fn: () => Promise<ActionResult<TData>>
): Promise<ActionResult<TData>> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { ok: false, message: error.message };
    }

    // Beklenmedik hatanın detayı sunucu loguna, kullanıcıya genel mesaj.
    console.error("[action]", error);
    return {
      ok: false,
      message: "İşlem sırasında beklenmedik bir hata oluştu.",
    };
  }
}
