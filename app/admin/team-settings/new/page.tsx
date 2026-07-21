import type { Metadata } from "next";
import { TeamForm } from "../team-form";

export const metadata: Metadata = { title: "Yeni ekip üyesi" };

export default function NewTeamMemberPage() {
  return (
    <TeamForm
      defaultValues={{
        name: "",
        slug: "",
        title: "",
        bio: "",
        discipline: "DIGER",
        order: "0",
        isActive: true,
        imageUrl: null,
        instagramUrl: "",
        linkedinUrl: "",
      }}
    />
  );
}
