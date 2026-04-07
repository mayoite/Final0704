"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  Planner3DViewer,
  buildPlanner3DSceneDocument,
  formatAreaSqm,
  formatMeters,
  formatMm,
  summarizePlannerDocument,
  type PlannerDocument,
} from "@/features/planner/3d";
import { loadPlannerDocumentFromSupabase, loadPlannerDraftDocument } from "@/features/planner/data";
import { createPlannerDocument } from "@/features/planner/model";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";

const FALLBACK_DOCUMENT = createPlannerDocument({
  id: "configurator-open-studio",
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
      wallHeightMm: 3000,
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

function formatItemDimensions(item: ReturnType<typeof buildPlanner3DSceneDocument>["items"][number]) {
  return `${formatMm(item.sizeMm.widthMm)} x ${formatMm(item.sizeMm.depthMm)} x ${formatMm(item.sizeMm.heightMm)}`;
}

export default function ConfiguratorPage() {
  const searchParams = useSearchParams();
  const [plannerDocument, setPlannerDocument] = useState<PlannerDocument>(FALLBACK_DOCUMENT);
  const [viewerSource, setViewerSource] = useState("Fallback viewer scene");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [viewerMode, setViewerMode] = useState<ViewerMode>("fallback");
  const [isLoading, setIsLoading] = useState(true);

  const draftId = searchParams.get("draft")?.trim() || null;
  const planId = searchParams.get("plan")?.trim() || null;

  useEffect(() => {
    let cancelled = false;

    const loadPlanner = async () => {
      setIsLoading(true);
      const hasSupabaseEnv = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      );
      const supabase = hasSupabaseEnv ? createSupabaseBrowserClient() : null;

      try {
        let userId: string | undefined;

        if (supabase) {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          userId = user?.id?.trim() || undefined;
        }

        if (draftId) {
          const draftDocument = loadPlannerDraftDocument({ documentId: draftId, userId });
          if (draftDocument && !cancelled) {
            setPlannerDocument(draftDocument);
            setViewerSource("Local viewer preview");
            setViewerMode("draft-preview");
            setStatusMessage("Loaded current planner draft into the 3D preview.");
            setIsLoading(false);
            return;
          }
        }

        if (planId && supabase) {
          const savedDocument = await loadPlannerDocumentFromSupabase(supabase, planId, { userId });
          if (savedDocument && !cancelled) {
            setPlannerDocument(savedDocument);
            setViewerSource("Supabase saved plan");
            setViewerMode("saved-plan");
            setStatusMessage("Loaded saved planner document from cloud storage.");
            setIsLoading(false);
            return;
          }
        }

        if (!cancelled) {
          setPlannerDocument(FALLBACK_DOCUMENT);
          setViewerSource("Fallback viewer scene");
          setViewerMode("fallback");
          setStatusMessage(
            draftId || planId
              ? "Requested planner document was unavailable or expired. Showing the fallback viewer scene."
              : "No plan was requested. Showing the fallback viewer scene.",
          );
        }
      } catch (error) {
        if (!cancelled) {
          setPlannerDocument(FALLBACK_DOCUMENT);
          setViewerSource("Fallback viewer scene");
          setViewerMode("error");
          setStatusMessage(error instanceof Error ? error.message : "Unable to load planner document.");
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

  const sceneDocument = useMemo(() => buildPlanner3DSceneDocument(plannerDocument), [plannerDocument]);
  const summary = useMemo(() => summarizePlannerDocument(plannerDocument), [plannerDocument]);
  const viewerModeLabel =
    viewerMode === "draft-preview"
      ? "Interim 3D preview"
      : viewerMode === "saved-plan"
        ? "Saved-plan preview"
        : viewerMode === "error"
          ? "Fallback after load error"
          : "Fallback preview";
  const viewerModeToneClass =
    viewerMode === "error"
      ? "border-danger bg-danger-soft text-body"
      : viewerMode === "fallback"
        ? "border-warning bg-warning-soft text-body"
        : "border-theme-soft bg-panel text-body";
  const sourceHint =
    viewerMode === "draft-preview"
      ? "Draft previews use temporary local cache and may expire after 24 hours."
      : viewerMode === "saved-plan"
        ? "Saved-plan previews come from the canonical planner document store."
        : "Fallback scenes exist so the route stays honest even when no real planner document is available.";

  return (
    <main className="min-h-screen bg-page text-body">
      <div className="mx-auto grid min-h-screen max-w-[1640px] gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[23rem_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-8">
        <aside className="flex flex-col gap-5 rounded-[2rem] border border-theme-soft bg-panel p-6 shadow-theme-float">
          <div className="space-y-3">
            <p className="typ-eyebrow text-brand">Configurator Route</p>
            <h1 className="typ-h1 max-w-md text-[color:var(--planner-text-strong)]">
              Planner document preview in 3D.
            </h1>
            <p className="typ-lead text-muted">
              This route is currently an interim 3D preview surface. It reads the canonical planner document contract, but it should not be presented as a finished configurator yet.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1.4rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-4 shadow-theme-panel">
              <div className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">Mode</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 typ-caption font-semibold uppercase tracking-[0.16em] ${viewerModeToneClass}`}>
                  {viewerModeLabel}
                </span>
                <span className="rounded-full border border-theme-soft bg-panel px-3 py-1 typ-caption font-semibold uppercase tracking-[0.16em] text-muted">
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
              <div className="mt-2 text-base font-semibold text-strong">{sceneDocument.title}</div>
              <div className="mt-1 typ-caption-lg text-body">
                {formatMeters(sceneDocument.room.widthMm)} x {formatMeters(sceneDocument.room.depthMm)}
              </div>
              <div className="mt-1 typ-caption text-subtle">Wall height {formatMm(sceneDocument.room.wallHeightMm)}</div>
            </div>

            <div className="rounded-[1.4rem] border border-theme-soft bg-[color:var(--planner-panel-strong)] p-4 shadow-theme-panel">
              <div className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">Scene</div>
              <div className="mt-2 text-base font-semibold text-strong">{summary.itemCount} items in frame</div>
              <div className="mt-1 typ-caption-lg text-body">Room area {formatAreaSqm(summary.roomAreaSqm * 1000000)}</div>
              <div className="mt-1 typ-caption text-subtle">Footprint {summary.totalFootprintSqm.toFixed(1)} m2</div>
              <div className="mt-1 typ-caption text-subtle">Largest item {summary.largestItemName ?? "n/a"}</div>
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-theme-soft bg-[color:var(--planner-surface-soft)] p-4">
            <div className="typ-caption font-semibold uppercase tracking-[0.16em] text-muted">Document geometry</div>
            <div className="mt-4 space-y-3">
              {sceneDocument.items.length === 0 ? (
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
                      Center {formatMm(item.centerMm.xMm)} x {formatMm(item.centerMm.yMm)} | Rotation {Math.round(item.rotationDeg ?? 0)} deg
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
              <div className="rounded-full border border-theme-soft bg-panel px-4 py-2 typ-caption font-semibold uppercase tracking-[0.18em] text-muted">
                Orbit to inspect
              </div>
            </div>

            <div className="relative flex-1 p-3 sm:p-4">
              <Planner3DViewer document={plannerDocument} className="h-full min-h-[620px]" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
