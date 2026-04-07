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

export interface PlannerSaveDocumentOptions {
  userId?: string;
  saveId?: string;
}

export interface PlannerListDocumentsOptions {
  userId?: string;
}

export async function savePlannerDocumentToSupabase(
  client: SupabaseClient,
  document: PlannerDocument,
  options: PlannerSaveDocumentOptions = {},
): Promise<PlannerDocument> {
  const userId = await resolveUserId(client, options.userId);
  const normalized = plannerDocumentSchema.parse(normalizePlannerDocument(document));
  const payload = plannerDocumentToSaveRow(normalized, {
    userId,
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
  const userId = await resolveUserId(client, options.userId);

  const { data, error } = await client
    .from("planner_saves")
    .select("*")
    .eq("id", saveId)
    .eq("user_id", userId)
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
  const userId = await resolveUserId(client, options.userId);

  const { data, error } = await client
    .from("planner_saves")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

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
