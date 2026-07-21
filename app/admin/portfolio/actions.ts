"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, runAction, type ActionResult } from "@/lib/actions";
import { projectSchema, slugify, uploadPath } from "@/lib/validations";
import { deleteUpload } from "@/lib/uploads";
import { uniqueSlug } from "@/lib/unique-slug";

function revalidateProjects() {
  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}

/** Proje tablosunda slug araması — `uniqueSlug` bunu kullanır. */
async function findProjectIdBySlug(slug: string): Promise<number | null> {
  const found = await prisma.project.findUnique({
    where: { slug },
    select: { id: true },
  });
  return found?.id ?? null;
}

/** Proje için benzersiz slug üretir. */
function uniqueProjectSlug(base: string, excludeId?: number) {
  return uniqueSlug(base, findProjectIdBySlug, excludeId);
}

function parseInput(input: unknown) {
  const parsed = projectSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: {
        ok: false as const,
        message: "Girilen bilgilerde hata var.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      },
    };
  }

  return { data: parsed.data };
}

export async function createProject(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();

    const { data, error } = parseInput(input);
    if (error) return error;

    const { slug, order, latitude, longitude, ...rest } = data;
    // Adres boş bırakıldıysa proje adından üretilir.
    const finalSlug = await uniqueProjectSlug(slugify(slug || rest.title));

    await prisma.project.create({
      data: {
        ...rest,
        slug: finalSlug,
        order: Number(order),
        // Decimal alanına string veriliyor — kayan nokta hiç devreye girmiyor.
        latitude,
        longitude,
      },
    });

    revalidateProjects();

    return { ok: true, message: "Proje eklendi." };
  });
}

export async function updateProject(
  id: number,
  input: unknown
): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();

    const { data, error } = parseInput(input);
    if (error) return error;

    const existing = await prisma.project.findUnique({
      where: { id },
      select: { coverImage: true },
    });

    if (!existing) {
      return { ok: false, message: "Proje bulunamadı." };
    }

    const { slug, order, latitude, longitude, ...rest } = data;
    const finalSlug = await uniqueProjectSlug(slugify(slug || rest.title), id);

    await prisma.project.update({
      where: { id },
      data: {
        ...rest,
        slug: finalSlug,
        order: Number(order),
        latitude,
        longitude,
      },
    });

    if (existing.coverImage && existing.coverImage !== rest.coverImage) {
      await deleteUpload(existing.coverImage);
    }

    revalidateProjects();

    return { ok: true, message: "Proje güncellendi." };
  });
}

export async function deleteProject(id: number): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();

    const existing = await prisma.project.findUnique({
      where: { id },
      select: { coverImage: true, images: { select: { url: true } } },
    });

    if (!existing) {
      return { ok: false, message: "Proje bulunamadı." };
    }

    // ProjectImage kayıtları şemadaki onDelete: Cascade ile birlikte gider;
    // diskteki dosyaları ise elle temizlememiz gerekiyor.
    await prisma.project.delete({ where: { id } });

    await deleteUpload(existing.coverImage);
    for (const image of existing.images) {
      await deleteUpload(image.url);
    }

    revalidateProjects();

    return { ok: true, message: "Proje silindi." };
  });
}

// ------------------------------------------------------------------ Galeri

export async function addProjectImage(
  projectId: number,
  url: unknown
): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();

    // Galeri yolu da doğrulanır — form alanı olmasa bile action açık uçtur.
    const parsed = uploadPath.safeParse(url);

    if (!parsed.success || !parsed.data) {
      return { ok: false, message: "Görsel yolu geçersiz." };
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      return { ok: false, message: "Proje bulunamadı." };
    }

    // Yeni görsel listenin sonuna eklenir.
    const last = await prisma.projectImage.findFirst({
      where: { projectId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    await prisma.projectImage.create({
      data: {
        projectId,
        url: parsed.data,
        order: (last?.order ?? -1) + 1,
      },
    });

    revalidateProjects();

    return { ok: true, message: "Görsel galeriye eklendi." };
  });
}

export async function deleteProjectImage(
  imageId: number
): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();

    const image = await prisma.projectImage.findUnique({
      where: { id: imageId },
      select: { url: true },
    });

    if (!image) {
      return { ok: false, message: "Görsel bulunamadı." };
    }

    await prisma.projectImage.delete({ where: { id: imageId } });
    await deleteUpload(image.url);

    revalidateProjects();

    return { ok: true, message: "Görsel silindi." };
  });
}
