import { createClient } from "@/lib/supabase/server"

type CustomerQuery = {
  id: string
  created_at: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  message: string
  requirement: string | null
  budget: string | null
  timeline: string | null
  status: "new" | "in_progress" | "closed" | "spam"
  source: string
}

const STATUS_BADGE: Record<CustomerQuery["status"], string> = {
  new: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  in_progress: "bg-amber-500/10 text-warning",
  closed: "bg-green-500/10 text-green-400",
  spam: "bg-danger-soft text-danger",
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default async function ContactsPage() {
  const supabase = await createClient()

  const { data: queries, error } = await supabase
    .from("customer_queries")
    .select(
      "id, created_at, name, company, email, phone, message, requirement, budget, timeline, status, source"
    )
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<CustomerQuery[]>()

  const count = queries?.length ?? 0

  return (
    <div className="px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-inverse">Contact Submissions</h1>
        <p className="mt-1 text-sm text-inverse-muted">
          {error
            ? "Error loading queries"
            : `${count} recent submission${count !== 1 ? "s" : ""}${count === 100 ? " (limited to 100)" : ""}`}
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-xl border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {error.message}
        </div>
      )}

      {/* Empty state */}
      {!error && count === 0 && (
        <div className="rounded-xl border border-theme-inverse surface-canvas-soft px-6 py-16 text-center">
          <p className="text-sm text-inverse-muted">No submissions yet.</p>
        </div>
      )}

      {/* Table */}
      {!error && count > 0 && (
        <div className="overflow-hidden rounded-2xl border border-theme-inverse surface-canvas-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-theme-inverse surface-overlay-08">
                  {["Date", "Name", "Email / Phone", "Message", "Status"].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-inverse-subtle"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queries!.map((q, i) => (
                  <tr
                    key={q.id}
                    className={`border-b border-theme-inverse transition last:border-b-0 hover-surface-08 ${
                      i % 2 !== 0 ? "bg-canvas/20" : ""
                    }`}
                  >
                    {/* Date */}
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-inverse-muted">
                      {formatDate(q.created_at)}
                    </td>

                    {/* Name + company */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-inverse">{q.name}</p>
                      {q.company && (
                        <p className="text-xs text-inverse-muted">{q.company}</p>
                      )}
                    </td>

                    {/* Contact details */}
                    <td className="px-4 py-3 text-xs text-inverse-muted">
                      {q.email && <p>{q.email}</p>}
                      {q.phone && <p>{q.phone}</p>}
                    </td>

                    {/* Message + requirement */}
                    <td className="max-w-xs px-4 py-3">
                      <p className="line-clamp-2 text-xs text-inverse-muted">{q.message}</p>
                      {q.requirement && (
                        <p className="mt-0.5 typ-caption text-inverse-subtle">
                          Req: {q.requirement}
                        </p>
                      )}
                      {q.budget && (
                        <p className="mt-0.5 typ-caption text-inverse-subtle">
                          Budget: {q.budget}
                        </p>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 typ-caption font-semibold uppercase tracking-wide ${
                          STATUS_BADGE[q.status] ??
                          "surface-overlay-08 text-inverse-muted"
                        }`}
                      >
                        {q.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
