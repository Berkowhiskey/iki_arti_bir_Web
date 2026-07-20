import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "İletişim Bilgileri" };
export const dynamic = "force-dynamic";

export default async function ContactSettingsPage() {
  const contact = await prisma.contactSettings.findUnique({ where: { id: 1 } });

  return (
    <ContactForm
      defaultValues={{
        email: contact?.email ?? "",
        phone: contact?.phone ?? "",
        address: contact?.address ?? "",
        instagramUrl: contact?.instagramUrl ?? "",
        linkedinUrl: contact?.linkedinUrl ?? "",
        // Decimal → string; Client Component'e düz değer geçmeli.
        mapLat: contact?.mapLat?.toString() ?? "",
        mapLng: contact?.mapLng?.toString() ?? "",
      }}
    />
  );
}
