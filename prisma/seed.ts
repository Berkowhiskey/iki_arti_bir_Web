import "dotenv/config";
import { Discipline, PrismaClient, ProjectCategory } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL tanımlı değil. .env dosyasını kontrol et.");
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL),
});

/// Şifreler .env'den okunur — bu dosyaya asla sabit gömülmez.
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Eksik ortam değişkeni: ${key}. .env dosyasını kontrol et.`
    );
  }
  return value;
}

async function seedAdmins() {
  const admins = [
    {
      email: requireEnv("SEED_ADMIN_CEREN_EMAIL"),
      password: requireEnv("SEED_ADMIN_CEREN_PASSWORD"),
      name: "Ceren Gürbüz",
    },
    {
      email: requireEnv("SEED_ADMIN_CANSIN_EMAIL"),
      password: requireEnv("SEED_ADMIN_CANSIN_PASSWORD"),
      name: "Cansın Gürbüz",
    },
  ];

  for (const admin of admins) {
    const passwordHash = await bcrypt.hash(admin.password, 12);
    await prisma.admin.upsert({
      where: { email: admin.email },
      update: { name: admin.name, passwordHash },
      create: { email: admin.email, name: admin.name, passwordHash },
    });
  }

  console.log(`✓ ${admins.length} admin hesabı hazır.`);
}

async function seedSettings() {
  await prisma.heroSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      slogan: "Yaşama değer katan benzersiz çizgiler.",
      subSlogan:
        "Mimarlık ve mühendisliğin aynı masada buluştuğu, İzmir/Foça merkezli bir tasarım ve uygulama atölyesi.",
    },
  });

  await prisma.aboutSettings.upsert({
    where: { id: 1 },
    // Görsel yolu null — dosya yüklenene kadar arayüz zarif placeholder gösterir.
    update: { imageUrl: null },
    create: {
      id: 1,
      title: "Hakkımızda",
      content:
        "İki Artı Bir Yapı, mimari tasarımın estetik hassasiyeti ile inşaat mühendisliğinin " +
        "strüktürel disiplinini tek bir çatı altında buluşturmak üzere kuruldu. Foça'nın " +
        "kendine has dokusundan beslenen tasarım anlayışımız, her projede malzemenin " +
        "doğallığını ve ışığın mekân üzerindeki etkisini merkeze alır.\n\n" +
        "Konsept aşamasından anahtar teslimine kadar tüm süreci kendi ekibimizle yürütüyor, " +
        "her detayın çizimdeki haliyle sahada birebir örtüşmesini sağlıyoruz.",
      imageUrl: null,
    },
  });

  await prisma.contactSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      email: "info@ikiartibiryapi.com",
      phone: "+90 555 000 00 00",
      address: "Foça, İzmir, Türkiye",
      instagramUrl: "https://instagram.com/ikiartibiryapi",
      linkedinUrl: "https://linkedin.com/company/ikiartibiryapi",
      mapLat: "38.6689000",
      mapLng: "26.7561000",
    },
  });

  console.log("✓ Hero, Hakkımızda ve İletişim ayarları hazır.");
}

async function seedTeam() {
  const team = [
    {
      email: "ceren",
      name: "Ceren Gürbüz",
      title: "Mimar, Kurucu Ortak",
      discipline: Discipline.MIMARLIK,
      bio:
        "Mimarlık eğitimini tamamladıktan sonra konut ve butik otel projelerinde tasarım " +
        "yürütücülüğü yaptı. İç mekânda doğal malzeme kullanımı ve ışık kurgusu üzerine " +
        "çalışıyor. İki Artı Bir Yapı'da tasarım süreçlerinin tamamını yönetiyor.",
      order: 1,
    },
    {
      email: "cansin",
      name: "Cansın Gürbüz",
      title: "İnşaat Mühendisi, Kurucu Ortak",
      discipline: Discipline.MUHENDISLIK,
      bio:
        "Betonarme ve çelik yapı tasarımı üzerine uzmanlaştı. Deprem yönetmeliğine uygun " +
        "güçlendirme projeleri ve saha uygulama denetimi konularında deneyimli. " +
        "İki Artı Bir Yapı'da statik hesap ve şantiye yönetiminden sorumlu.",
      order: 2,
    },
  ];

  for (const member of team) {
    const existing = await prisma.teamMember.findFirst({
      where: { name: member.name },
    });

    const data = {
      name: member.name,
      title: member.title,
      bio: member.bio,
      discipline: member.discipline,
      // Fotoğraf admin panelden yüklenene kadar null — arayüz baş harfli
      // placeholder gösterir, kırık görsel çıkmaz.
      imageUrl: null,
      order: member.order,
      isActive: true,
    };

    if (existing) {
      await prisma.teamMember.update({ where: { id: existing.id }, data });
    } else {
      await prisma.teamMember.create({ data });
    }
  }

  console.log(`✓ ${team.length} ekip üyesi hazır.`);
}

async function seedProjects() {
  const projects = [
    {
      title: "Foça Sahil Konutu",
      slug: "foca-sahil-konutu",
      category: ProjectCategory.MIMARLIK,
      location: "Foça / İzmir",
      description:
        "Denize bakan eğimli bir arazide konumlanan tek ailelik konut. Yapı, manzarayı " +
        "kesintisiz bırakmak için iki kütleye ayrıldı; aradaki boşluk gölgeli bir avlu " +
        "olarak kurgulandı. Cephede yerel taş ve ısıl işlem görmüş ahşap birlikte kullanıldı.",
      latitude: "38.6712000",
      longitude: "26.7583000",
    },
    {
      title: "Menemen Endüstriyel Tesis Güçlendirme",
      slug: "menemen-endustriyel-tesis-guclendirme",
      category: ProjectCategory.MUHENDISLIK,
      location: "Menemen / İzmir",
      description:
        "Mevcut betonarme üretim tesisinin güncel deprem yönetmeliğine göre performans " +
        "analizi yapıldı ve mantolama ile perde ilavesi içeren güçlendirme projesi " +
        "hazırlandı. Uygulama, üretim durdurulmadan etaplar hâlinde tamamlandı.",
      latitude: "38.6089000",
      longitude: "27.0678000",
    },
    {
      title: "Alaçatı Butik Otel İç Mekân",
      slug: "alacati-butik-otel-ic-mekan",
      category: ProjectCategory.IC_DIZAYN,
      location: "Alaçatı / İzmir",
      description:
        "On iki odalı taş binanın iç mekân yenilemesi. Özgün taş duvarlar korunarak " +
        "sade bir malzeme paletiyle dengelendi; meşe, keten ve mat pirinç detaylar " +
        "kullanıldı. Tüm mobilyalar proje için özel olarak tasarlandı.",
      latitude: "38.2836000",
      longitude: "26.3739000",
    },
  ];

  for (const [index, project] of projects.entries()) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      // Kapak görseli null — gerçek dosya admin panelden yüklenecek.
      update: { coverImage: null },
      create: {
        ...project,
        coverImage: null,
        order: index + 1,
        isPublished: true,
      },
    });
  }

  // Eski seed'lerden kalan, diskte karşılığı olmayan galeri kayıtlarını temizle.
  const removed = await prisma.projectImage.deleteMany({
    where: { url: { startsWith: "/uploads/placeholder-" } },
  });
  if (removed.count > 0) {
    console.log(`  (${removed.count} geçersiz galeri kaydı temizlendi)`);
  }

  console.log(`✓ ${projects.length} proje hazır.`);
}

async function main() {
  console.log("Seed başlıyor...\n");
  await seedAdmins();
  await seedSettings();
  await seedTeam();
  await seedProjects();
  console.log("\nSeed tamamlandı.");
}

main()
  .catch((error) => {
    console.error("Seed hatası:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
