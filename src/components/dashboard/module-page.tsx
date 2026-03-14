import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export function ModulePage({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Badge>{eyebrow}</Badge>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>
      </div>
      {children}
    </div>
  );
}
