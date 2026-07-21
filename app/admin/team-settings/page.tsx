import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, UserRound } from "lucide-react";
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
import { DISCIPLINE_LABELS } from "@/lib/labels";
import { TeamRowActions } from "./team-row-actions";

export const metadata: Metadata = { title: "Ekip" };
export const dynamic = "force-dynamic";

export default async function TeamSettingsPage() {
  const members = await prisma.teamMember.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Ekip</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ana sayfadaki ekip bölümünü yönetin.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/team-settings/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Yeni üye
          </Link>
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Henüz ekip üyesi eklenmemiş.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Foto</TableHead>
                <TableHead>İsim</TableHead>
                <TableHead>Unvan</TableHead>
                <TableHead>Disiplin</TableHead>
                <TableHead className="w-16 text-center">Sıra</TableHead>
                <TableHead className="w-24">Durum</TableHead>
                <TableHead className="w-24 text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                      {member.imageUrl ? (
                        <Image
                          src={member.imageUrl}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <UserRound
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {DISCIPLINE_LABELS[member.discipline]}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {member.order}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.isActive ? "secondary" : "outline"}>
                      {member.isActive ? "Görünür" : "Gizli"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link
                          href={`/admin/team-settings/${member.id}`}
                          aria-label={`${member.name} kaydını düzenle`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                      <TeamRowActions id={member.id} name={member.name} />
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
