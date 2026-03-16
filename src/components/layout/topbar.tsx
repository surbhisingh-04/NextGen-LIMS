"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Bell, ChevronRight, LogOut, Search, UserCircle2 } from "lucide-react";

import { logoutAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getNavigationForRole } from "@/lib/navigation";
import { roleLabels } from "@/lib/rbac";
import type { UserRole } from "@/lib/types";

const sectionCopy: Record<string, { title: string; description: string }> = {
  Dashboard: {
    title: "Real-time release, quality, and compliance intelligence",
    description:
      "Coordinate sample intake, testing, inventory, and deviation management across manufacturing and life science labs."
  },
  "Sample management": {
    title: "Track submissions, intake, and sample progress",
    description:
      "Follow every sample from client request through laboratory handling, review, and final disposition."
  },
  "Workflow automation": {
    title: "Control how work moves across the lab",
    description:
      "Assign ownership, manage review stages, and keep operational handoffs visible for every role."
  },
  "Data entry": {
    title: "Capture validated execution data",
    description:
      "Run assigned tests, enter results cleanly, and route outcomes into the QA/QC decision flow."
  },
  Inventory: {
    title: "Maintain reagent, standard, and stock readiness",
    description:
      "Monitor quantities, update reorder thresholds, and reduce release delays caused by material gaps."
  },
  "Quality review": {
    title: "Review results and manage quality decisions",
    description:
      "Approve or reject outcomes, track deviations, and keep client-facing quality updates aligned with the review state."
  },
  Reporting: {
    title: "Generate, review, and release reports",
    description:
      "Move reports from draft to final release with clear ownership and client-ready distribution."
  },
  Account: {
    title: "Manage account preferences and access",
    description:
      "Update password, notification preferences, and client-facing account details from one workspace."
  }
};

export function Topbar({
  role,
  fullName,
  email
}: {
  role: UserRole | null;
  fullName: string | null;
  email: string | null;
}) {
  const pathname = usePathname();
  const platformNav = getNavigationForRole(role);
  const activeSection =
    platformNav.find(
      (section) =>
        pathname === section.href ||
        pathname.startsWith(`${section.href}/`) ||
        section.children.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`))
    ) ?? platformNav[0];

  const activeChild = activeSection.children.find(
    (child) => pathname === child.href || pathname.startsWith(`${child.href}/`)
  );
  const copy = sectionCopy[activeSection.label] ?? sectionCopy.Dashboard;
  const profileName = fullName ?? "Signed-in user";
  const profileEmail = email ?? "Supabase session active";
  const profileInitial = profileName.charAt(0).toUpperCase();
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <Badge>{role ? `${roleLabels[role]} access` : "Multi-site laboratory operations"}</Badge>
          <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {copy.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            <span>{activeSection.label}</span>
            {activeChild ? <ChevronRight className="h-3.5 w-3.5" /> : null}
            {activeChild ? <span>{activeChild.label}</span> : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:min-w-[360px] xl:max-w-[420px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="w-full bg-white/80 pl-10" placeholder="Search samples, lots, methods" />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex items-center gap-2">
              <Link
                aria-label="View notifications"
                className="rounded-full border border-border bg-white/70 p-3 text-slate-600 transition hover:bg-white"
                href="/notifications"
              >
                <Bell className="h-4 w-4" />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Open profile menu"
                    className="flex items-center gap-3 rounded-full border border-border bg-white/80 px-3 py-2 text-left text-slate-700 transition hover:bg-white"
                    type="button"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                      {profileInitial}
                    </span>
                    <span className="hidden min-w-0 sm:block">
                      <span className="block max-w-[130px] truncate text-sm font-medium">{profileName}</span>
                      <span className="block max-w-[130px] truncate text-xs text-slate-500">
                        {role ? roleLabels[role] : "User"}
                      </span>
                    </span>
                    <UserCircle2 className="h-4 w-4 text-slate-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel className="space-y-1">
                    <div className="text-sm font-semibold text-slate-900">{profileName}</div>
                    <div className="text-xs font-normal text-slate-500">{profileEmail}</div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                      {role ? roleLabels[role] : "User"} profile
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account-settings">Account settings</Link>
                  </DropdownMenuItem>
                  <form action={logoutAction}>
                    <button
                      className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                      type="submit"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
