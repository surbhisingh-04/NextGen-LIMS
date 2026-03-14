import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getAuthContext } from "@/lib/auth";

export default async function PlatformLayout({
  children
}: {
  children: ReactNode;
}) {
  const authContext = await getAuthContext();

  if (!authContext.isAuthenticated) {
    redirect("/login?message=Please%20log%20in%20to%20access%20the%20platform.");
  }

  if (!authContext.role) {
    redirect("/login?error=Your%20account%20does%20not%20have%20a%20role%20assignment%20yet.");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:gap-6 lg:px-6">
      <Sidebar role={authContext.role} />
      <main className="flex-1 space-y-6">
        <div className="rounded-[28px] border border-white/60 bg-white/70 p-4 shadow-glow backdrop-blur sm:p-6">
          <Topbar
            role={authContext.role}
            fullName={authContext.fullName}
            email={authContext.email}
          />
        </div>
        <div className="rounded-[28px] border border-white/60 bg-white/55 p-4 shadow-glow backdrop-blur sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
