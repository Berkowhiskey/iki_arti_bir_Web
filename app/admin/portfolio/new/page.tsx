import type { Metadata } from "next";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "Yeni proje" };

export default function NewProjectPage() {
  return (
    <>
      <ProjectForm
        defaultValues={{
          title: "",
          slug: "",
          category: "MIMARLIK",
          location: "",
          description: "",
          latitude: "",
          longitude: "",
          coverImage: null,
          order: "0",
          isPublished: true,
        }}
      />
      <p className="mx-auto mt-6 max-w-2xl text-xs text-muted-foreground">
        Galeri görselleri, proje kaydedildikten sonra düzenleme ekranından
        eklenir.
      </p>
    </>
  );
}
