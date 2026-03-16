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
    children: [
      { href: "/samples/sample-list", label: "Sample list" },
      { href: "/samples/sample-submission", label: "Submit sample", allowedRoles: ["client", "admin", "lab_manager", "scientist_technician"] },
      { href: "/portal", label: "Client portal", allowedRoles: ["client"] }
    ]
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
    children: [
      { href: "/testing/test-management", label: "Test management", allowedRoles: ["admin", "lab_manager"] },
      { href: "/testing/result-entry", label: "Result entry", allowedRoles: ["admin", "lab_manager", "scientist_technician"] }
    ]
  },
  {
    href: "/inventory",
    label: "Inventory",
    icon: Boxes,
    allowedRoles: ["admin", "lab_manager", "scientist_technician"],
    children: [
      { href: "/inventory/inventory-list", label: "Inventory list" },
      { href: "/inventory/add-item", label: "Add item", allowedRoles: ["admin", "lab_manager"] },
      { href: "/inventory/stock-alerts", label: "Stock alerts" }
    ]
  },
  {
    href: "/quality",
    label: "Quality review",
    icon: ShieldCheck,
    allowedRoles: ["admin", "qa_qc_manager", "lab_manager"],
    children: [
      { href: "/qc/dashboard", label: "QA dashboard", allowedRoles: ["qa_qc_manager", "admin"] },
      { href: "/qc/qc-monitoring", label: "QC monitoring", allowedRoles: ["qa_qc_manager", "admin"] },
      { href: "/quality", label: "Quality events", allowedRoles: ["qa_qc_manager", "admin", "lab_manager"] }
    ]
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
    children: [
      { href: "/reports/report-generator", label: "Generate report", allowedRoles: ["admin", "lab_manager", "scientist_technician"] },
      { href: "/reports/report-history", label: "Report history" }
    ]
  },
  {
    href: "/admin",
    label: "User management",
    icon: ShieldCheck,
    allowedRoles: ["admin"],
    children: [
      { href: "/admin/user-management", label: "User management" },
      { href: "/admin/role-permissions", label: "Role permissions" },
      { href: "/admin/audit-logs", label: "Audit logs" },
      { href: "/admin/backup-recovery", label: "Backup recovery" }
    ]
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
      children: section.children.filter(
        (child) => !child.allowedRoles || (role ? child.allowedRoles.includes(role) : false)
      )
    }));
}

export const publicNav = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Signup" }
];
