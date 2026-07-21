-- TeamMember.slug — ekip üyesi detay sayfası adresi (/ekip/<slug>).
--
-- Bu migration ELLE yazıldı. `prisma migrate dev` tek adımda
-- "NOT NULL + UNIQUE kolon ekle" üretiyor, tabloda kayıt varken bu adım
-- çalışamıyor (varsayılan değer yok, üstelik hepsi aynı olurdu → unique ihlali).
-- Bu yüzden üç adıma bölündü.

-- 1) Önce boş geçilebilir olarak eklenir.
ALTER TABLE `team_members` ADD COLUMN `slug` VARCHAR(191) NULL;

-- 2) Mevcut satırlara benzersiz geçici bir değer yazılır (id'ye dayandığı için
--    çakışma imkânsız). Okunabilir slug'lar (ceren-gurbuz gibi) hemen ardından
--    `prisma/backfill-team-slugs.ts` ile yazılır — Türkçe karakter çevirisi
--    SQL'de değil, uygulamadaki `slugify()` ile yapılsın diye.
UPDATE `team_members` SET `slug` = CONCAT('uye-', `id`) WHERE `slug` IS NULL;

-- 3) Artık her satırda değer var; zorunlu hale getirilip unique index kurulur.
ALTER TABLE `team_members` MODIFY `slug` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `team_members_slug_key` ON `team_members`(`slug`);
