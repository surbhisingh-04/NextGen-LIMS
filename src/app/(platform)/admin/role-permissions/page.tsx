import { ModulePage } from "@/components/dashboard/module-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const roleDocs = [
  {
    role: "Admin",
    summary: "Full system access including user creation, workflow configuration, audit logs, integrations, and system settings.",
    permissions: ["Create users", "Manage roles", "Configure workflows", "Access audit logs"],
    restrictions: []
  },
  {
    role: "Lab Manager",
    summary: "Operational oversight across sample pipelines, technician assignments, inventory, and lab performance.",
    permissions: ["Assign tests", "Monitor workflows", "Manage inventory", "View analytics"],
    restrictions: ["Cannot change system settings"]
  },
  {
    role: "Technician",
    summary: "Execution-focused access for assigned samples, tests, result entry, and electronic lab notebook work.",
    permissions: ["View assigned samples", "Perform tests", "Enter results"],
    restrictions: ["Cannot approve results", "Cannot manage users", "Cannot change workflows"]
  },
  {
    role: "QA / QC Manager",
    summary: "Quality review access for pending results, QC samples, control charts, and deviation management.",
    permissions: ["Review test results", "Approve or reject results", "Create deviation reports"],
    restrictions: ["Cannot modify raw test data", "Cannot manage users"]
  },
  {
    role: "Client",
    summary: "External portal access for sample submission, sample tracking, reports, notifications, and account settings.",
    permissions: ["Submit samples", "View own samples", "Download reports", "Manage account details"],
    restrictions: ["Cannot view internal operations", "Cannot access other client data"]
  }
];

export default function RolePermissionsPage() {
  return (
    <ModulePage
      eyebrow="Role permissions"
      title="Define who can do what"
      description="Document role-specific capabilities and enforce least privilege by default."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roleDocs.map((role) => (
          <Card className="bg-white/80" key={role.role}>
            <CardHeader>
              <CardTitle>{role.role}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{role.summary}</p>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Allowed</div>
                <div className="mt-2 space-y-1 text-sm text-slate-700">
                  {role.permissions.map((permission) => (
                    <p key={permission}>{"\u2714"} {permission}</p>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Restricted</div>
                <div className="mt-2 space-y-1 text-sm text-slate-700">
                  {role.restrictions.length > 0 ? (
                    role.restrictions.map((restriction) => (
                      <p key={restriction}>{"\u2716"} {restriction}</p>
                    ))
                  ) : (
                    <p>No additional restrictions beyond platform governance.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ModulePage>
  );
}
