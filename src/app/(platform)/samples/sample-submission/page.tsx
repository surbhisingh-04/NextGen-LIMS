import { ModulePage } from "@/components/dashboard/module-page";
import { RegisterSampleForm } from "@/components/dashboard/register-sample-form";
import { getAuthContext } from "@/lib/auth";

export default async function SampleSubmissionPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const authContext = await getAuthContext();
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;
  const isClient = authContext.role === "client";

  return (
    <ModulePage
      eyebrow={isClient ? "Client sample submission" : "Sample submission"}
      title={isClient ? "Submit a sample to the lab" : "Register a new sample"}
      description={
        isClient
          ? "Clients can submit a sample request here and track progress through the portal after the lab accepts intake."
          : "Capture chain-of-custody documents, due dates, and ownership before routing worklists."
      }
    >
      <div className="space-y-4">
        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}
        {authContext.role ? <RegisterSampleForm role={authContext.role} /> : null}
      </div>
    </ModulePage>
  );
}
