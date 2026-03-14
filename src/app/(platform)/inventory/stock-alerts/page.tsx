import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModulePage } from "@/components/dashboard/module-page";
import { inventoryItems } from "@/lib/demo-data";

export default function StockAlertsPage() {
  const alerts = inventoryItems.filter((item) => item.quantity <= item.reorderLevel);

  return (
    <ModulePage
      eyebrow="Stock alerts"
      title="Monitor low-on-hand materials"
      description="Get immediate visibility when reagents or consumables dip below reorder thresholds."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {alerts.map((item) => (
          <Card className="bg-white/80" key={item.id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Quantity</span>
                <span>{item.quantity}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Reorder level</span>
                <span>{item.reorderLevel}</span>
              </div>
              <Badge className="bg-amber-100 text-amber-800">Reorder required</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </ModulePage>
  );
}
