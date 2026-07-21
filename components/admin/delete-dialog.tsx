"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions";

type DeleteDialogProps = {
  /** Onay metninde geçecek kayıt adı — "Ahmet Yılmaz silinecek." gibi. */
  itemName: string;
  description?: string;
  onConfirm: () => Promise<ActionResult>;
};

/**
 * Silme onayı. Kayıt silme geri alınamaz olduğu için tek tıkla değil,
 * açık onayla yapılır.
 */
export function DeleteDialog({
  itemName,
  description,
  onConfirm,
}: DeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    startTransition(async () => {
      const result = await onConfirm();

      if (!result.ok) {
        toast.error("Silinemedi", { description: result.message });
        return;
      }

      setOpen(false);
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label={`${itemName} kaydını sil`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{itemName} silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              {description ??
                "Bu işlem geri alınamaz. Kayıt ve varsa görseli kalıcı olarak silinir."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                // Dialog'un kendi kapanışını engelle; işlem bitince biz kapatırız.
                event.preventDefault();
                handleConfirm();
              }}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Siliniyor...
                </>
              ) : (
                "Sil"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
