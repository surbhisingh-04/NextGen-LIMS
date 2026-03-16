import { registerSampleAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { UserRole } from "@/lib/types";

type RegisterSampleFormProps = {
  role: UserRole;
};

export function RegisterSampleForm({ role }: RegisterSampleFormProps) {
  const isClient = role === "client";

  return (
    <Card className="bg-slate-950 text-white">
      <CardHeader>
        <CardTitle>{isClient ? "Submit Sample Request" : "Register Sample"}</CardTitle>
        <CardDescription className="text-slate-300">
          {isClient
            ? "Send a new sample into the portal for lab intake, tracking, and report delivery."
            : "Capture intake data and launch the correct test workflow."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={registerSampleAction} className="grid gap-4 md:grid-cols-2">
          {!isClient ? (
            <Input
              name="sampleCode"
              placeholder="Sample code"
              className="border-white/10 bg-white/10 text-white placeholder:text-slate-400"
              required
            />
          ) : null}
          <Input name="materialName" placeholder="Material name" className="border-white/10 bg-white/10 text-white placeholder:text-slate-400" />
          <Input name="batchNumber" placeholder="Batch / lot number" className="border-white/10 bg-white/10 text-white placeholder:text-slate-400" />
          {!isClient ? (
            <>
              <Input
                name="workflow"
                placeholder="Workflow template"
                className="border-white/10 bg-white/10 text-white placeholder:text-slate-400"
                required
              />
              <Input
                name="lab"
                placeholder="Assigned laboratory"
                className="border-white/10 bg-white/10 text-white placeholder:text-slate-400"
                required
              />
            </>
          ) : null}
          <select
            name="priority"
            defaultValue="medium"
            className="h-10 rounded-md border border-white/10 bg-white/10 px-3 text-sm text-white outline-none"
            required
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
            <option value="critical">Critical priority</option>
          </select>
          <Input
            name="dueAt"
            type="date"
            className="border-white/10 bg-white/10 text-white placeholder:text-slate-400"
          />
          {isClient ? (
            <div className="md:col-span-2">
              <textarea
                name="notes"
                placeholder="Notes for the lab team, sample condition, or special instructions"
                className="min-h-28 w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400"
              />
            </div>
          ) : null}
          <div className="md:col-span-2">
            <Button type="submit" className="bg-teal-400 text-slate-950 hover:bg-teal-300">
              {isClient ? "Submit sample" : "Create intake record"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
