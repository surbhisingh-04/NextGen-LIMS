import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth";

export default async function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  const authContext = await getAuthContext();

  if (!authContext.isAuthenticated) {
    redirect("/login?message=Please%20log%20in%20to%20access%20admin%20tools.");
  }

  if (authContext.role !== "admin") {
    redirect("/dashboard?message=Admin%20access%20required.");
  }

  return <>{children}</>;
}
