import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ModulePage } from "@/components/dashboard/module-page";

export default function AddItemPage() {
  return (
    <ModulePage
      eyebrow="Inventory intake"
      title="Add a new reagent or consumable"
      description="Capture SKU, lot, storage, and expiry metadata before admitting materials into the lab."
    >
      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle>New inventory form</CardTitle>
          <CardDescription>Include lot, location, and reorder thresholds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="SKU" />
          <Input placeholder="Name" />
          <Input placeholder="Quantity" type="number" />
          <div className="flex justify-end">
            <Button>Add item</Button>
          </div>
        </CardContent>
      </Card>
    </ModulePage>
  );
}
