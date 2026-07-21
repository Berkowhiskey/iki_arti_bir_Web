import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageIcon, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectRowActions } from "./project-row-actions";

export const metadata: Metadata = { title: "Projeler" };
export const dynamic = "force-dynamic";

const CATEGORY_LABEL = {
  MIMARLIK: "Mimarlık",
  MUHENDISLIK: "Mühendislik",
  IC_DIZAYN: "İç Dizayn",
} as const;

export default async function PortfolioPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { images: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Projeler</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Şantiyeler ve tamamlanan işler.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/portfolio/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Yeni proje
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Henüz proje eklenmemiş.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Kapak</TableHead>
                <TableHead>Proje</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Lokasyon</TableHead>
                <TableHead className="w-20 text-center">Galeri</TableHead>
                <TableHead className="w-24">Durum</TableHead>
                <TableHead className="w-24 text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="relative h-10 w-16 overflow-hidden rounded bg-muted">
                      {project.coverImage ? (
                        <Image
                          src={project.coverImage}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{project.title}</div>
                    <div className="text-xs text-muted-foreground">
                      /{project.slug}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {CATEGORY_LABEL[project.category]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.location}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {project._count.images}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={project.isPublished ? "secondary" : "outline"}
                    >
                      {project.isPublished ? "Yayında" : "Gizli"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link
                          href={`/admin/portfolio/${project.id}`}
                          aria-label={`${project.title} projesini düzenle`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                      <ProjectRowActions
                        id={project.id}
                        title={project.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
