import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTheme } from "@/lib/theme-server";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s | Yönetim Paneli" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Middleware zaten koruyor; bu ikinci kontrol savunma derinliği içindir.
  // Middleware matcher'ı yanlışlıkla değişirse panel yine de açılmaz.
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const theme = await getTheme();

  return (
    // Sidebar daraltıldığında menü butonları Tooltip kullanır;
    // bu sarmalayıcı olmadan panel render sırasında patlar.
    <TooltipProvider delayDuration={200}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AdminTopbar userName={session.user.name} theme={theme} />
          <div className="flex-1 p-6 md:p-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
