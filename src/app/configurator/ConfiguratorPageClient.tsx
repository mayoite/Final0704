"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  Planner3DViewer,
  buildPlanner3DSceneDocument,
  summarizePlannerDocument,
  type PlannerDocument,
} from "@/features/planner/3d";
import { resolvePlannerDraftDocument } from "@/features/planner/data/plannerDraft";
import { loadPlannerDocumentFromSupabase, PlannerStorageError } from "@/features/planner/data/plannerSaves";
import {
  formatArea,
  formatLength,
  plannerUnitSystemToMeasurementUnit,
} from "@/features/planner/lib/measurements";
import { createPlannerDocument } from "@/features/planner/model";
import {
  createClient as createSupabaseBrowserClient,
  getBrowserSessionUser,
} from "@/lib/supabase/client";

const FALLBACK_DOCUMENT = createPlannerDocument({
  id: "00000000-0000-0000-0000-000000000000",
  name: "Open Studio calibration scene",
  projectName: "Fallback viewer sample",
  sceneJson: {
    type: "cad-suite-planner-scene",
    version: 1,
    measurement: {
      canonicalUnit: "mm",
      displayUnit: "mm",
      sourceUnit: "mm",
    },
    room: {
      widthMm: 7200,
      depthMm: 5400,
      wallHeightMm: 2100,
      wallThicknessMm: 120,
      floorThicknessMm: 40,
      originMm: { xMm: 0, yMm: 0 },
    },
    items: [
      {
        id: "workstation-run",
        name: "Workstation run",
        category: "workstations",
        centerMm: { xMm: 1800, yMm: 1400 },
        sizeMm: { widthMm: 3000, depthMm: 780, heightMm: 750 },
        rotationDeg: 0,
      },
      {
        id: "meeting-table",
        name: "Meeting table",
        category: "tables",
        centerMm: { xMm: 4700, yMm: 3050 },
        sizeMm: { widthMm: 2200, depthMm: 1200, heightMm: 750 },
        rotationDeg: 12,
      },
      {
        id: "storage-wall",
        name: "Storage wall",
        category: "storage",
        centerMm: { xMm: 5650, yMm: 1100 },
        sizeMm: { widthMm: 1600, depthMm: 520, heightMm: 2100 },
        rotationDeg: 0,
      },
      {
        id: "lounge-pair",
        name: "Lounge pair",
        category: "seating",
        centerMm: { xMm: 1200, yMm: 4200 },
        sizeMm: { widthMm: 1200, depthMm: 900, heightMm: 780 },
        rotationDeg: -18,
      },
    ],
    tldrawSnapshot: {},
  },
  roomWidthMm: 7200,
  roomDepthMm: 5400,
  itemCount: 4,
});

type ViewerMode = "draft-preview" | "saved-plan" | "fallback" | "error";
const PLAN_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeRouteToken(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function isPlannerSaveId(value: string): boolean {
  return PLAN_ID_PATTERN.test(value);
}

function buildDraftStatusMessage(
  options: {
    usedUnscopedFallback: boolean;
    ignoredPlanId?: string | null;
  },
): string {
  const details: string[] = [];

  if (options.usedUnscopedFallback) {
    details.push("Loaded the device-scoped draft cache because the signed-in draft scope was unavailable.");
  } else {
    details.push("Loaded the requested local planner draft into the 3D preview.");
  }

  if (options.ignoredPlanId) {
    details.push(`Ignored saved plan ${options.ignoredPlanId} because draft previews take precedence on this route.`);
  }

  return details.join(" ");
}

function buildDraftMissingStatusMessage(status: ReturnType<typeof resolvePlannerDraftDocument>["status"]): string {
  if (status === "expired") {
    return "Requested planner draft expired from local storage.";
  }

  if (status === "invalid") {
    return "Requested planner draft cache was invalid and has been cleared.";
  }

  if (status === "storage-unavailable") {
    return "Local draft storage is unavailable in this browser context.";
  }

  return "Requested planner draft was not found in local storage.";
}

function buildPlanLoadErrorMessage(error: unknown): string {
  if (error instanceof PlannerStorageError && error.code === "planner:no-auth") {
    return "Saved-plan previews require a signed-in planner session.";
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Unable to load planner document.";
}

function ConfiguratorPageContent() {
  const searchParams = useSearchParams();
  const [plannerDocument, setPlannerDocument] = useState<PlannerDocument | null>(null);
  const [viewerSource, setViewerSource] = useState("Resolving planner document");
  const [statusMessage, setStatusMessage] = useState<string | null>("Resolving configurator request.");
  const [viewerMode, setViewerMode] = useState<ViewerMode>("fallback");
  const [isLoading, setIsLoading] = useState(true);

  const draftId = normalizeRouteToken(searchParams.get("draft"));
  const planId = normalizeRouteToken(searchParams.get("plan"));

  useEffect(() => {
    let cancelled = false;

    const loadPlanner = async () => {
      setIsLoading(true);
      setPlannerDocument(null);
      setViewerSource("Resolving planner document");
      setStatusMessage("Resolving configurator request.");
      setViewerMode("fallback");
      const hasSupabaseEnv = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      );
      const supabase = hasSupabaseEnv ? createSupabaseBrowserClient() : null;

      try {
        let userId: string | undefined;

        if (supabase) {
          const user = await getBrowserSessionUser(supabase);
          userId = user?.id?.trim() || undefined;
        }

        if (draftId) {
          const draftResult = resolvePlannerDraftDocument({ documentId: draftId, userId });
          if (draftResult.document && !cancelled) {
            setPlannerDocument(draftResult.document);
            setViewerSource("Local viewer preview");
            setViewerMode("draft-preview");
            setStatusMessage(
              buildDraftStatusMessage({
                usedUnscopedFallback: Boolean(userId && !draftResult.scope?.userId),
                ignoredPlanId: planId,
              }),
            );
            setIsLoading(false);
            return;
          }

          if (!planId && !cancelled) {
            setPlannerDocument(FALLBACK_DOCUMENT);
            setViewerSource("Fallback viewer scene");
            setViewerMode("fallback");
            setStatusMessage(buildDraftMissingStatusMessage(draftResult.status));
            setIsLoading(false);
            return;
          }

          if (planId && !cancelled) {
            setStatusMessage(`${buildDraftMissingStatusMessage(draftResult.status)} Trying the requested saved plan next.`);
          }
        }

        if (planId) {
          if (!isPlannerSaveId(planId)) {
            if (!cancelled) {
              setPlannerDocument(FALLBACK_DOCUMENT);
              setViewerSource("Fallback viewer scene");
              setViewerMode("error");
              setStatusMessage(`Saved-plan id "${planId}" is malformed. Showing the fallback viewer scene instead.`);
            }
            return;
          }

          if (!supabase) {
            if (!cancelled) {
              setPlannerDocument(FALLBACK_DOCUMENT);
              setViewerSource("Fallback viewer scene");
              setViewerMode("error");
              setStatusMessage(
                "Saved-plan previews are unavailable because Supabase browser credentials are not configured in this environment.",
              );
            }
            return;
          }

          try {
            const savedDocument = await loadPlannerDocumentFromSupabase(supabase, planId, { userId });
            if (savedDocument && !cancelled) {
              setPlannerDocument(savedDocument);
              setViewerSource("Supabase saved plan");
              setViewerMode("saved-plan");
              setStatusMessage(
                draftId
                  ? `Requested draft ${draftId} was unavailable, so the route loaded saved plan ${planId} instead.`
                  : "Loaded requested saved planner document from cloud storage.",
              );
              setIsLoading(false);
              return;
            }
          } catch (error) {
            if (!cancelled) {
              setPlannerDocument(FALLBACK_DOCUMENT);
              setViewerSource("Fallback viewer scene");
              setViewerMode("error");
              setStatusMessage(buildPlanLoadErrorMessage(error));
            }
            return;
          }

          if (!cancelled) {
            setPlannerDocument(FALLBACK_DOCUMENT);
            setViewerSource("Fallback viewer scene");
            setViewerMode("fallback");
            setStatusMessage(
              draftId
                ? `Requested draft ${draftId} and saved plan ${planId} were both unavailable. Showing the fallback viewer scene.`
                : `Requested saved plan ${planId} was unavailable. Showing the fallback viewer scene.`,
            );
          }
          return;
        }

        if (!cancelled) {
          setPlannerDocument(FALLBACK_DOCUMENT);
          setViewerSource("Fallback viewer scene");
          setViewerMode("fallback");
          setStatusMessage("No planner document was requested. Showing the fallback viewer scene.");
        }
      } catch (error) {
        if (!cancelled) {
          setPlannerDocument(FALLBACK_DOCUMENT);
          setViewerSource("Fallback viewer scene");
          setViewerMode("error");
          setStatusMessage(buildPlanLoadErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPlanner();

    return () => {
      cancelled = true;
    };
  }, [draftId, planId]);

  const resolvedDocument = plannerDocument;
  const sceneDocument = useMemo(
    () => (resolvedDocument ? buildPlanner3DSceneDocument(resolvedDocument) : null),
    [resolvedDocument],
  );
  const summary = useMemo(
    () => (resolvedDocument ? summarizePlannerDocument(resolvedDocument) : null),
    [resolvedDocument],
  );
  const measurementUnit = resolvedDocument
    ? plannerUnitSystemToMeasurementUnit(resolvedDocument.unitSystem)
    : plannerUnitSystemToMeasurementUnit(FALLBACK_DOCUMENT.unitSystem);
  const viewerModeLabel = isLoading
    ? "Resolving request"
    : viewerMode === "draft-preview"
      ? "Interim 3D preview"
      : viewerMode === "saved-plan"
        ? "Saved-plan preview"
        : viewerMode === "error"
          ? "Fallback after load error"
          : "Fallback preview";
  const viewerModeToneClass = isLoading
    ? "border-theme-soft bg-panel text-body"
    : viewerMode === "error"
      ? "border-danger bg-danger-soft text-body"
      : viewerMode === "fallback"
        ? "border-warning bg-warning-soft text-body"
        : "border-theme-soft bg-panel text-body";
  const sourceHint =
    isLoading
      ? "The route waits for a real planner document before mounting any preview scene."
      : viewerMode === "draft-preview"
        ? "Draft previews use temporary local cache and may expire after 24 hours."
        : viewerMode === "saved-plan"
        ? "Saved-plan previews come from the canonical planner document store."
        : "Fallback scenes exist so the route stays honest even when no real planner document is available.";
  const formatItemDimensions = (item: ReturnType<typeof buildPlanner3DSceneDocument>["items"][number]) =>
    `${formatLength(item.sizeMm.widthMm, measurementUnit)} x ${formatLength(item.sizeMm.depthMm, measurementUnit)} x ${formatLength(item.sizeMm.heightMm, measurementUnit)}`;

  return (
    <main className="min-h-screen bg-page text-body">
      <div className="mx-auto grid min-h-screen max-w-[1640px] gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[23rem_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-8">
        <aside className="flex flex-col gap-5 rounded-[2rem] border border-theme-soft bg-panel p-6 shadow-theme-float">
          <div className="space-y-3">
            <p className="typ-eyebrow text-brand">Configurator Route</p>
            <h1 className="typ-h1 max-w-md text-[color:var(--planner-text-strong)]">
              Planner document preview, mapped in 3D.
            </h1>
            <p className="typ-lead text-muted">
              This route is an interim 3D review surface. It reads the canonical planner document contract, but it is not the finished configurator experience yet.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1.4rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-4 shadow-theme-panel">
              <div className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">Mode</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 typ-caption font-semibold uppercase tracking-[0.16em] ${viewerModeToneClass}`}>
                  {viewerModeLabel}
                </span>
                <span className="planner-viewer-chip rounded-full px-3 py-1 typ-caption font-semibold uppercase tracking-[0.16em] text-body">
                  Document-driven
                </span>
              </div>
              <div className="mt-2 typ-caption-lg text-subtle">{sourceHint}</div>
            </div>

            <div className="rounded-[1.4rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-4 shadow-theme-panel">
              <div className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">Source</div>
              <div className="mt-2 text-base font-semibold text-strong">{viewerSource}</div>
              <div className="mt-1 typ-caption-lg text-subtle">{statusMessage ?? "Viewer ready."}</div>
            </div>

            <div className="rounded-[1.4rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-4 shadow-theme-panel">
              <div className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">Room</div>
              {sceneDocument ? (
                <>
                  <div className="mt-2 text-base font-semibold text-strong">{sceneDocument.title}</div>
                  <div className="mt-1 typ-caption-lg text-body">
                    {formatLength(sceneDocument.room.widthMm, measurementUnit)} x {formatLength(sceneDocument.room.depthMm, measurementUnit)}
                  </div>
                  <div className="mt-1 typ-caption text-subtle">
                    Wall height {formatLength(sceneDocument.room.wallHeightMm, measurementUnit)}
                  </div>
                </>
              ) : (
                <div className="mt-2 typ-caption-lg text-subtle">Waiting for planner geometry.</div>
              )}
            </div>

            <div className="rounded-[1.4rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-4 shadow-theme-panel">
              <div className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">Scene</div>
              {summary ? (
                <>
                  <div className="mt-2 text-base font-semibold text-strong">{summary.itemCount} items in frame</div>
                  <div className="mt-1 typ-caption-lg text-body">
                    Room area {formatArea(summary.roomAreaSqm * 1000000, measurementUnit)}
                  </div>
                  <div className="mt-1 typ-caption text-subtle">
                    Footprint {formatArea(summary.totalFootprintSqm * 1000000, measurementUnit)}
                  </div>
                  <div className="mt-1 typ-caption text-subtle">Largest item {summary.largestItemName ?? "n/a"}</div>
                </>
              ) : (
                <div className="mt-2 typ-caption-lg text-subtle">Scene metrics will appear after the document loads.</div>
              )}
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-theme-soft bg-[color:var(--planner-surface-soft)] p-4">
            <div className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">Document geometry</div>
            <div className="mt-4 space-y-3">
              {!sceneDocument ? (
                <div className="rounded-[1.1rem] border border-theme-soft bg-panel px-4 py-5 typ-caption-lg text-subtle">
                  Waiting for planner geometry.
                </div>
              ) : sceneDocument.items.length === 0 ? (
                <div className="rounded-[1.1rem] border border-theme-soft bg-panel px-4 py-5 typ-caption-lg text-subtle">
                  No planner items were available in this document yet.
                </div>
              ) : (
                sceneDocument.items.map((item) => (
                  <div key={item.id} className="rounded-[1.1rem] border border-theme-soft bg-panel px-4 py-3 shadow-theme-panel">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-strong">{item.name}</div>
                        <div className="mt-1 typ-caption text-muted uppercase tracking-[0.14em]">{item.category}</div>
                      </div>
                      <div
                        className="mt-0.5 h-3.5 w-3.5 rounded-full border border-theme-soft"
                        style={{ backgroundColor: item.color ?? "#6f7e87" }}
                      />
                    </div>
                    <div className="mt-2 typ-caption-lg text-body">{formatItemDimensions(item)}</div>
                    <div className="mt-1 typ-caption text-subtle">
                      Center {formatLength(item.centerMm.xMm, measurementUnit)} x {formatLength(item.centerMm.yMm, measurementUnit)} | Rotation {Math.round(item.rotationDeg ?? 0)} deg
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-auto flex flex-wrap gap-3">
            <Link
              href="/planner"
              className="rounded-full bg-[color:var(--planner-primary)] px-5 py-3 typ-cta text-white shadow-theme-panel transition hover:bg-[color:var(--planner-primary-hover)]"
            >
              Open Planner
            </Link>
            <span className="rounded-full border border-theme-soft bg-panel px-5 py-3 typ-caption-lg font-semibold text-body">
              Interim preview, not final configurator
            </span>
          </div>
        </aside>

        <section className="relative min-h-[74vh] overflow-hidden rounded-[2rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] shadow-theme-float lg:min-h-[calc(100vh-4rem)]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,52,83,0.07)_0%,transparent_34%,rgba(174,126,55,0.09)_100%)]" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-theme-soft px-5 py-4 sm:px-6">
              <div>
                <div className="typ-caption font-semibold uppercase tracking-[0.18em] text-muted">3D preview</div>
                <div className="mt-1 typ-caption-lg text-body">
                  {isLoading
                    ? "Loading planner document..."
                    : "Room shell and items are mapped from the canonical planner document in millimeters."}
                </div>
              </div>
              <div className="planner-viewer-chip rounded-full px-4 py-2 typ-caption font-semibold uppercase tracking-[0.18em] text-body">
                Orbit by default
              </div>
            </div>

            <div className="relative flex-1 p-3 sm:p-4">
              {isLoading || !resolvedDocument ? (
                <div className="planner-viewer-surface flex h-full min-h-[620px] items-center justify-center rounded-[1.6rem] border border-dashed border-theme-soft px-6 text-center typ-caption-lg text-subtle">
                  Resolving the requested planner document before mounting the 3D preview.
                </div>
              ) : (
                <>
                  {(viewerMode === "fallback" || viewerMode === "error") && statusMessage ? (
                    <div className="planner-viewer-surface pointer-events-none absolute left-6 right-6 top-6 z-20 rounded-[1.2rem] border border-theme-soft px-4 py-3">
                      <div className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">
                        {viewerMode === "error" ? "Load attention" : "Fallback preview"}
                      </div>
                      <div className="mt-1 typ-caption-lg text-body">{statusMessage}</div>
                    </div>
                  ) : null}
                  <Planner3DViewer document={resolvedDocument} className="h-full min-h-[620px]" />
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ConfiguratorPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-page text-body">
          <div className="mx-auto flex min-h-screen max-w-[1640px] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
            <div className="planner-viewer-surface rounded-[1.6rem] border border-theme-soft px-6 py-5 typ-caption-lg text-body">
              Loading configurator preview...
            </div>
          </div>
        </main>
      }
    >
      <ConfiguratorPageContent />
    </Suspense>
  );
}
