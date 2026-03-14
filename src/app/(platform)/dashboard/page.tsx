import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth";
import { getRoleDashboardPath } from "@/lib/rbac";

export default async function DashboardPage() {
  const authContext = await getAuthContext();
  if (!authContext.role) {
    redirect("/login?error=Your%20account%20is%20authenticated%2C%20but%20no%20application%20role%20is%20assigned%20yet.");
  }
  redirect(getRoleDashboardPath(authContext.role));
}
