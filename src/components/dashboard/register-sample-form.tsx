import { registerSampleAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function RegisterSampleForm() {
  return (
    <Card className="bg-slate-950 text-white">
      <CardHeader>
        <CardTitle>Register Sample</CardTitle>
        <CardDescription className="text-slate-300">
          Capture intake data and launch the correct test workflow.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={registerSampleAction} className="grid gap-4 md:grid-cols-2">
          <Input name="sampleCode" placeholder="Sample code" className="border-white/10 bg-white/10 text-white placeholder:text-slate-400" />
          <Input name="materialName" placeholder="Material name" className="border-white/10 bg-white/10 text-white placeholder:text-slate-400" />
          <Input name="batchNumber" placeholder="Batch / lot number" className="border-white/10 bg-white/10 text-white placeholder:text-slate-400" />
          <Input name="workflow" placeholder="Workflow template" className="border-white/10 bg-white/10 text-white placeholder:text-slate-400" />
          <Input name="lab" placeholder="Assigned laboratory" className="border-white/10 bg-white/10 text-white placeholder:text-slate-400" />
          <Input name="priority" placeholder="Priority: low, medium, high, critical" className="border-white/10 bg-white/10 text-white placeholder:text-slate-400" />
          <div className="md:col-span-2">
            <Button type="submit" className="bg-teal-400 text-slate-950 hover:bg-teal-300">
              Create intake record
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
