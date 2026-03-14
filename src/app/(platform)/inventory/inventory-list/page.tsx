import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModulePage } from "@/components/dashboard/module-page";
import { InventoryTable } from "@/components/dashboard/tables";
import { inventoryItems } from "@/lib/demo-data";

export default function InventoryListPage() {
  return (
    <ModulePage
      eyebrow="Inventory visibility"
      title="Track lots, expiry, and location"
      description="Understand stock standing for reference standards, reagents, and media."
    >
      <DataTableCard title="Warehouse inventory" description="Current SKU statuses and expiry risk">
        <InventoryTable rows={inventoryItems} />
      </DataTableCard>
    </ModulePage>
  );
}
