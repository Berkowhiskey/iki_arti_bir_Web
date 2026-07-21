-- TeamMember: kişisel sosyal medya adresleri (Instagram, LinkedIn).
-- Yalnızca ekip üyesi detay sayfasında gösterilir.
--
-- Bu migration da elle yazıldı — `prisma migrate dev` bu ortamda etkileşimli
-- çalışmayı gerektiriyor. İçerik basit: iki adet boş geçilebilir kolon,
-- varsayılan değer ve benzersizlik kısıtı yok, mevcut satırlar NULL kalır.
ALTER TABLE `team_members`
  ADD COLUMN `instagramUrl` VARCHAR(191) NULL,
  ADD COLUMN `linkedinUrl` VARCHAR(191) NULL;
