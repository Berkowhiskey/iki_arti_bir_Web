"use client";

import { DeleteDialog } from "@/components/admin/delete-dialog";
import { deleteProject } from "./actions";

/** Silme kapanışını istemcide kurar — gerekçesi team-row-actions.tsx'te. */
export function ProjectRowActions({
  id,
  title,
}: {
  id: number;
  title: string;
}) {
  return (
    <DeleteDialog
      itemName={title}
      description="Bu işlem geri alınamaz. Proje, kapak görseli ve galerisindeki tüm görseller kalıcı olarak silinir."
      onConfirm={() => deleteProject(id)}
    />
  );
}
