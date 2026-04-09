"use client";

import type { PlannerBoqRow } from "@/lib/planner/boq";
import type { PlannerPlacedItem, PlannerPoint2D } from "@/lib/planner/types";
import { FileText, ClipboardList, Pen } from "lucide-react";

type PlannerClientBarProps = {
  clientName: string;
  projectName: string;
  preparedBy: string;
  onClientNameChange: (value: string) => void;
  onProjectNameChange: (value: string) => void;
  onPreparedByChange: (value: string) => void;
  totalItems: number;
  uniqueItems: number;
  boqRows: PlannerBoqRow[];
  roomOutline: PlannerPoint2D[];
  placedItems: PlannerPlacedItem[];
};

function MiniFloorPlan({
  roomOutline,
  placedItems,
}: {
  roomOutline?: PlannerPoint2D[];
  placedItems?: PlannerPlacedItem[];
}) {
  const safeRoomOutline = Array.isArray(roomOutline) ? roomOutline : [];
  const safePlacedItems = Array.isArray(placedItems) ? placedItems : [];

  if (safeRoomOutline.length < 3) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-inverse bg-[var(--overlay-panel-08)] text-[12px] font-semibold tracking-[0.04em] text-[var(--text-inverse-muted)]">
        FLOOR PLAN PREVIEW UNAVAILABLE
      </div>
    );
  }

  const xs = safeRoomOutline.map((point) => point.x);
  const ys = safeRoomOutline.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  const padding = 18;
  const viewBoxWidth = 320;
  const viewBoxHeight = 220;
  const scale = Math.min(
    (viewBoxWidth - padding * 2) / width,
    (viewBoxHeight - padding * 2) / height,
  );
  const offsetX = (viewBoxWidth - width * scale) / 2;
  const offsetY = (viewBoxHeight - height * scale) / 2;
  const points = safeRoomOutline
    .map(
      (point) =>
        `${offsetX + (point.x - minX) * scale},${offsetY + (point.y - minY) * scale}`,
    )
    .join(" ");

  return (
    <div className="overflow-hidden rounded-2xl border border-inverse bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-theme-soft">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="h-[220px] w-full"
        aria-label="Floor plan overview"
      >
        <rect
          x="0"
          y="0"
          width={viewBoxWidth}
          height={viewBoxHeight}
          rx="24"
          fill="rgba(255,255,255,0.03)"
        />
        <polygon
          points={points}
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.42)"
          strokeWidth="2"
        />
        {safePlacedItems.map((item) => {
          const rectWidth = Math.max(item.widthCm * scale, 12);
          const rectHeight = Math.max(item.depthCm * scale, 12);
          const x = offsetX + (item.position.x - minX) * scale - rectWidth / 2;
          const y = offsetY + (item.position.z - minY) * scale - rectHeight / 2;

          return (
            <rect
              key={item.id}
              x={x}
              y={y}
              width={rectWidth}
              height={rectHeight}
              rx="6"
              fill="rgba(196,226,255,0.78)"
              stroke="rgba(27,46,78,0.72)"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    </div>
  );
}

export function PlannerClientBar({
  clientName,
  projectName,
  preparedBy,
  onClientNameChange,
  onProjectNameChange,
  onPreparedByChange,
  totalItems,
  uniqueItems,
  boqRows,
  roomOutline = [],
  placedItems = [],
}: PlannerClientBarProps) {
  return (
    <section className="animate-in fade-in rounded-[20px] border border-inverse bg-[var(--surface-inverse)] px-6 py-8 text-[var(--text-inverse-body)] shadow-theme-soft transition-all">
      {/* Header & Stats */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-8 border-b border-inverse pb-8">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--text-inverse-subtle)]" />
            <p className="text-[13px] font-semibold tracking-[0.04em] text-[var(--text-inverse-subtle)]">
              PROJECT DOCUMENTATION
            </p>
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-[var(--text-inverse)]">
            Bill of Quantities
          </h3>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 font-medium text-[var(--text-inverse-muted)]">
            Manage project identifiers and review the generated technical
            specifications for the floor plan.
          </p>
        </div>

        <div className="flex shrink-0 gap-4">
          <div className="flex min-w-[140px] flex-col rounded-2xl border border-inverse bg-[var(--overlay-panel-08)] p-5 shadow-theme-soft">
            <span className="mb-1 text-[12px] font-semibold tracking-[0.04em] text-[var(--text-inverse-muted)]">
              Total Placed
            </span>
            <span className="text-xl font-semibold tracking-tight text-[var(--text-inverse)]">
              {totalItems} items
            </span>
          </div>
          <div className="flex min-w-[140px] flex-col rounded-2xl border border-inverse bg-[var(--overlay-panel-08)] p-5 shadow-theme-soft">
            <span className="mb-1 text-[12px] font-semibold tracking-[0.04em] text-[var(--text-inverse-muted)]">
              BOQ Lines
            </span>
            <span className="text-xl font-semibold tracking-tight text-[var(--planner-selection)]">
              {uniqueItems} unique
            </span>
          </div>
        </div>
      </div>

      <div className="mb-10 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[var(--text-inverse-subtle)]" />
            <p className="text-[13px] font-semibold tracking-[0.04em] text-[var(--text-inverse-subtle)]">
              LAYOUT OVERVIEW
            </p>
          </div>
          <MiniFloorPlan roomOutline={roomOutline} placedItems={placedItems} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-2xl border border-inverse bg-[var(--overlay-panel-08)] p-5 shadow-theme-soft">
            <p className="text-[12px] font-semibold tracking-[0.04em] text-[var(--text-inverse-subtle)]">
              TOTAL PLACED
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-inverse)]">
              {totalItems}
            </p>
          </div>
          <div className="rounded-2xl border border-inverse bg-[var(--overlay-panel-08)] p-5 shadow-theme-soft">
            <p className="text-[12px] font-semibold tracking-[0.04em] text-[var(--text-inverse-subtle)]">
              UNIQUE LINES
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--planner-selection)]">
              {uniqueItems}
            </p>
          </div>
          <div className="rounded-2xl border border-inverse bg-[var(--overlay-panel-08)] p-5 shadow-theme-soft">
            <p className="text-[12px] font-semibold tracking-[0.04em] text-[var(--text-inverse-subtle)]">
              CURRENT STATUS
            </p>
            <p className="mt-2 text-[14px] leading-6 font-medium text-[var(--text-inverse-muted)]">
              {boqRows.length > 0
                ? "Layout preview and quantity list are in sync."
                : "Place products to populate the overview and quantity list."}
            </p>
          </div>
        </div>
      </div>

      {/* Identifiers */}
      <div className="mb-12 grid gap-6 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <p className="px-1 text-[12px] font-semibold tracking-[0.04em] text-[var(--text-inverse-subtle)]">
            CLIENT NAME
          </p>
          <div className="group relative">
            <input
              value={clientName}
              onChange={(event) => onClientNameChange(event.target.value)}
              placeholder="Private Client..."
              className="h-12 w-full rounded-xl border border-inverse bg-[var(--overlay-panel-08)] px-4 text-sm font-medium tracking-[0.02em] text-[var(--text-inverse)] transition-colors outline-none focus:border-[var(--border-contrast-accent)]"
            />
            <Pen className="pointer-events-none absolute top-1/2 right-4 h-3 w-3 -translate-y-1/2 text-[var(--text-inverse-subtle)] transition-colors group-focus-within:text-[var(--color-accent)]" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="px-1 text-[12px] font-semibold tracking-[0.04em] text-[var(--text-inverse-subtle)]">
            PROJECT REFERENCE
          </p>
          <div className="group relative">
            <input
              value={projectName}
              onChange={(event) => onProjectNameChange(event.target.value)}
              placeholder="Proposal v1..."
              className="h-12 w-full rounded-xl border border-inverse bg-[var(--overlay-panel-08)] px-4 text-sm font-medium tracking-[0.02em] text-[var(--text-inverse)] transition-colors outline-none focus:border-[var(--border-contrast-accent)]"
            />
            <Pen className="pointer-events-none absolute top-1/2 right-4 h-3 w-3 -translate-y-1/2 text-[var(--text-inverse-subtle)] transition-colors group-focus-within:text-[var(--color-accent)]" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="px-1 text-[12px] font-semibold tracking-[0.04em] text-[var(--text-inverse-subtle)]">
            PREPARED BY
          </p>
          <div className="group relative">
            <input
              value={preparedBy}
              onChange={(event) => onPreparedByChange(event.target.value)}
              placeholder="Assigned Rep..."
              className="h-12 w-full rounded-xl border border-inverse bg-[var(--overlay-panel-08)] px-4 text-sm font-medium tracking-[0.02em] text-[var(--text-inverse)] transition-colors outline-none focus:border-[var(--border-contrast-accent)]"
            />
            <Pen className="pointer-events-none absolute top-1/2 right-4 h-3 w-3 -translate-y-1/2 text-[var(--text-inverse-subtle)] transition-colors group-focus-within:text-[var(--color-accent)]" />
          </div>
        </div>
      </div>

      {/* BOQ Grid */}
      <div>
        <div className="mb-6 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-[var(--text-inverse-subtle)]" />
          <p className="text-[13px] font-semibold tracking-[0.04em] text-[var(--text-inverse-subtle)]">
            TECHNICAL ITEMIZATION
          </p>
        </div>

        {boqRows.length > 0 ? (
          <div className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-4">
            {boqRows.map((row, index) => (
              <div
                key={`${row.catalogId || row.name}-${index}`}
                className="group flex flex-col rounded-2xl border border-inverse bg-[var(--overlay-panel-08)] p-5 transition hover:border-[var(--border-contrast-accent)]"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <h4 className="line-clamp-2 flex-1 text-[14px] font-semibold tracking-[0.01em] text-[var(--text-inverse)]">
                    {row.name}
                  </h4>
                  <span className="shrink-0 rounded-lg border border-inverse bg-[var(--overlay-panel-10)] px-2 py-1 text-[12px] leading-none font-semibold text-[var(--planner-selection)]">
                    x{row.quantity}
                  </span>
                </div>
                <div className="mb-4 h-px bg-[var(--border-inverse)]" />
                <div className="flex items-center justify-between text-[12px] font-medium tracking-[0.03em] text-[var(--text-inverse-muted)]">
                  <span className="rounded border border-inverse bg-[var(--overlay-panel-10)] px-2 py-1 group-hover:border-[var(--border-contrast-accent)]">
                    {row.catalogId}
                  </span>
                  <span>
                    {row.widthCm}x{row.depthCm} CM
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border-4 border-dashed border-inverse p-16 text-center text-[12px] font-semibold tracking-[0.04em] text-[var(--text-inverse-muted)]">
            BILL OF QUANTITIES WILL POPULATE ON PLACEMENT
          </div>
        )}
      </div>
    </section>
  );
}

