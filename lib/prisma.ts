import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Prisma 7 driver adapter mimarisi: bağlantı artık şemadan değil,
// çalışma anında adapter üzerinden kuruluyor.
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL tanımlı değil. .env dosyasını kontrol et.");
  }

  return new PrismaClient({
    adapter: new PrismaMariaDb(connectionString),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// Next.js dev modunda hot-reload her seferinde yeni bir PrismaClient üretir ve
// veritabanı bağlantı havuzu tükenir. globalThis üzerinde cache'leyerek önlüyoruz.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
