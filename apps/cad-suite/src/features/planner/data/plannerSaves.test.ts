import { beforeEach, describe, expect, it, vi } from "vitest";

import { createPlannerDocument } from "../model";
import {
  deletePlannerDocumentFromSupabase,
  listPlannerDocumentsFromSupabase,
  loadPlannerDocumentFromSupabase,
  PlannerStorageError,
  savePlannerDocumentToSupabase,
} from "./plannerSaves";

type PlannerSaveRow = Record<string, unknown>;

function buildPlannerSaveRow(overrides: Partial<PlannerSaveRow> = {}): PlannerSaveRow {
  return {
    id: "550e8400-e29b-41d4-a716-446655440010",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    name: "North Bay",
    project_name: null,
    client_name: null,
    prepared_by: null,
    room_width_mm: 6000,
    room_depth_mm: 8000,
    seat_target: 10,
    unit_system: "metric",
    scene_json: { shapes: [] },
    item_count: 0,
    thumbnail_url: null,
    created_at: "2026-04-07T00:00:00.000Z",
    updated_at: "2026-04-07T00:00:00.000Z",
    ...overrides,
  };
}

function createQueryRecorder(result: { data: unknown; error: unknown }) {
  const filters: Array<{ column: string; value: string }> = [];
  const orderCalls: Array<{ column: string; options?: unknown }> = [];
  const state = {
    filters,
    orderCalls,
    upsertPayload: undefined as unknown,
    upsertOptions: undefined as unknown,
    deleteCalled: false,
    selectCalls: [] as unknown[],
  };

  const query = {
    eq(column: string, value: string) {
      filters.push({ column, value });
      return query;
    },
    order(column: string, options?: unknown) {
      orderCalls.push({ column, options });
      return query;
    },
    upsert(payload: unknown, options?: unknown) {
      state.upsertPayload = payload;
      state.upsertOptions = options;
      return query;
    },
    delete() {
      state.deleteCalled = true;
      return query;
    },
    select(selection?: unknown) {
      state.selectCalls.push(selection);
      return query;
    },
    single: vi.fn(async () => result),
    maybeSingle: vi.fn(async () => result),
    then(onFulfilled: (value: { data: unknown; error: unknown }) => unknown) {
      return Promise.resolve(onFulfilled(result));
    },
  };

  return { query, state };
}

function createSupabaseClientMock({
  authUserId = "550e8400-e29b-41d4-a716-446655440001",
  queryResult = { data: [], error: null },
}: {
  authUserId?: string;
  queryResult?: { data: unknown; error: unknown };
} = {}) {
  const fromCalls: string[] = [];
  const queryRecorder = createQueryRecorder(queryResult);

  return {
    client: {
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: authUserId ? { id: authUserId } : null },
          error: authUserId ? null : new Error("no auth"),
        })),
      },
      from: vi.fn((table: string) => {
        fromCalls.push(table);
        return queryRecorder.query;
      }),
    },
    fromCalls,
    queryState: queryRecorder.state,
  };
}

describe("planner save repository", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps owner-scoped reads filtered by the authenticated user", async () => {
    const row = buildPlannerSaveRow();
    const { client, queryState } = createSupabaseClientMock({
      queryResult: { data: [row], error: null },
    });

    const plans = await listPlannerDocumentsFromSupabase(client as never, {});

    expect(plans).toHaveLength(1);
    expect(queryState.filters).toContainEqual({
      column: "user_id",
      value: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(queryState.orderCalls).toContainEqual({
      column: "updated_at",
      options: { ascending: false },
    });
  });

  it("lets admin list plans without forcing an owner filter", async () => {
    const row = buildPlannerSaveRow();
    const { client, queryState } = createSupabaseClientMock({
      authUserId: "550e8400-e29b-41d4-a716-446655440099",
      queryResult: { data: [row], error: null },
    });

    const plans = await listPlannerDocumentsFromSupabase(client as never, {
      accessMode: "admin",
    });

    expect(plans).toHaveLength(1);
    expect(queryState.filters).not.toContainEqual({
      column: "user_id",
      value: "550e8400-e29b-41d4-a716-446655440099",
    });
  });

  it("lets admin load another owner's plan when owner scope is omitted", async () => {
    const row = buildPlannerSaveRow();
    const { client, queryState } = createSupabaseClientMock({
      authUserId: "550e8400-e29b-41d4-a716-446655440099",
      queryResult: { data: row, error: null },
    });

    const plan = await loadPlannerDocumentFromSupabase(client as never, row.id as string, {
      accessMode: "admin",
    });

    expect(plan?.id).toBe(row.id);
    expect(queryState.filters).toContainEqual({
      column: "id",
      value: "550e8400-e29b-41d4-a716-446655440010",
    });
    expect(queryState.filters).not.toContainEqual({
      column: "user_id",
      value: "550e8400-e29b-41d4-a716-446655440099",
    });
  });

  it("defaults CRM summary fields when listing legacy rows", async () => {
    const row = buildPlannerSaveRow();
    delete row.crm_sync_status;
    delete row.crm_synced_at;
    delete row.crm_sync_error;

    const { client } = createSupabaseClientMock({
      queryResult: { data: [row], error: null },
    });

    const plans = await listPlannerDocumentsFromSupabase(client as never, {});

    expect(plans[0]).toMatchObject({
      id: row.id,
      crm_sync_status: "pending",
      crm_synced_at: null,
      crm_sync_error: null,
    });
  });

  it("preserves the original owner id when admin updates an existing plan", async () => {
    const existingRow = buildPlannerSaveRow({
      id: "550e8400-e29b-41d4-a716-446655440020",
      user_id: "550e8400-e29b-41d4-a716-446655440002",
    });
    const queryResults = [
      { data: { user_id: existingRow.user_id }, error: null },
      { data: existingRow, error: null },
    ];
    const recorders: Array<ReturnType<typeof createQueryRecorder>> = [];

    const client = {
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: "550e8400-e29b-41d4-a716-446655440099" } },
          error: null,
        })),
      },
      from: vi.fn((table: string) => {
        expect(table).toBe("planner_saves");
        const recorder = createQueryRecorder(queryResults[recorders.length] ?? queryResults.at(-1)!);
        recorders.push(recorder);
        return recorder.query;
      }),
    };

    const document = createPlannerDocument({
      id: existingRow.id as string,
      name: "Admin Updated",
      sceneJson: { shapes: [] },
    });

    const saved = await savePlannerDocumentToSupabase(client as never, document, {
      accessMode: "admin",
      saveId: existingRow.id as string,
    });

    expect(saved.id).toBe(existingRow.id);
    expect(client.from).toHaveBeenCalledTimes(2);
    expect(recorders[1]?.state.upsertPayload).toMatchObject({
      id: existingRow.id,
      user_id: existingRow.user_id,
      name: "Admin Updated",
    });
    expect(recorders[1]?.state.upsertOptions).toMatchObject({ onConflict: "id" });
  });

  it("forwards enquiry envelope and CRM sync metadata into save upserts", async () => {
    const savedRow = buildPlannerSaveRow({
      id: "550e8400-e29b-41d4-a716-446655440030",
      enquiry_payload: {
        type: "planner-enquiry",
        schemaVersion: 1,
        generatedAt: "2026-04-08T10:00:00.000Z",
        payload: {
          enquiryId: "ENQ-003",
        },
      },
      crm_sync_status: "failed",
      crm_synced_at: "2026-04-08T10:05:00.000Z",
      crm_sync_error: "CRM unavailable",
    });
    const { client, queryState } = createSupabaseClientMock({
      queryResult: { data: savedRow, error: null },
    });

    const document = createPlannerDocument({
      id: savedRow.id as string,
      name: "CRM Sync Plan",
      sceneJson: { shapes: [] },
    });

    const saved = await savePlannerDocumentToSupabase(client as never, document, {
      enquiryPayload: savedRow.enquiry_payload as PlannerSaveRow["enquiry_payload"],
      crmSyncStatus: "failed",
      crmSyncedAt: "2026-04-08T10:05:00.000Z",
      crmSyncError: "CRM unavailable",
    });

    expect(saved.id).toBe(savedRow.id);
    expect(queryState.upsertPayload).toMatchObject({
      enquiry_payload: {
        type: "planner-enquiry",
        schemaVersion: 1,
        generatedAt: "2026-04-08T10:00:00.000Z",
        payload: {
          enquiryId: "ENQ-003",
        },
      },
      crm_sync_status: "failed",
      crm_synced_at: "2026-04-08T10:05:00.000Z",
      crm_sync_error: "CRM unavailable",
    });
  });

  it("rejects admin delete through the browser repository path", async () => {
    const { client } = createSupabaseClientMock();

    await expect(
      deletePlannerDocumentFromSupabase(
        client as never,
        "550e8400-e29b-41d4-a716-446655440010",
        { accessMode: "admin" },
      ),
    ).rejects.toMatchObject({
      code: "planner:delete-failed",
    });
  });
});
