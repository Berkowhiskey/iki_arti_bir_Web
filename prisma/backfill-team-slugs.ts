/**
 * Ekip üyelerinin geçici slug'larını okunabilir hale getirir.
 *
 * `20260721113000_add_team_slug` migration'ı mevcut satırlara `uye-<id>` gibi
 * geçici bir değer yazar (SQL'de Türkçe karakter çevirisi yapılamadığı için).
 * Bu script onları `slugify(name)` ile üretilmiş adreslere çevirir:
 * "Ceren Gürbüz" → "ceren-gurbuz".
 *
 * Idempotent: yalnızca `uye-<id>` desenindeki slug'lara dokunur, elle
 * düzenlenmiş adresleri bozmaz. Tekrar tekrar çalıştırmak güvenlidir.
 *
 * Çalıştırma:  npm run db:backfill-slugs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { slugify } from "../lib/validations";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL tanımlı değil. .env dosyasını kontrol et.");
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL),
});

const PLACEHOLDER = /^uye-\d+$/;

async function main() {
  const members = await prisma.teamMember.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { id: "asc" },
  });

  const taken = new Set(members.map((m) => m.slug));
  let updated = 0;

  for (const member of members) {
    if (!PLACEHOLDER.test(member.slug)) {
      console.log(`- ${member.name}: "${member.slug}" (elle ayarlanmış, atlandı)`);
      continue;
    }

    const base = slugify(member.name) || `uye-${member.id}`;
    let candidate = base;
    let counter = 2;

    // Aynı isimli iki üye olabilir; benzersizliği garantile.
    while (taken.has(candidate) && candidate !== member.slug) {
      candidate = `${base}-${counter++}`;
    }

    if (candidate === member.slug) continue;

    await prisma.teamMember.update({
      where: { id: member.id },
      data: { slug: candidate },
    });

    taken.delete(member.slug);
    taken.add(candidate);
    updated++;

    console.log(`✓ ${member.name}: "${member.slug}" → "${candidate}"`);
  }

  console.log(`\n${updated} kayıt güncellendi, ${members.length - updated} atlandı.`);
}

main()
  .catch((error) => {
    console.error("Backfill başarısız:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
