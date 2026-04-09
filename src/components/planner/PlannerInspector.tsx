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
    <div className="flex items-end gap-2 rounded-xl border border-soft bg-panel px-3 py-3 shadow-theme-soft">
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="truncate px-1 text-[11px] text-subtle font-semibold tracking-[0.04em]">
          Room Width (cm)
        </p>
        <input
          type="number"
          min="180"
          step="10"
          value={roomWidthInput}
          onChange={(e) => setRoomWidthInput(e.target.value)}
          className="h-9 w-full rounded-lg border border-soft bg-panel px-2 text-sm text-strong font-medium transition-colors outline-none focus:border-strong"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="truncate px-1 text-[11px] text-subtle font-semibold tracking-[0.04em]">
          Room Depth (cm)
        </p>
        <input
          type="number"
          min="180"
          step="10"
          value={roomDepthInput}
          onChange={(e) => setRoomDepthInput(e.target.value)}
          className="h-9 w-full rounded-lg border border-soft bg-panel px-2 text-sm text-strong font-medium transition-colors outline-none focus:border-strong"
        />
      </div>
      <Button
        size="sm"
        className="h-9 shrink-0 rounded-lg border border-soft bg-hover px-3 text-[11px] text-strong font-semibold tracking-[0.03em] hover:bg-muted"
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
            <p className="text-[13px] text-subtle font-semibold tracking-[0.03em]">
              {isBottomLayout ? "Selected product" : "Catalog selection"}
            </p>
            <p className="truncate text-[14px] text-strong font-semibold">
              {selectedCatalogItem ? selectedCatalogItem.name : "No item selected"}
            </p>
          </div>
        </div>
        {selectedCatalogItem ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-soft bg-[var(--surface-soft)]">
            <div className="grid gap-0 md:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)]">
              <div className="min-h-[220px] overflow-hidden border-b border-soft bg-panel p-4 md:min-h-full md:border-r md:border-b-0">
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
                <span className="rounded-full border border-soft bg-panel px-2.5 py-1 text-[12px] text-subtle font-medium">
                  {selectedCatalogItem.categoryLabel ?? selectedCatalogItem.category}
                </span>
                {selectedCatalogItem.family ? (
                  <span className="rounded-full border border-soft bg-panel px-2.5 py-1 text-[12px] text-subtle font-medium">
                    {selectedCatalogItem.family}
                  </span>
                ) : null}
              </div>
              <p className="text-[13px] text-muted leading-6">
                {selectedCatalogItem.spec ||
                  "Specs and product details are available from the product page."}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-soft bg-panel px-3 py-2">
                  <p className="text-[10px] text-subtle font-semibold tracking-[0.03em]">
                    Width
                  </p>
                  <p className="text-[13px] text-strong font-semibold">
                    {Math.round(selectedCatalogItem.width ?? 0)} cm
                  </p>
                </div>
                <div className="rounded-xl border border-soft bg-panel px-3 py-2">
                  <p className="text-[10px] text-subtle font-semibold tracking-[0.03em]">
                    Depth
                  </p>
                  <p className="text-[13px] text-strong font-semibold">
                    {Math.round(selectedCatalogItem.depth ?? 0)} cm
                  </p>
                </div>
                <div className="rounded-xl border border-soft bg-panel px-3 py-2">
                  <p className="text-[10px] text-subtle font-semibold tracking-[0.03em]">
                    Height
                  </p>
                  <p className="text-[13px] text-strong font-semibold">
                    {Math.round(selectedCatalogItem.height ?? 0)} cm
                  </p>
                </div>
              </div>
              {catalogOverview.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[12px] text-subtle font-semibold tracking-[0.03em]">
                    Highlights
                  </p>
                  <div className="space-y-2">
                    {catalogOverview.map((pair, index) => (
                      <div
                        key={`${pair.heading || pair.body}-${index}`}
                        className="rounded-xl border border-soft bg-panel px-3 py-2"
                      >
                        {pair.heading?.trim() ? (
                          <p className="text-[12px] text-strong font-semibold">
                            {pair.heading}
                          </p>
                        ) : null}
                        {pair.body?.trim() ? (
                          <p className="text-[13px] text-muted leading-6">
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
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--planner-accent-soft-bg)] text-[var(--planner-accent)]">
                <Settings2 className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-[12px] text-subtle font-semibold tracking-[0.04em]">
                {isBottomLayout ? "Placement controls" : "Properties"}
              </h2>
            </div>
            {onCollapse && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-subtle hover:bg-hover hover:text-strong"
                onClick={onCollapse}
                title="Collapse Inspector (I)"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="mb-2 flex items-center gap-2">
            <Box className="h-4 w-4 text-[var(--planner-selection)]" />
            <p className="text-[12px] text-subtle font-semibold tracking-[0.04em]">
              Object Inspector
            </p>
          </div>
          {sceneSelection ? (
            <div>
              <h3 className="min-w-0 flex-1 truncate text-base text-strong font-bold wrap-break-word">
                {sceneSelection.title}
              </h3>
              <p className="mt-1 text-sm text-muted font-medium tracking-[0.02em]">
                {sceneSelection.detail}
              </p>
              {typeof sceneSelection.areaSqM === "number" && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-soft bg-hover px-3 py-1">
                  <span className="text-[10px] font-semibold tracking-[0.03em] text-[var(--planner-selection)]">
                    Area:
                  </span>
                  <span className="text-[10px] text-strong font-semibold">
                    {formatAreaPair(sceneSelection.areaSqM)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-soft p-6 text-subtle">
              <Settings2 className="mb-2 h-10 w-10 opacity-50" />
              <p className="text-[11px] font-semibold tracking-[0.04em]">
                Select an element to inspect
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Wall controls */}
      {selectedWall && (
        <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-wrap items-center gap-6 rounded-2xl border border-soft bg-panel p-5 shadow-theme-soft">
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-[11px] text-subtle font-semibold tracking-[0.04em]">
              Wall Span Controls
            </p>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className="h-10 rounded-xl border-soft bg-panel px-6 text-[11px] text-strong font-semibold tracking-[0.03em] hover:bg-hover"
                onClick={() => onNudgeSelectedWall(-10)}
              >
                Nudge -10cm
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-10 rounded-xl border-soft bg-panel px-6 text-[11px] text-strong font-semibold tracking-[0.03em] hover:bg-hover"
                onClick={() => onNudgeSelectedWall(10)}
              >
                Nudge +10cm
              </Button>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-[10px] text-subtle font-semibold tracking-[0.03em]">
              Total Dimension
            </span>
            <span className="text-lg text-strong font-semibold tracking-tight whitespace-nowrap">
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

