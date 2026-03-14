import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ModuleLink = {
  title: string;
  description: string;
  href: string;
};

export function ModuleLinkGrid({ items }: { items: ModuleLink[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <Card className="h-full bg-white/85 transition hover:-translate-y-0.5 hover:shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-xl">
                {item.title}
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{item.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
