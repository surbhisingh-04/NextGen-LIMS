import type { UserRole } from "@/lib/types";

export const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  lab_manager: "Lab Manager",
  scientist_technician: "Technician",
  qa_qc_manager: "QA / QC Manager",
  client: "Client"
};

export const roleDashboardPaths: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  lab_manager: "/lab/dashboard",
  scientist_technician: "/technician/dashboard",
  qa_qc_manager: "/qc/dashboard",
  client: "/client/dashboard"
};

export const internalInviteRoles: UserRole[] = [
  "lab_manager",
  "scientist_technician",
  "qa_qc_manager"
];

export function normalizeUserRole(role: string | null | undefined): UserRole | null {
  if (role === "manager" || role === "labmanager") {
    return "lab_manager";
  }

  if (role === "technician" || role === "scientist" || role === "analyst") {
    return "scientist_technician";
  }

  if (role === "qa_manager" || role === "qc_manager" || role === "qa_qc") {
    return "qa_qc_manager";
  }

  if (
    role === "admin" ||
    role === "lab_manager" ||
    role === "scientist_technician" ||
    role === "qa_qc_manager" ||
    role === "client"
  ) {
    return role;
  }

  return null;
}

export function getRoleDashboardPath(role: UserRole | null | undefined) {
  return role ? roleDashboardPaths[role] : "/login";
}

const routeAccessRules: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/users", roles: ["admin"] },
  { prefix: "/lab", roles: ["lab_manager"] },
  { prefix: "/analytics", roles: ["lab_manager", "qa_qc_manager"] },
  { prefix: "/inventory", roles: ["lab_manager", "scientist_technician"] },
  { prefix: "/scheduling", roles: ["lab_manager"] },
  { prefix: "/environmental", roles: ["lab_manager", "qa_qc_manager"] },
  { prefix: "/billing", roles: ["lab_manager", "admin"] },
  { prefix: "/technician", roles: ["scientist_technician"] },
  { prefix: "/testing", roles: ["lab_manager", "scientist_technician"] },
  { prefix: "/tests", roles: ["lab_manager", "scientist_technician"] },
  { prefix: "/notebooks", roles: ["scientist_technician", "lab_manager"] },
  { prefix: "/qc", roles: ["qa_qc_manager"] },
  { prefix: "/quality", roles: ["qa_qc_manager"] },
  { prefix: "/compliance", roles: ["qa_qc_manager"] },
  { prefix: "/documents", roles: ["qa_qc_manager"] },
  { prefix: "/client", roles: ["client"] },
  { prefix: "/portal", roles: ["client"] },
  { prefix: "/account-settings", roles: ["admin", "lab_manager", "scientist_technician", "qa_qc_manager", "client"] },
  { prefix: "/data-exchange", roles: ["lab_manager", "admin"] },
  { prefix: "/methods", roles: ["lab_manager", "qa_qc_manager"] },
  { prefix: "/instruments", roles: ["lab_manager"] },
  { prefix: "/batches", roles: ["lab_manager", "qa_qc_manager"] },
  { prefix: "/stability", roles: ["lab_manager", "qa_qc_manager"] }
];

export function canRoleAccessPath(role: UserRole | null | undefined, pathname: string) {
  if (!role) {
    return false;
  }

  if (role === "admin") {
    return true;
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return true;
  }

  const matchingRule = routeAccessRules.find(
    (rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
  );

  if (!matchingRule) {
    return true;
  }

  return matchingRule.roles.includes(role);
}

export const protectedRoutePrefixes = [
  "/dashboard",
  "/admin",
  "/lab",
  "/technician",
  "/qc",
  "/client",
  "/samples",
  "/reports",
  "/notifications",
  "/portal",
  "/testing",
  "/tests",
  "/notebooks",
  "/inventory",
  "/analytics",
  "/quality",
  "/compliance",
  "/documents",
  "/workflows",
  "/batches",
  "/stability",
  "/methods",
  "/instruments",
  "/data-exchange",
  "/scheduling",
  "/environmental",
  "/billing",
  "/users",
  "/account-settings"
];

export function isProtectedRoute(pathname: string) {
  return protectedRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
