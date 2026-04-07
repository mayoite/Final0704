import type { SupabaseClient } from "@supabase/supabase-js";

import {
  normalizePlannerDocument,
  plannerDocumentSchema,
  plannerDocumentToSaveRow,
  plannerSaveRowSchema,
  plannerSaveRowToDocument,
  plannerSaveSummarySchema,
  type PlannerDocument,
  type PlannerSaveSummary,
} from "../model";

export class PlannerStorageError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "planner:no-auth"
      | "planner:save-failed"
      | "planner:load-failed"
      | "planner:list-failed"
      | "planner:delete-failed",
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "PlannerStorageError";
  }
}

export type PlannerRepositoryAccessMode = "owner" | "admin";

async function resolveUserId(client: SupabaseClient, userId?: string): Promise<string> {
  if (userId?.trim()) return userId.trim();

  const { data, error } = await client.auth.getUser();
  const resolved = data.user?.id?.trim();
  if (error || !resolved) {
    throw new PlannerStorageError(
      "Planner saves require an authenticated user.",
      "planner:no-auth",
      error ?? undefined,
    );
  }

  return resolved;
}

function normalizePlannerSaveListRow(row: unknown): PlannerSaveSummary {
  return plannerSaveSummarySchema.parse(row);
}

function normalizeRepositoryAccessMode(accessMode?: PlannerRepositoryAccessMode): PlannerRepositoryAccessMode {
  return accessMode === "admin" ? "admin" : "owner";
}

function applyPlannerSaveReadScope<Query extends { eq: (column: string, value: string) => Query }>(
  query: Query,
  accessMode: PlannerRepositoryAccessMode,
  authUserId: string,
  ownerUserId?: string,
) {
  if (accessMode === "admin" && !ownerUserId?.trim()) {
    return query;
  }

  return query.eq("user_id", ownerUserId?.trim() || authUserId);
}

async function resolvePlannerSaveOwnerUserId(
  client: SupabaseClient,
  options: PlannerSaveDocumentOptions,
  authUserId: string,
): Promise<string> {
  if (options.ownerUserId?.trim()) {
    return options.ownerUserId.trim();
  }

  if (normalizeRepositoryAccessMode(options.accessMode) !== "admin" || !options.saveId?.trim()) {
    return authUserId;
  }

  const { data, error } = await client
    .from("planner_saves")
    .select("user_id")
    .eq("id", options.saveId.trim())
    .maybeSingle();

  if (error) {
    throw new PlannerStorageError(
      `Unable to resolve planner document owner: ${error.message}`,
      "planner:save-failed",
      error,
    );
  }

  const ownerUserId = typeof data?.user_id === "string" && data.user_id.trim().length > 0 ? data.user_id.trim() : null;
  return ownerUserId ?? authUserId;
}

export interface PlannerSaveDocumentOptions {
  userId?: string;
  saveId?: string;
  ownerUserId?: string;
  accessMode?: PlannerRepositoryAccessMode;
}

export interface PlannerListDocumentsOptions {
  userId?: string;
  ownerUserId?: string;
  accessMode?: PlannerRepositoryAccessMode;
}

export async function savePlannerDocumentToSupabase(
  client: SupabaseClient,
  document: PlannerDocument,
  options: PlannerSaveDocumentOptions = {},
): Promise<PlannerDocument> {
  const authUserId = await resolveUserId(client, options.userId);
  const ownerUserId = await resolvePlannerSaveOwnerUserId(client, options, authUserId);
  const normalized = plannerDocumentSchema.parse(normalizePlannerDocument(document));
  const payload = plannerDocumentToSaveRow(normalized, {
    userId: ownerUserId,
    id: options.saveId ?? normalized.id ?? crypto.randomUUID(),
  });

  const { data, error } = await client
    .from("planner_saves")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error || !data) {
    throw new PlannerStorageError(
      `Unable to save planner document: ${error?.message ?? "Unknown error"}`,
      "planner:save-failed",
      error ?? undefined,
    );
  }

  return plannerSaveRowToDocument(plannerSaveRowSchema.parse(data));
}

export async function loadPlannerDocumentFromSupabase(
  client: SupabaseClient,
  saveId: string,
  options: PlannerListDocumentsOptions = {},
): Promise<PlannerDocument | null> {
  const authUserId = await resolveUserId(client, options.userId);
  const accessMode = normalizeRepositoryAccessMode(options.accessMode);

  const { data, error } = await applyPlannerSaveReadScope(
    client
    .from("planner_saves")
    .select("*")
    .eq("id", saveId),
    accessMode,
    authUserId,
    options.ownerUserId,
  )
    .maybeSingle();

  if (error) {
    throw new PlannerStorageError(
      `Unable to load planner document: ${error.message}`,
      "planner:load-failed",
      error,
    );
  }

  if (!data) return null;
  return plannerSaveRowToDocument(plannerSaveRowSchema.parse(data));
}

export async function listPlannerDocumentsFromSupabase(
  client: SupabaseClient,
  options: PlannerListDocumentsOptions = {},
): Promise<PlannerSaveSummary[]> {
  const authUserId = await resolveUserId(client, options.userId);
  const accessMode = normalizeRepositoryAccessMode(options.accessMode);

  const { data, error } = await applyPlannerSaveReadScope(
    client
    .from("planner_saves")
    .select("*")
    .order("updated_at", { ascending: false }),
    accessMode,
    authUserId,
    options.ownerUserId,
  );

  if (error) {
    throw new PlannerStorageError(
      `Unable to list planner documents: ${error.message}`,
      "planner:list-failed",
      error,
    );
  }

  return (data ?? []).map((row) => normalizePlannerSaveListRow(row));
}

export async function deletePlannerDocumentFromSupabase(
  client: SupabaseClient,
  saveId: string,
  options: PlannerListDocumentsOptions = {},
): Promise<boolean> {
  if (normalizeRepositoryAccessMode(options.accessMode) === "admin") {
    throw new PlannerStorageError(
      "Admin delete is not supported from the browser planner repository path.",
      "planner:delete-failed",
    );
  }

  const userId = await resolveUserId(client, options.userId);

  const { data, error } = await client
    .from("planner_saves")
    .delete()
    .eq("id", saveId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new PlannerStorageError(
      `Unable to delete planner document: ${error.message}`,
      "planner:delete-failed",
      error,
    );
  }

  return Boolean(data?.id);
}
