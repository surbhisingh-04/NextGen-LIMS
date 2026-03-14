import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModulePage } from "@/components/dashboard/module-page";
import { samples } from "@/lib/demo-data";

export default function SampleDetailPage() {
  const sample = samples[0];

  return (
    <ModulePage
      eyebrow="Sample detail"
      title="Deep dive on a selected assignment"
      description="Audit the chain of custody, due dates, priority, and custody path for a single sample."
    >
      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle>{sample.sampleCode}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-xs uppercase text-slate-500">Material</div>
            <div className="font-medium">{sample.materialName}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase text-slate-500">Workflow</div>
              <div>{sample.workflow}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500">Lab</div>
              <div>{sample.lab}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500">Priority</div>
              <div>{sample.priority}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500">Status</div>
              <div>{sample.status.replaceAll("_", " ")}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
            <div>
              <div className="text-xs uppercase text-slate-500">Received</div>
              <div>{new Date(sample.receivedAt).toLocaleString("en-US")}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500">Due</div>
              <div>{new Date(sample.dueAt).toLocaleString("en-US")}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500">Owner</div>
              <div>{sample.owner}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ModulePage>
  );
}
