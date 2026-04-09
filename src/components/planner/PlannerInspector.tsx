"use client";

import { useState } from "react";
import Image from "next/image";
import { Box, Settings2, PanelRightClose } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { usePlannerStore } from "@/lib/planner/store";
import { formatAreaPair, formatLengthPair } from "@/lib/planner/units";
import { cn } from "@/lib/utils";

import type { PlannerCatalogItem, SceneSelection } from "./types";

interface PlannerInspectorProps {
  className?: string;
  layout?: "sidebar" | "bottom";
  sceneSelection: SceneSelection;
  onApplyRoomSize: (widthCm: number, depthCm: number) => void;
  onNudgeSelectedWall: (deltaCm: number) => void;
  selectedCatalogItem: PlannerCatalogItem | null;
  onCollapse?: () => void;
}

function RoomSizeEditor({
  widthCm,
  depthCm,
  onApplyRoomSize,
}: {
  widthCm: number;
  depthCm: number;
  onApplyRoomSize: (w: number, d: number) => void;
}) {
  const [roomWidthInput, setRoomWidthInput] = useState(
    String(Math.round(widthCm)),
  );
  const [roomDepthInput, setRoomDepthInput] = useState(
    String(Math.round(depthCm)),
  );

  return (
    <div className="flex items-end gap-2 px-3 py-3 bg-panel rounded-xl border border-soft shadow-theme-soft">
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="px-1 text-[11px] font-semibold tracking-[0.04em] text-subtle truncate">
          Room Width (cm)
        </p>
        <input
          type="number"
          min="180"
          step="10"
          value={roomWidthInput}
          onChange={(e) => setRoomWidthInput(e.target.value)}
          className="h-9 w-full rounded-lg border border-soft bg-panel px-2 text-sm font-medium text-strong outline-none transition-colors focus:border-strong"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="px-1 text-[11px] font-semibold tracking-[0.04em] text-subtle truncate">
          Room Depth (cm)
        </p>
        <input
          type="number"
          min="180"
          step="10"
          value={roomDepthInput}
          onChange={(e) => setRoomDepthInput(e.target.value)}
          className="h-9 w-full rounded-lg border border-soft bg-panel px-2 text-sm font-medium text-strong outline-none transition-colors focus:border-strong"
        />
      </div>
      <Button
        size="sm"
        className="h-9 shrink-0 rounded-lg border border-soft bg-hover px-3 text-[11px] font-semibold tracking-[0.03em] text-strong hover:bg-muted"
        onClick={() =>
          onApplyRoomSize(
            Number(roomWidthInput) || widthCm,
            Number(roomDepthInput) || depthCm,
          )
        }
      >
        Update
      </Button>
    </div>
  );
}

export function PlannerInspector({
  className,
  layout = "sidebar",
  sceneSelection,
  onApplyRoomSize,
  onNudgeSelectedWall,
  selectedCatalogItem,
  onCollapse,
}: PlannerInspectorProps) {
  const document = usePlannerStore((state) => state.history.present);
  const activeRoom = document.rooms[0] ?? null;
  const selectedWall =
    sceneSelection?.kind === "wall"
      ? (document.walls.find((wall) => wall.id === sceneSelection.id) ?? null)
      : null;
  const roomXs = activeRoom?.outline.map((point) => point.x) ?? [];
  const roomYs = activeRoom?.outline.map((point) => point.y) ?? [];
  const roomWidthCm =
    roomXs.length > 0 ? Math.max(...roomXs) - Math.min(...roomXs) : 0;
  const roomDepthCm =
    roomYs.length > 0 ? Math.max(...roomYs) - Math.min(...roomYs) : 0;
  const catalogOverview =
    selectedCatalogItem?.overviewPairs
      ?.filter(
        (pair) =>
          Boolean(pair?.heading?.trim()) || Boolean(pair?.body?.trim()),
      )
      .slice(0, 4) ?? [];
  const isBottomLayout = layout === "bottom";

  return (
    <section
      className={cn(
        "flex flex-col gap-5",
        isBottomLayout ? "rounded-[24px] border border-soft bg-panel p-4 md:p-5" : "p-6",
        className,
      )}
    >
      <div className="rounded-2xl border border-soft bg-panel p-4 shadow-theme-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold tracking-[0.03em] text-subtle">
              {isBottomLayout ? "Selected product" : "Catalog selection"}
            </p>
            <p className="truncate text-[14px] font-semibold text-strong">
              {selectedCatalogItem ? selectedCatalogItem.name : "No item selected"}
            </p>
          </div>
        </div>
        {selectedCatalogItem ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-soft bg-[var(--surface-soft)]">
            <div className="grid gap-0 md:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)]">
              <div className="min-h-[220px] overflow-hidden border-b border-soft bg-panel p-4 md:min-h-full md:border-b-0 md:border-r">
                <div className="relative h-full min-h-[188px] overflow-hidden rounded-[20px] border border-soft bg-[var(--surface-soft)]">
                  {selectedCatalogItem.heroImageUrl || selectedCatalogItem.imageUrl ? (
                    <Image
                      src={
                        selectedCatalogItem.heroImageUrl ||
                        selectedCatalogItem.imageUrl ||
                        ""
                      }
                      alt={selectedCatalogItem.name}
                      fill
                      className="object-contain p-3"
                      sizes="(min-width: 768px) 30vw, 100vw"
                    />
                  ) : null}
                </div>
              </div>
              <div className="space-y-3 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-soft bg-panel px-2.5 py-1 text-[12px] font-medium text-subtle">
                  {selectedCatalogItem.categoryLabel ?? selectedCatalogItem.category}
                </span>
                {selectedCatalogItem.family ? (
                  <span className="rounded-full border border-soft bg-panel px-2.5 py-1 text-[12px] font-medium text-subtle">
                    {selectedCatalogItem.family}
                  </span>
                ) : null}
              </div>
              <p className="text-[13px] leading-6 text-muted">
                {selectedCatalogItem.spec ||
                  "Specs and product details are available from the product page."}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-soft bg-panel px-3 py-2">
                  <p className="text-[10px] font-semibold tracking-[0.03em] text-subtle">
                    Width
                  </p>
                  <p className="text-[13px] font-semibold text-strong">
                    {Math.round(selectedCatalogItem.width ?? 0)} cm
                  </p>
                </div>
                <div className="rounded-xl border border-soft bg-panel px-3 py-2">
                  <p className="text-[10px] font-semibold tracking-[0.03em] text-subtle">
                    Depth
                  </p>
                  <p className="text-[13px] font-semibold text-strong">
                    {Math.round(selectedCatalogItem.depth ?? 0)} cm
                  </p>
                </div>
                <div className="rounded-xl border border-soft bg-panel px-3 py-2">
                  <p className="text-[10px] font-semibold tracking-[0.03em] text-subtle">
                    Height
                  </p>
                  <p className="text-[13px] font-semibold text-strong">
                    {Math.round(selectedCatalogItem.height ?? 0)} cm
                  </p>
                </div>
              </div>
              {catalogOverview.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[12px] font-semibold tracking-[0.03em] text-subtle">
                    Highlights
                  </p>
                  <div className="space-y-2">
                    {catalogOverview.map((pair, index) => (
                      <div
                        key={`${pair.heading || pair.body}-${index}`}
                        className="rounded-xl border border-soft bg-panel px-3 py-2"
                      >
                        {pair.heading?.trim() ? (
                          <p className="text-[12px] font-semibold text-strong">
                            {pair.heading}
                          </p>
                        ) : null}
                        {pair.body?.trim() ? (
                          <p className="text-[13px] leading-6 text-muted">
                            {pair.body}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-6">
        {/* Selection Info */}
        <div className="min-w-[240px] flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--planner-accent-soft-bg)] text-[var(--planner-accent)]">
                <Settings2 className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-[12px] font-semibold tracking-[0.04em] text-subtle">
                {isBottomLayout ? "Placement controls" : "Properties"}
              </h2>
            </div>
            {onCollapse && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-hover text-subtle hover:text-strong"
                onClick={onCollapse}
                title="Collapse Inspector (I)"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Box className="w-4 h-4 text-[var(--planner-selection)]" />
            <p className="text-[12px] font-semibold tracking-[0.04em] text-subtle">
              Object Inspector
            </p>
          </div>
          {sceneSelection ? (
            <div>
              <h3 className="min-w-0 flex-1 truncate text-base font-bold text-strong wrap-break-word">
                {sceneSelection.title}
              </h3>
              <p className="mt-1 text-sm font-medium tracking-[0.02em] text-muted">
                {sceneSelection.detail}
              </p>
              {typeof sceneSelection.areaSqM === "number" && (
                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-hover border border-soft rounded-lg">
                  <span className="text-[10px] font-semibold tracking-[0.03em] text-[var(--planner-selection)]">
                    Area:
                  </span>
                  <span className="text-[10px] font-semibold text-strong">
                    {formatAreaPair(sceneSelection.areaSqM)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-6 border-2 border-dashed border-soft rounded-2xl items-center text-subtle">
              <Settings2 className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-[11px] font-semibold tracking-[0.04em]">
                Select an element to inspect
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Wall controls */}
      {selectedWall && (
        <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-soft bg-panel p-5 shadow-theme-soft animate-in fade-in slide-in-from-bottom-2">
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-[11px] font-semibold tracking-[0.04em] text-subtle">
              Wall Span Controls
            </p>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className="h-10 rounded-xl border-soft bg-panel px-6 text-[11px] font-semibold tracking-[0.03em] text-strong hover:bg-hover"
                onClick={() => onNudgeSelectedWall(-10)}
              >
                Nudge -10cm
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-10 rounded-xl border-soft bg-panel px-6 text-[11px] font-semibold tracking-[0.03em] text-strong hover:bg-hover"
                onClick={() => onNudgeSelectedWall(10)}
              >
                Nudge +10cm
              </Button>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span className="text-[10px] font-semibold tracking-[0.03em] text-subtle">
              Total Dimension
            </span>
            <span className="whitespace-nowrap text-lg font-semibold tracking-tight text-strong">
              {formatLengthPair(
                Math.hypot(
                  selectedWall.end.x - selectedWall.start.x,
                  selectedWall.end.y - selectedWall.start.y,
                ),
              )}
            </span>
          </div>
        </div>
      )}

      {/* Room size editor */}
      {sceneSelection?.kind === "room" && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <RoomSizeEditor
            key={`${roomWidthCm}-${roomDepthCm}`}
            widthCm={roomWidthCm || 600}
            depthCm={roomDepthCm || 400}
            onApplyRoomSize={onApplyRoomSize}
          />
        </div>
      )}
    </section>
  );
}

