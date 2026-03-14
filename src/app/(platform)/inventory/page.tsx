import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { InventoryTable } from "@/components/dashboard/tables";
import { inventoryItems } from "@/lib/demo-data";

export default function InventoryPage() {
  return (
    <ModulePage
      eyebrow="Inventory governance"
      title="Control standards, reagents, media, and consumables"
      description="Prevent stockouts, monitor expiry risk, and maintain traceability of the materials that directly affect laboratory results and batch release."
    >
      <DataTableCard
        title="Inventory watchlist"
        description="Low-stock and expiry-sensitive items across laboratory stores"
      >
        <InventoryTable rows={inventoryItems} />
      </DataTableCard>
    </ModulePage>
  );
}
