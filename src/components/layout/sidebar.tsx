"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Users } from "lucide-react";

import { getNavigationForRole } from "@/lib/navigation";
import { roleLabels } from "@/lib/rbac";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Sidebar({ role }: { role: UserRole | null }) {
  const pathname = usePathname();
  const platformNav = getNavigationForRole(role);

  function isSectionActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 overflow-hidden rounded-[32px] border border-white/60 bg-slate-950 px-4 py-5 text-slate-50 shadow-glow lg:flex lg:flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-teal-400/20 p-3 text-teal-300">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <div className="font-display text-lg font-semibold">NextGen LIMS</div>
          <div className="text-sm text-slate-300">
            {role ? `${roleLabels[role]} workspace` : "Cloud-native QA operations"}
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto pr-1">
        {platformNav.map((section) => (
          <div key={section.href} className="space-y-1.5">
            <Link
              href={section.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                isSectionActive(section.href)
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              )}
            >
              <section.icon
                className={cn(
                  "h-4 w-4",
                  isSectionActive(section.href) ? "text-teal-700" : "text-current"
                )}
              />
              {section.label}
            </Link>
          </div>
        ))}
      </nav>

      <div className="mt-4 rounded-[24px] bg-white/10 p-5">
        <div className="text-sm font-semibold text-white">
          {role ? `${roleLabels[role]} focus` : "Compliance posture"}
        </div>
        <div className="mt-2 font-display text-3xl font-semibold">98%</div>
        <p className="mt-2 text-sm text-slate-300">
          Audit trails, e-signatures, and review queues are operating within target.
        </p>
      </div>
    </aside>
  );
}
