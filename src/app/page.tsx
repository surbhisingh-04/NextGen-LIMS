import Link from "next/link";
import { ActivitySquare, ArrowRight, Boxes, ShieldCheck, TestTubeDiagonal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Sample lifecycle",
    description: "Register, route, test, review, and release samples with full chain-of-custody history.",
    icon: TestTubeDiagonal
  },
  {
    title: "Inventory control",
    description: "Track reagents, standards, consumables, and cold storage risk in real time.",
    icon: Boxes
  },
  {
    title: "Quality events",
    description: "Drive deviations, OOS, CAPA, and audit trails from one operational control plane.",
    icon: ShieldCheck
  },
  {
    title: "Analytics",
    description: "Surface release readiness, throughput, and SLA bottlenecks across every lab site.",
    icon: ActivitySquare
  }
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 grid-ambient opacity-30" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10 lg:px-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-display text-2xl font-semibold">NextGen LIMS</div>
          <div className="flex flex-wrap gap-3">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-3xl animate-reveal">
            <p className="w-fit rounded-full border border-border bg-white/80 px-4 py-2 text-sm text-slate-600">
              SaaS LIMS for GMP manufacturing and life science laboratories
            </p>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-tight text-slate-950 md:text-7xl">
              Release faster without compromising traceability, quality, or compliance.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600">
              A modern cloud-native LIMS built on Next.js and Supabase for sample management, testing, inventory, deviations, audit readiness, and real-time laboratory analytics.
            </p>
            <p className="mt-4 max-w-2xl text-sm text-slate-500">
              One login page supports every user. Supabase validates email and password, then the platform loads the correct workspace for Admin, Lab Manager, Technician, QA/QC, or Client.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-slate-950 text-white hover:bg-slate-800">
                  Client Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  User Login
                </Button>
              </Link>
              <a href="#capabilities">
                <Button size="lg" variant="outline">
                  Explore Capabilities
                </Button>
              </a>
            </div>
          </div>

          <Card className="animate-float bg-slate-950 text-white">
            <CardContent className="p-8">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <div className="text-sm uppercase tracking-[0.22em] text-slate-300">
                  Laboratory command center
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white/10 p-5">
                    <div className="text-sm text-slate-300">Throughput</div>
                    <div className="mt-2 font-display text-4xl">1.2k</div>
                    <div className="text-sm text-emerald-300">samples this week</div>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-5">
                    <div className="text-sm text-slate-300">Release SLA</div>
                    <div className="mt-2 font-display text-4xl">97.8%</div>
                    <div className="text-sm text-emerald-300">on-time approval</div>
                  </div>
                </div>
                <div className="mt-4 rounded-3xl bg-gradient-to-r from-teal-400/25 to-amber-300/25 p-5">
                  <div className="text-sm text-slate-200">Connected modules</div>
                  <div className="mt-3 text-lg font-medium">
                    Samples, workflows, tests, inventory, quality, and compliance reporting.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="capabilities" className="grid gap-5 pb-12 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="animate-reveal bg-white/80"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <CardContent className="p-6">
                  <div className="w-fit rounded-2xl bg-teal-100 p-3 text-teal-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 font-display text-2xl font-semibold">{feature.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}
