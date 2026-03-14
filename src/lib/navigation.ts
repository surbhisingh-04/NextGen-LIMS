import {
  BarChart3,
  Boxes,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  ShieldCheck,
  TestTube2,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getRoleDashboardPath } from "@/lib/rbac";
import type { UserRole } from "@/lib/types";

export type NavChild = {
  href: string;
  label: string;
  allowedRoles?: UserRole[];
};

export type NavSection = {
  href: string;
  label: string;
  icon: LucideIcon;
  children: NavChild[];
  allowedRoles?: UserRole[];
};

const basePlatformNav: NavSection[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["admin", "lab_manager", "scientist_technician", "qa_qc_manager", "client"],
    children: []
  },
  {
    href: "/samples",
    label: "Sample management",
    icon: TestTube2,
    allowedRoles: ["admin", "lab_manager", "scientist_technician", "client"],
    children: []
  },
  {
    href: "/workflows",
    label: "Workflow automation",
    icon: ClipboardList,
    allowedRoles: ["admin", "lab_manager", "qa_qc_manager"],
    children: []
  },
  {
    href: "/testing",
    label: "Data entry",
    icon: FlaskConical,
    allowedRoles: ["admin", "lab_manager", "scientist_technician"],
    children: []
  },
  {
    href: "/instruments",
    label: "Instrument integrations",
    icon: Boxes,
    allowedRoles: ["admin"],
    children: []
  },
  {
    href: "/reports",
    label: "Reporting",
    icon: BarChart3,
    allowedRoles: ["admin", "lab_manager", "qa_qc_manager", "scientist_technician", "client"],
    children: []
  },
  {
    href: "/admin",
    label: "User management",
    icon: ShieldCheck,
    allowedRoles: ["admin"],
    children: []
  },
  {
    href: "/account-settings",
    label: "Account",
    icon: Users,
    allowedRoles: ["client"],
    children: []
  }
];

export function getNavigationForRole(role: UserRole | null) {
  return basePlatformNav
    .filter((section) => !section.allowedRoles || (role ? section.allowedRoles.includes(role) : false))
    .map((section) => ({
      ...section,
      href: section.href === "/dashboard" ? getRoleDashboardPath(role) : section.href,
      children: [] as NavChild[]
    }));
}

export const publicNav = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Signup" }
];
