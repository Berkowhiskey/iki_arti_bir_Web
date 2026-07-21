"use client";

import { DeleteDialog } from "@/components/admin/delete-dialog";
import { deleteTeamMember } from "./actions";

/**
 * Silme düğmesini istemci tarafında sarmalar.
 *
 * Liste sayfası bir Server Component; `onConfirm={() => deleteTeamMember(id)}`
 * gibi bir kapanış (closure) sunucudan istemciye serialize edilemez. Bu ince
 * sarmalayıcı id'yi alıp kapanışı istemcide kuruyor.
 */
export function TeamRowActions({ id, name }: { id: number; name: string }) {
  return (
    <DeleteDialog itemName={name} onConfirm={() => deleteTeamMember(id)} />
  );
}
