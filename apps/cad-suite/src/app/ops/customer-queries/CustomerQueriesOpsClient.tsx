"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Save } from "lucide-react";

type QueryStatus = "new" | "in_progress" | "closed" | "spam";
type FollowUpChannel = "email" | "whatsapp" | "phone" | "none";

type CustomerQuery = {
  id: string;
  created_at: string;
  updated_at: string;
  source: string | null;
  source_path: string | null;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  preferred_contact: string | null;
  message: string;
  requirement: string | null;
  budget: string | null;
  timeline: string | null;
  status: QueryStatus;
  followup_channel: FollowUpChannel;
  followup_target: string | null;
  followup_notes: string | null;
};

type DraftById = Record<
  string,
  {
    status: QueryStatus;
    followUpChannel: FollowUpChannel;
    followUpTarget: string;
    followUpNotes: string;
  }
>;

const statusOptions: QueryStatus[] = ["new", "in_progress", "closed", "spam"];
const followUpOptions: FollowUpChannel[] = ["email", "whatsapp", "phone", "none"];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const tokenStorageKey = "customer_queries_admin_token";

export default function CustomerQueriesOpsPage() {
  const [adminTokenInput, setAdminTokenInput] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | QueryStatus>("all");
  const [items, setItems] = useState<CustomerQuery[]>([]);
  const [drafts, setDrafts] = useState<DraftById>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string>("");

  useEffect(() => {
    const saved = window.localStorage.getItem(tokenStorageKey) || "";
    if (saved) {
      setAdminToken(saved);
      setAdminTokenInput(saved);
    }
  }, []);

  const mergeDrafts = useCallback((rows: CustomerQuery[]) => {
    setDrafts((current) => {
      const next = { ...current };
      for (const row of rows) {
        if (!next[row.id]) {
          next[row.id] = {
            status: row.status,
            followUpChannel: row.followup_channel,
            followUpTarget: row.followup_target || "",
            followUpNotes: row.followup_notes || "",
          };
        }
      }
      return next;
    });
  }, []);

  const fetchItems = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (statusFilter !== "all") params.set("status", statusFilter);

      const response = await fetch(`/api/customer-queries/manage?${params.toString()}`, {
        headers: { "x-admin-token": adminToken },
        cache: "no-store",
      });
      const json = (await response.json()) as { items?: CustomerQuery[]; error?: string };
      if (!response.ok) {
        setError(json.error || "Unable to load queries.");
        setItems([]);
        return;
      }

      const rows = Array.isArray(json.items) ? json.items : [];
      setItems(rows);
      mergeDrafts(rows);
      setLastUpdatedAt(new Date().toISOString());
    } catch {
      setError("Unable to load queries.");
    } finally {
      setLoading(false);
    }
  }, [adminToken, mergeDrafts, statusFilter]);

  useEffect(() => {
    if (!adminToken) return;
    void fetchItems();
    const interval = window.setInterval(() => {
      void fetchItems();
    }, 10000);
    return () => window.clearInterval(interval);
  }, [adminToken, fetchItems]);

  const hasToken = useMemo(() => adminToken.length > 0, [adminToken]);

  async function handleSave(id: string) {
    const draft = drafts[id];
    if (!draft || !adminToken) return;

    setSavingId(id);
    setError("");
    try {
      const response = await fetch("/api/customer-queries/manage", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          id,
          status: draft.status,
          followUpChannel: draft.followUpChannel,
          followUpTarget: draft.followUpTarget,
          followUpNotes: draft.followUpNotes,
        }),
      });
      const json = (await response.json()) as { item?: CustomerQuery; error?: string };
      if (!response.ok || !json.item) {
        setError(json.error || "Unable to update query.");
        return;
      }

      setItems((current) => current.map((row) => (row.id === id ? json.item! : row)));
      setLastUpdatedAt(new Date().toISOString());
    } catch {
      setError("Unable to update query.");
    } finally {
      setSavingId("");
    }
  }

  function applyToken() {
    const token = adminTokenInput.trim();
    setAdminToken(token);
    if (token) {
      window.localStorage.setItem(tokenStorageKey, token);
    } else {
      window.localStorage.removeItem(tokenStorageKey);
      setItems([]);
    }
  }

  return (
    <section className="container py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="typ-h1 text-strong">Customer queries</h1>
          <p className="mt-2 text-sm text-muted">
            Live inbox with 10-second auto-refresh.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchItems()}
          disabled={!hasToken || loading}
          className="inline-flex items-center gap-2 rounded-md border border-muted px-3 py-2 text-sm text-body hover:bg-hover disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid gap-4 rounded-xl border border-soft bg-panel p-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="mb-2 block text-xs uppercase tracking-wide text-muted">
            Admin token
          </label>
          <input
            type="password"
            value={adminTokenInput}
            onChange={(event) => setAdminTokenInput(event.target.value)}
            placeholder="Paste CUSTOMER_QUERIES_ADMIN_TOKEN"
            className="w-full rounded-md border border-muted px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={applyToken}
            className="w-full rounded-md bg-inverse px-4 py-2 text-sm font-medium text-inverse hover:bg-inverse-soft"
          >
            Apply token
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-xs uppercase tracking-wide text-muted">Filter</label>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as "all" | QueryStatus)}
          className="rounded-md border border-muted px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted">
          {lastUpdatedAt ? `Last sync: ${formatDate(lastUpdatedAt)}` : "Not synced yet"}
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-md border border-danger bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {!hasToken ? (
        <div className="rounded-xl border border-soft bg-hover p-6 text-sm text-muted">
          Enter admin token to load queries.
        </div>
      ) : null}

      {hasToken && items.length === 0 && !loading ? (
        <div className="rounded-xl border border-soft bg-hover p-6 text-sm text-muted">
          No queries found.
        </div>
      ) : null}

      <div className="space-y-4">
        {items.map((item) => {
          const draft = drafts[item.id] || {
            status: item.status,
            followUpChannel: item.followup_channel,
            followUpTarget: item.followup_target || "",
            followUpNotes: item.followup_notes || "",
          };

          return (
            <article key={item.id} className="rounded-xl border border-soft bg-panel p-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-strong">{item.name}</h2>
                  <p className="text-xs text-muted">
                    {item.company ? `${item.company} • ` : ""}
                    {item.email || "No email"} • {item.phone || "No phone"}
                  </p>
                </div>
                <p className="text-xs text-muted">{formatDate(item.created_at)}</p>
              </div>

              <p className="mb-4 text-sm text-body">{item.message}</p>

              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
                    Status
                  </label>
                  <select
                    value={draft.status}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [item.id]: {
                          ...draft,
                          status: event.target.value as QueryStatus,
                        },
                      }))
                    }
                    className="w-full rounded-md border border-muted px-2 py-2 text-sm"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
                    Follow-up channel
                  </label>
                  <select
                    value={draft.followUpChannel}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [item.id]: {
                          ...draft,
                          followUpChannel: event.target.value as FollowUpChannel,
                        },
                      }))
                    }
                    className="w-full rounded-md border border-muted px-2 py-2 text-sm"
                  >
                    {followUpOptions.map((channel) => (
                      <option key={channel} value={channel}>
                        {channel}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
                    Follow-up target
                  </label>
                  <input
                    type="text"
                    value={draft.followUpTarget}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [item.id]: {
                          ...draft,
                          followUpTarget: event.target.value,
                        },
                      }))
                    }
                    placeholder="email / phone"
                    className="w-full rounded-md border border-muted px-2 py-2 text-sm"
                  />
                </div>
                <div className="md:flex md:items-end">
                  <button
                    type="button"
                    onClick={() => void handleSave(item.id)}
                    disabled={savingId === item.id}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-inverse hover:bg-primary/90 disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {savingId === item.id ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
                  Follow-up notes
                </label>
                <textarea
                  rows={2}
                  value={draft.followUpNotes}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [item.id]: {
                        ...draft,
                        followUpNotes: event.target.value,
                      },
                    }))
                  }
                  placeholder="Call summary, next action, etc."
                  className="w-full rounded-md border border-muted px-3 py-2 text-sm"
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}


