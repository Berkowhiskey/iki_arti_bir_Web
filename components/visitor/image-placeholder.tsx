import Image from "next/image";
import { Building2, Compass, Ruler } from "lucide-react";

/**
 * Görsel henüz yüklenmemişse kırık resim ikonu yerine marka renklerinde
 * zarif bir yer tutucu gösterir. Admin panelden gerçek görsel girilince
 * otomatik olarak devreye girer.
 */

/**
 * Placeholder'da baş harf yerine ilk isim gösterilir: firmanın iki kurucusu
 * aynı soyadı taşıdığı için baş harfler (ikisi de "CG") ayırt edici olmuyor.
 */
function getDisplayName(name: string): string {
  const firstName = name.trim().split(/\s+/)[0] ?? name;
  return firstName.toLocaleUpperCase("tr-TR");
}

/** Placeholder'ın hangi paletle çizileceği — kartın disiplin temasıyla uyumlu olmalı. */
const PERSON_VARIANTS = {
  beton: {
    bg: "bg-beton-800",
    gradient:
      "linear-gradient(145deg, var(--beton-600) 0%, var(--beton-800) 100%)",
    grid: "var(--beton-200)",
    text: "text-beton-100/70",
  },
  mese: {
    bg: "bg-mese-900",
    gradient:
      "linear-gradient(145deg, var(--mese-700) 0%, var(--mese-900) 100%)",
    grid: "var(--mese-200)",
    text: "text-mese-100/70",
  },
  neutral: {
    bg: "bg-antrasit",
    gradient:
      "linear-gradient(145deg, var(--antrasit) 0%, var(--antrasit-deep) 100%)",
    grid: "var(--beton-300)",
    text: "text-beton-200/70",
  },
} as const;

type PersonImageProps = {
  src: string | null;
  name: string;
  variant?: keyof typeof PERSON_VARIANTS;
  className?: string;
};

export function PersonImage({
  src,
  name,
  variant = "neutral",
  className = "",
}: PersonImageProps) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    );
  }

  const theme = PERSON_VARIANTS[variant];

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${theme.bg} ${className}`}
      role="img"
      aria-label={`${name} — fotoğraf henüz eklenmedi`}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{ backgroundImage: theme.gradient }}
      />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `linear-gradient(to right, ${theme.grid} 1px, transparent 1px), linear-gradient(to bottom, ${theme.grid} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      <span
        className={`relative font-mono text-lg font-light tracking-[0.35em] sm:text-xl ${theme.text}`}
      >
        {getDisplayName(name)}
      </span>
    </div>
  );
}

const CATEGORY_META = {
  MIMARLIK: { icon: Compass, label: "Mimarlık" },
  MUHENDISLIK: { icon: Ruler, label: "Mühendislik" },
  IC_DIZAYN: { icon: Building2, label: "İç Dizayn" },
} as const;

type ProjectImageProps = {
  src: string | null;
  title: string;
  category: keyof typeof CATEGORY_META;
  className?: string;
};

export function ProjectImage({
  src,
  title,
  category,
  className = "",
}: ProjectImageProps) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    );
  }

  const { icon: Icon, label } = CATEGORY_META[category];

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-antrasit ${className}`}
      role="img"
      aria-label={`${title} — görsel henüz eklenmedi`}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 60% 40%, var(--mese-900) 0%, transparent 65%), linear-gradient(160deg, var(--antrasit) 0%, var(--antrasit-deep) 100%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-3">
        <Icon
          className="h-8 w-8 text-mese-500/50"
          strokeWidth={1}
          aria-hidden="true"
        />
        <span className="font-mono text-[10px] tracking-[0.25em] text-beton-400/60">
          {label.toLocaleUpperCase("tr-TR")}
        </span>
      </div>
    </div>
  );
}
