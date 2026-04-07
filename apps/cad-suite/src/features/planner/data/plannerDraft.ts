import {
  createPlannerDocument,
  normalizePlannerDocument,
  plannerDocumentSchema,
  type PlannerDocument,
} from "../model";

const PLANNER_DRAFT_STORAGE_PREFIX = "cad-suite:planner:draft:v1";
export const PLANNER_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export interface PlannerDraftScope {
  userId?: string;
  documentId?: string;
}

export interface PlannerDraftEnvelope {
  schemaVersion: 1;
  savedAt: string;
  expiresAt: string;
  document: PlannerDocument;
}

function getPlannerDraftStorageKey(scope: PlannerDraftScope = {}): string {
  const parts = [PLANNER_DRAFT_STORAGE_PREFIX];
  if (scope.userId?.trim()) parts.push(`user:${scope.userId.trim()}`);
  if (scope.documentId?.trim()) parts.push(`doc:${scope.documentId.trim()}`);
  return parts.join(":");
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  const storage = window.localStorage;
  if (
    !storage ||
    typeof storage.getItem !== "function" ||
    typeof storage.setItem !== "function" ||
    typeof storage.removeItem !== "function" ||
    typeof storage.key !== "function"
  ) {
    return null;
  }

  return storage;
}

function isDraftEnvelope(value: unknown): value is Partial<PlannerDraftEnvelope> {
  return Boolean(value && typeof value === "object" && "document" in value);
}

function resolveDraftExpiryMs(envelope: Partial<PlannerDraftEnvelope>): number | null {
  if (typeof envelope.expiresAt === "string") {
    const parsed = Date.parse(envelope.expiresAt);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  if (typeof envelope.savedAt === "string") {
    const parsed = Date.parse(envelope.savedAt);
    if (!Number.isNaN(parsed)) {
      return parsed + PLANNER_DRAFT_TTL_MS;
    }
  }

  return null;
}

function isExpiredDraftEnvelope(envelope: Partial<PlannerDraftEnvelope>, nowMs = Date.now()): boolean {
  const expiresAtMs = resolveDraftExpiryMs(envelope);
  if (expiresAtMs === null) {
    return true;
  }

  return expiresAtMs <= nowMs;
}

export function cleanupExpiredPlannerDrafts(storage = getLocalStorage(), nowMs = Date.now()): number {
  if (!storage) return 0;

  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(PLANNER_DRAFT_STORAGE_PREFIX)) {
      keys.push(key);
    }
  }

  let removed = 0;

  for (const key of keys) {
    const raw = storage.getItem(key);
    if (!raw) {
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      storage.removeItem(key);
      removed += 1;
      continue;
    }

    if (!isDraftEnvelope(parsed) || isExpiredDraftEnvelope(parsed, nowMs)) {
      storage.removeItem(key);
      removed += 1;
    }
  }

  return removed;
}

export function savePlannerDraftDocument(
  document: PlannerDocument,
  scope: PlannerDraftScope = {},
): PlannerDraftEnvelope | null {
  const storage = getLocalStorage();
  if (!storage) return null;

  cleanupExpiredPlannerDrafts(storage);

  const normalized = plannerDocumentSchema.parse(normalizePlannerDocument(document));
  const nowMs = Date.now();
  const envelope: PlannerDraftEnvelope = {
    schemaVersion: 1,
    savedAt: new Date(nowMs).toISOString(),
    expiresAt: new Date(nowMs + PLANNER_DRAFT_TTL_MS).toISOString(),
    document: normalized,
  };

  storage.setItem(getPlannerDraftStorageKey(scope), JSON.stringify(envelope));
  return envelope;
}

export function loadPlannerDraftDocument(scope: PlannerDraftScope = {}): PlannerDocument | null {
  const storage = getLocalStorage();
  if (!storage) return null;

  cleanupExpiredPlannerDrafts(storage);

  const storageKey = getPlannerDraftStorageKey(scope);
  const raw = storage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PlannerDraftEnvelope> | PlannerDocument;

    if (isDraftEnvelope(parsed)) {
      if (isExpiredDraftEnvelope(parsed)) {
        storage.removeItem(storageKey);
        return null;
      }

      return plannerDocumentSchema.parse(normalizePlannerDocument(parsed.document));
    }

    storage.removeItem(storageKey);
    return null;
  } catch {
    storage.removeItem(storageKey);
    return null;
  }
}

export function deletePlannerDraftDocument(scope: PlannerDraftScope = {}): boolean {
  const storage = getLocalStorage();
  if (!storage) return false;

  storage.removeItem(getPlannerDraftStorageKey(scope));
  return true;
}

export function loadOrCreatePlannerDraftDocument(
  scope: PlannerDraftScope = {},
  defaults: Parameters<typeof createPlannerDocument>[0] = {},
): PlannerDocument {
  return loadPlannerDraftDocument(scope) ?? createPlannerDocument(defaults);
}
