"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./theme-toggle";
import type { Theme } from "@/lib/theme";

type AdminTopbarProps = {
  userName: string | null | undefined;
  theme: Theme;
};

export function AdminTopbar({ userName, theme }: AdminTopbarProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />

      <div className="flex-1 truncate text-sm text-muted-foreground">
        {userName ? (
          <>
            <span className="hidden sm:inline">Oturum: </span>
            <span className="text-foreground">{userName}</span>
          </>
        ) : null}
      </div>

      <ThemeToggle initialTheme={theme} />

      <Button
        variant="ghost"
        size="sm"
        disabled={isSigningOut}
        onClick={() => {
          setIsSigningOut(true);
          void signOut({ callbackUrl: "/login" });
        }}
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">
          {isSigningOut ? "Çıkılıyor..." : "Çıkış"}
        </span>
      </Button>
    </header>
  );
}
