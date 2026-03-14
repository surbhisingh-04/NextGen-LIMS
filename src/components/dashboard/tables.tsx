import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type {
  ActivityLog,
  AutomationRule,
  BackupSnapshot,
  BatchRecord,
  BillingRecord,
  ComplianceReport,
  CustodyEvent,
  DataExchangeJob,
  DocumentRecord,
  EnvironmentalReading,
  GeneratedReport,
  InstrumentImport,
  InventoryItem,
  KnowledgeGraphRelation,
  NotebookEntry,
  NotificationItem,
  PortalRequest,
  PredictiveForecast,
  QcSample,
  QualityEvent,
  Sample,
  SampleLifecycleEvent,
  ScheduleItem,
  StabilityStudy,
  TestDefinition,
  TestMethodRecord,
  TestResult,
  UserProfile,
  WorkflowStage,
  WorkflowTask
} from "@/lib/types";

function statusTone(status: string) {
  if (["approved", "pass", "published", "closed", "released", "healthy", "completed", "paid", "normal"].includes(status)) {
    return "bg-emerald-50 text-emerald-700";
  }
  if (["critical", "fail", "rejected", "action", "overdue", "failed", "on_hold"].includes(status)) {
    return "bg-rose-50 text-rose-700";
  }
  if (["review", "investigating", "ready_for_review", "warning", "in_review", "running", "issued", "conflict"].includes(status)) {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-slate-100 text-slate-700";
}

export function SamplesTable({ rows }: { rows: Sample[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sample</TableHead>
          <TableHead>Material</TableHead>
          <TableHead>Workflow</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.sampleCode}</TableCell>
            <TableCell>{row.materialName}</TableCell>
            <TableCell>{row.workflow}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status.replaceAll("_", " ")}</Badge></TableCell>
            <TableCell>{new Date(row.dueAt).toLocaleDateString("en-US")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function WorkflowTable({ rows }: { rows: WorkflowStage[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Stage</TableHead>
          <TableHead>SLA</TableHead>
          <TableHead>Active Samples</TableHead>
          <TableHead>Automation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{row.slaHours}h</TableCell>
            <TableCell>{row.activeSamples}</TableCell>
            <TableCell>{row.automationCoverage}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TestResultsTable({ rows }: { rows: TestResult[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sample</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Analyst</TableHead>
          <TableHead>Result</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.sampleCode}</TableCell>
            <TableCell>{row.method}</TableCell>
            <TableCell>{row.analyst}</TableCell>
            <TableCell>{row.result}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function InventoryTable({ rows }: { rows: InventoryItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Lot</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Expires</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{row.category}</TableCell>
            <TableCell>{row.lotNumber}</TableCell>
            <TableCell>{row.quantity}</TableCell>
            <TableCell>{row.expiresAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function QualityTable({ rows }: { rows: QualityEvent[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Issue</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.type}</TableCell>
            <TableCell>{row.title}</TableCell>
            <TableCell>{row.owner}</TableCell>
            <TableCell><Badge className={statusTone(row.severity)}>{row.severity}</Badge></TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ComplianceTable({ rows }: { rows: ComplianceReport[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Report</TableHead>
          <TableHead>Framework</TableHead>
          <TableHead>Generated</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.title}</TableCell>
            <TableCell>{row.framework}</TableCell>
            <TableCell>{new Date(row.generatedAt).toLocaleDateString("en-US")}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
            <TableCell>{row.score}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function UsersTable({ rows }: { rows: UserProfile[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Auth Methods</TableHead>
          <TableHead>Last Active</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <div className="font-medium">{row.fullName}</div>
              <div className="text-xs text-slate-500">{row.email}</div>
            </TableCell>
            <TableCell><Badge>{row.role.replaceAll("_", " ")}</Badge></TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
            <TableCell>{row.authMethods.map((method) => (method === "password" ? "Email + Password" : method)).join(", ")}</TableCell>
            <TableCell>{new Date(row.lastActiveAt).toLocaleString("en-US")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ActivityLogTable({ rows }: { rows: ActivityLog[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Actor</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>When</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.actor}</TableCell>
            <TableCell>{row.action}</TableCell>
            <TableCell>{row.entity}</TableCell>
            <TableCell>{row.channel}</TableCell>
            <TableCell>{new Date(row.occurredAt).toLocaleString("en-US")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function SampleLifecycleTable({ rows }: { rows: SampleLifecycleEvent[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Stage</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Timestamp</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell><Badge>{row.stage.replaceAll("_", " ")}</Badge></TableCell>
            <TableCell>{row.owner}</TableCell>
            <TableCell>{new Date(row.timestamp).toLocaleString("en-US")}</TableCell>
            <TableCell>{row.notes}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function CustodyTable({ rows }: { rows: CustodyEvent[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sample</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Condition</TableHead>
          <TableHead>Handoff</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.sampleCode}</TableCell>
            <TableCell>{row.from}</TableCell>
            <TableCell>{row.to}</TableCell>
            <TableCell>{row.condition}</TableCell>
            <TableCell>{new Date(row.handoffAt).toLocaleString("en-US")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function WorkflowTaskTable({ rows }: { rows: WorkflowTask[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Workflow</TableHead>
          <TableHead>Step</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Validation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.workflow}</TableCell>
            <TableCell>{row.step}</TableCell>
            <TableCell>{row.assignee}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
            <TableCell><Badge className={statusTone(row.validationState)}>{row.validationState}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AutomationRulesTable({ rows }: { rows: AutomationRule[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rule</TableHead>
          <TableHead>Trigger</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{row.trigger}</TableCell>
            <TableCell>{row.action}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TestDefinitionsTable({ rows }: { rows: TestDefinition[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sample</TableHead>
          <TableHead>Test</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.sampleCode}</TableCell>
            <TableCell>
              <div>{row.testName}</div>
              <div className="text-xs text-slate-500">{row.validationRule}</div>
            </TableCell>
            <TableCell>{row.type.replaceAll("_", " ")}</TableCell>
            <TableCell>{row.assignee}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function InstrumentImportsTable({ rows }: { rows: InstrumentImport[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Instrument</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Mapped Samples</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.instrumentName}</TableCell>
            <TableCell>{row.method}</TableCell>
            <TableCell>{row.sourceType.toUpperCase()}</TableCell>
            <TableCell>{row.mappedSamples}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status.replaceAll("_", " ")}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function QcSamplesTable({ rows }: { rows: QcSample[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Control</TableHead>
          <TableHead>Sample</TableHead>
          <TableHead>Result</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Reviewed By</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.controlName}</TableCell>
            <TableCell>{row.sampleCode}</TableCell>
            <TableCell>{row.result}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status.replaceAll("_", " ")}</Badge></TableCell>
            <TableCell>{row.reviewedBy}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ReportsTable({ rows }: { rows: GeneratedReport[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Report</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Format</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Audience</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.title}</TableCell>
            <TableCell>{row.type.toUpperCase()}</TableCell>
            <TableCell>{row.format.toUpperCase()}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
            <TableCell>{row.audience}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function DocumentsTable({ rows }: { rows: DocumentRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{row.category.replaceAll("_", " ")}</TableCell>
            <TableCell>{row.version}</TableCell>
            <TableCell>{row.owner}</TableCell>
            <TableCell>{new Date(row.updatedAt).toLocaleDateString("en-US")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function NotificationsTable({ rows }: { rows: NotificationItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Notification</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.title}</TableCell>
            <TableCell>{row.type.replaceAll("_", " ")}</TableCell>
            <TableCell>{row.channel.replaceAll("_", " ")}</TableCell>
            <TableCell>{row.recipient}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function NotebookEntriesTable({ rows }: { rows: NotebookEntry[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sample</TableHead>
          <TableHead>Experiment</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.sampleCode}</TableCell>
            <TableCell>{row.experimentTitle}</TableCell>
            <TableCell>{row.author}</TableCell>
            <TableCell>{row.version}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function BatchRecordsTable({ rows }: { rows: BatchRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Batch</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Samples</TableHead>
          <TableHead>Genealogy</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.batchNumber}</TableCell>
            <TableCell>{row.productName}</TableCell>
            <TableCell>{row.sampleCount}</TableCell>
            <TableCell>{row.genealogy}</TableCell>
            <TableCell>
              <Badge className={statusTone(row.releaseStatus)}>{row.releaseStatus.replaceAll("_", " ")}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ScheduleTable({ rows }: { rows: ScheduleItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Resource</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Window</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.resourceName}</TableCell>
            <TableCell>{row.resourceType}</TableCell>
            <TableCell>{row.window}</TableCell>
            <TableCell>{row.owner}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function EnvironmentalReadingsTable({ rows }: { rows: EnvironmentalReading[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Location</TableHead>
          <TableHead>Parameter</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Threshold</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.location}</TableCell>
            <TableCell>{row.parameter}</TableCell>
            <TableCell>{row.value}</TableCell>
            <TableCell>{row.threshold}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TestMethodsTable({ rows }: { rows: TestMethodRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Method</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Technique</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.methodCode}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.technique}</TableCell>
            <TableCell>{row.owner}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function PortalRequestsTable({ rows }: { rows: PortalRequest[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Sample</TableHead>
          <TableHead>Request</TableHead>
          <TableHead>Requested</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.clientName}</TableCell>
            <TableCell>{row.sampleCode}</TableCell>
            <TableCell>{row.requestType.replaceAll("_", " ")}</TableCell>
            <TableCell>{new Date(row.requestedAt).toLocaleString("en-US")}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status.replaceAll("_", " ")}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function StabilityStudiesTable({ rows }: { rows: StabilityStudy[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Protocol</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Condition</TableHead>
          <TableHead>Next Pull</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.protocolCode}</TableCell>
            <TableCell>{row.productName}</TableCell>
            <TableCell>{row.storageCondition}</TableCell>
            <TableCell>{new Date(row.nextPullAt).toLocaleString("en-US")}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function BillingTable({ rows }: { rows: BillingRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Invoice</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Utilization</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.clientName}</TableCell>
            <TableCell>{row.invoiceNumber}</TableCell>
            <TableCell>{row.amount}</TableCell>
            <TableCell>{row.utilization}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function DataExchangeTable({ rows }: { rows: DataExchangeJob[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job</TableHead>
          <TableHead>Direction</TableHead>
          <TableHead>Format</TableHead>
          <TableHead>Scope</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.jobName}</TableCell>
            <TableCell>{row.direction}</TableCell>
            <TableCell>{row.format.toUpperCase()}</TableCell>
            <TableCell>{row.scope}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function BackupSnapshotsTable({ rows }: { rows: BackupSnapshot[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Environment</TableHead>
          <TableHead>Region</TableHead>
          <TableHead>Last Backup</TableHead>
          <TableHead>Recovery Target</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.environment}</TableCell>
            <TableCell>{row.region}</TableCell>
            <TableCell>{new Date(row.lastBackupAt).toLocaleString("en-US")}</TableCell>
            <TableCell>{row.recoveryObjective}</TableCell>
            <TableCell><Badge className={statusTone(row.status)}>{row.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function PredictiveForecastsTable({ rows }: { rows: PredictiveForecast[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Metric</TableHead>
          <TableHead>Current</TableHead>
          <TableHead>Forecast</TableHead>
          <TableHead>Confidence</TableHead>
          <TableHead>Recommended Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.metric}</TableCell>
            <TableCell>{row.current}</TableCell>
            <TableCell>{row.forecast}</TableCell>
            <TableCell>{row.confidence}</TableCell>
            <TableCell>{row.recommendedAction}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function KnowledgeGraphTable({ rows }: { rows: KnowledgeGraphRelation[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead>Relationship</TableHead>
          <TableHead>Target</TableHead>
          <TableHead>Context</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.source}</TableCell>
            <TableCell>{row.relationship.replaceAll("_", " ")}</TableCell>
            <TableCell>{row.target}</TableCell>
            <TableCell>{row.context}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
