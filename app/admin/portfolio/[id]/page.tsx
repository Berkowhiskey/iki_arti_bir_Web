import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "../project-form";
import { GalleryManager } from "../gallery-manager";

export const metadata: Metadata = { title: "Projeyi düzenle" };
export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isInteger(projectId)) notFound();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      images: { orderBy: { order: "asc" }, select: { id: true, url: true } },
    },
  });

  if (!project) notFound();

  return (
    <>
      <ProjectForm
        projectId={project.id}
        defaultValues={{
          title: project.title,
          slug: project.slug,
          category: project.category,
          location: project.location,
          description: project.description,
          // ⚠️ Decimal → string. Server'dan Client'a Decimal serialize edilemez
          // (MEMORY.md, Faz 2). Zod şeması da string bekliyor.
          latitude: project.latitude.toString(),
          longitude: project.longitude.toString(),
          coverImage: project.coverImage,
          order: String(project.order),
          isPublished: project.isPublished,
        }}
      />

      <GalleryManager projectId={project.id} images={project.images} />
    </>
  );
}
