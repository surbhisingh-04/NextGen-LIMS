import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { KnowledgeGraphTable } from "@/components/dashboard/tables";
import { knowledgeGraphRelations } from "@/lib/demo-data";

const graphHighlights = [
  "Sample-to-method traceability for faster root-cause discovery",
  "Result-to-regulation context for compliance-aware review",
  "Instrument and study dependency mapping for richer data discovery"
];

export default function KnowledgeGraphPage() {
  return (
    <ModulePage
      eyebrow="Innovative feature"
      title="Knowledge graph for semantic discovery across samples, tests, results, and regulations"
      description="This is the second and final innovative module retained by request. It turns relationships between operational entities into a discoverable graph for review, investigation, and compliance context."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {graphHighlights.map((item) => (
          <div key={item} className="rounded-[28px] border border-border bg-white/80 p-5">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Graph insight</div>
            <div className="mt-3 text-lg font-semibold text-slate-900">{item}</div>
          </div>
        ))}
      </div>
      <DataTableCard title="Semantic relationships" description="Examples of graph edges linking operational and regulatory entities">
        <KnowledgeGraphTable rows={knowledgeGraphRelations} />
      </DataTableCard>
    </ModulePage>
  );
}
