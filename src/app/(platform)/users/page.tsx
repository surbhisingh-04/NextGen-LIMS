import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ModuleLinkGrid } from "@/components/dashboard/module-link-grid";
import { ModulePage } from "@/components/dashboard/module-page";
import { UsersTable } from "@/components/dashboard/tables";
import { users } from "@/lib/demo-data";

const userModules = [
  {
    title: "User management",
    description: "Provision, activate, and review access for users.",
    href: "/admin/user-management"
  },
  {
    title: "Role permissions",
    description: "Inspect role-based permissions and governance scope.",
    href: "/admin/role-permissions"
  }
];

export default function UsersPage() {
  return (
    <ModulePage
      eyebrow="Users"
      title="Directory and access overview"
      description="This route provides a stable landing page for user-related navigation and mirrors the admin access view."
    >
      <ModuleLinkGrid items={userModules} />
      <DataTableCard title="User directory" description="Current users, roles, and authentication methods">
        <UsersTable rows={users} />
      </DataTableCard>
    </ModulePage>
  );
}
