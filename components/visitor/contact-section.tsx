import { Mail, MapPin, Phone } from "lucide-react";
import type { ContactContent } from "@/lib/queries";
import { Reveal } from "./reveal";

/** İletişim — tek sütun, sakin ve geniş yerleşim. */
export function ContactSection({ contact }: { contact: ContactContent }) {
  const items = [
    { icon: Mail, label: "E-posta", value: contact.email, href: `mailto:${contact.email}` },
    { icon: Phone, label: "Telefon", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: "Adres", value: contact.address, href: null },
  ];

  const socials = [
    { label: "Instagram", url: contact.instagramUrl },
    { label: "LinkedIn", url: contact.linkedinUrl },
  ].filter((social): social is { label: string; url: string } => Boolean(social.url));

  return (
    <section
      id="iletisim"
      className="bg-white px-6 py-28 md:py-40"
      aria-labelledby="iletisim-baslik"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="mb-4 font-mono text-[11px] tracking-[0.3em] text-mese-700">
            04 — İLETİŞİM
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2
            id="iletisim-baslik"
            className="text-balance text-3xl font-light leading-tight tracking-tight text-antrasit md:text-4xl"
          >
            Bir fikriniz mi var? Konuşalım.
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-8 h-px w-16 bg-mese-600" />
        </Reveal>

        <dl className="mt-14 space-y-8">
          {items.map((item, index) => (
            <Reveal key={item.label} delay={0.25 + index * 0.08}>
              <div className="flex items-start gap-5">
                <item.icon
                  className="mt-1 h-4 w-4 shrink-0 text-mese-600"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <div>
                  <dt className="font-mono text-[10px] tracking-[0.2em] text-beton-400">
                    {item.label.toLocaleUpperCase("tr-TR")}
                  </dt>
                  <dd className="mt-1.5 text-base text-antrasit">
                    {item.href ? (
                      <a
                        href={item.href}
                        className="transition-colors hover:text-mese-700"
                      >
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              </div>
            </Reveal>
          ))}
        </dl>

        {socials.length > 0 && (
          <Reveal delay={0.5}>
            <div className="mt-16 flex gap-8 border-t border-beton-200 pt-8">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] tracking-[0.2em] text-beton-500 transition-colors hover:text-mese-700"
                >
                  {social.label.toLocaleUpperCase("tr-TR")} ↗
                </a>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
