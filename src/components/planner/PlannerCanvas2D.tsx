"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { movePlannerWall } from "@/lib/planner/document";
import { usePlannerStore } from "@/lib/planner/store";
import type { PlannerDocument, PlannerPoint2D } from "@/lib/planner/types";

import { PlannerGrid } from "./PlannerGrid";
import { PlannerItemsLayer } from "./PlannerItemsLayer";
import { PlannerRoomLayer } from "./PlannerRoomLayer";
import { PlannerSelectionLayer } from "./PlannerSelectionLayer";

type PlannerCanvas2DProps = {
  width?: number;
  height?: number;
  interactive?: boolean;
  showGrid?: boolean;
  currentView?: "2.5d" | "3d";
  onSelectItem?: (itemId: string) => void;
  onMoveItem?: (itemId: string, x: number, z: number) => void;
  onSelectRoom?: () => void;
  onSelectWall?: (wallId: string) => void;
  onMoveWall?: (wallId: string, coordinate: number) => void;
  onToggleGrid?: () => void;
  onSwitchView?: () => void;
  onActivateMoveMode?: () => void;
};

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type ItemDragState = {
  itemId: string;
  offsetX: number;
  offsetZ: number;
};

function getDocumentBounds(document: PlannerDocument): Bounds {
  const points: PlannerPoint2D[] = [];

  document.rooms.forEach((room) => {
    points.push(...room.outline);
  });

  document.walls.forEach((wall) => {
    points.push(wall.start, wall.end);
  });

  document.items.forEach((item) => {
    points.push(
      { x: item.position.x, y: item.position.z },
      { x: item.position.x + item.widthCm, y: item.position.z + item.depthCm },
    );
  });

  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 1000, maxY: 700 };
  }

  return {
    minX: Math.min(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
    maxX: Math.max(...points.map((point) => point.x)),
    maxY: Math.max(...points.map((point) => point.y)),
  };
}

export function PlannerCanvas2D({
  width = 320,
  height = 220,
  interactive = false,
  showGrid = true,
  currentView = "2.5d",
  onSelectItem,
  onMoveItem,
  onSelectRoom,
  onSelectWall,
  onMoveWall,
  onToggleGrid,
  onSwitchView,
  onActivateMoveMode,
}: PlannerCanvas2DProps) {
  const document = usePlannerStore((state) => state.history.present);
  const sceneSelection = usePlannerStore((state) => state.sceneSelection);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width, height });
  const [dragPreview, setDragPreview] = useState<
    Record<string, { x: number; z: number }>
  >({});
  const [dragState, setDragState] = useState<ItemDragState | null>(null);
  const [wallDragPreview, setWallDragPreview] = useState<{
    wallId: string;
    coordinate: number;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const selectedPlacedItemId =
    sceneSelection?.kind === "item" ? (sceneSelection.id ?? null) : null;
  const selectedWallId =
    sceneSelection?.kind === "wall" ? (sceneSelection.id ?? null) : null;
  const canvasWidth = Math.max(canvasSize.width, 1);
  const canvasHeight = Math.max(canvasSize.height, 1);

  const padding = 18;
  const bounds = useMemo(() => getDocumentBounds(document), [document]);
  const room = document.rooms[0] ?? null;
  const roomBounds = useMemo(() => {
    if (!room || room.outline.length === 0) {
      return bounds;
    }

    return {
      minX: Math.min(...room.outline.map((point) => point.x)),
      minY: Math.min(...room.outline.map((point) => point.y)),
      maxX: Math.max(...room.outline.map((point) => point.x)),
      maxY: Math.max(...room.outline.map((point) => point.y)),
    };
  }, [bounds, room]);
  const viewportBounds = useMemo(() => {
    if (room && room.outline.length > 0) {
      return roomBounds;
    }

    if (document.walls.length > 0) {
      const wallPoints = document.walls.flatMap((wall) => [wall.start, wall.end]);

      return {
        minX: Math.min(...wallPoints.map((point) => point.x)),
        minY: Math.min(...wallPoints.map((point) => point.y)),
        maxX: Math.max(...wallPoints.map((point) => point.x)),
        maxY: Math.max(...wallPoints.map((point) => point.y)),
      };
    }

    return bounds;
  }, [bounds, document.walls, room, roomBounds]);

  const spanX = Math.max(viewportBounds.maxX - viewportBounds.minX, 1);
  const spanY = Math.max(viewportBounds.maxY - viewportBounds.minY, 1);
  const scale = Math.min(
    (canvasWidth - padding * 2) / spanX,
    (canvasHeight - padding * 2) / spanY,
  );

  const project = (point: PlannerPoint2D): PlannerPoint2D => ({
    x: padding + (point.x - viewportBounds.minX) * scale,
    y: padding + (point.y - viewportBounds.minY) * scale,
  });

  const unproject = (point: PlannerPoint2D): PlannerPoint2D => ({
    x: viewportBounds.minX + (point.x - padding) / scale,
    y: viewportBounds.minY + (point.y - padding) / scale,
  });

  const displayDocument = useMemo(() => {
    const withPreviewItems =
      Object.keys(dragPreview).length === 0
        ? document
        : {
            ...document,
            items: document.items.map((item) => {
              const preview = dragPreview[item.id];

              if (!preview) {
                return item;
              }

              return {
                ...item,
                position: {
                  ...item.position,
                  x: preview.x,
                  z: preview.z,
                },
              };
            }),
          };

    return wallDragPreview
      ? movePlannerWall(
          withPreviewItems,
          wallDragPreview.wallId,
          wallDragPreview.coordinate,
        )
      : withPreviewItems;
  }, [document, dragPreview, wallDragPreview]);

  useEffect(() => {
    if (!dragState && !wallDragPreview) {
      return;
    }

    const dragStateSnapshot = dragState;
    const dragWall = wallDragPreview;

    function handlePointerUp() {
      const preview = dragStateSnapshot
        ? dragPreview[dragStateSnapshot.itemId]
        : undefined;

      if (dragStateSnapshot && preview) {
        onMoveItem?.(dragStateSnapshot.itemId, preview.x, preview.z);
      }

      if (dragWall) {
        onMoveWall?.(dragWall.wallId, dragWall.coordinate);
      }

      setDragState(null);
      setDragPreview({});
      setWallDragPreview(null);
    }

    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragPreview, dragState, onMoveItem, onMoveWall, wallDragPreview]);

  useEffect(() => {
    const node = containerRef.current;

    if (!node || typeof ResizeObserver === "undefined") {
      return;
    }

    const updateSize = () => {
      const nextWidth = Math.max(Math.round(node.clientWidth), 1);
      const nextHeight = Math.max(Math.round(node.clientHeight), 1);

      setCanvasSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight },
      );
    };

    updateSize();

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive || !svgRef.current) {
      return;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * canvasWidth;
    const svgY = ((event.clientY - rect.top) / rect.height) * canvasHeight;
    const position = unproject({ x: svgX, y: svgY });

    if (dragState) {
      const targetItem = document.items.find((item) => item.id === dragState.itemId);

      if (!targetItem) {
        return;
      }

      const clampedX = Math.min(
        Math.max(position.x - dragState.offsetX, roomBounds.minX),
        roomBounds.maxX - targetItem.widthCm,
      );
      const clampedZ = Math.min(
        Math.max(position.y - dragState.offsetZ, roomBounds.minY),
        roomBounds.maxY - targetItem.depthCm,
      );

      setDragPreview({
        [dragState.itemId]: {
          x: Math.round(clampedX),
          z: Math.round(clampedZ),
        },
      });
      return;
    }

    if (wallDragPreview) {
      const targetWall = document.walls.find(
        (wall) => wall.id === wallDragPreview.wallId,
      );

      if (!targetWall) {
        return;
      }

      const isVertical =
        Math.abs(targetWall.start.x - targetWall.end.x) <=
        Math.abs(targetWall.start.y - targetWall.end.y);

      setWallDragPreview({
        wallId: wallDragPreview.wallId,
        coordinate: Math.round(isVertical ? position.x : position.y),
      });
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    setContextMenu(null);

    if (!interactive || event.button !== 0) {
      return;
    }

    const target = event.target as Element | null;

    if (
      target?.closest("[data-planner-items-layer]") ||
      target?.closest("[data-planner-wall-hit]")
    ) {
      return;
    }

    onSelectRoom?.();
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[linear-gradient(180deg,rgba(19,27,37,0.9),rgba(10,16,24,0.96))]"
    >
      <div className="min-h-0 flex-1">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={interactive ? "Workspace planner canvas" : "Plan overview"}
          onPointerMove={handlePointerMove}
          onClick={handleCanvasClick}
          onContextMenu={
            interactive
              ? (event) => {
                  event.preventDefault();
                  const rect = svgRef.current?.getBoundingClientRect();

                  if (!rect) {
                    return;
                  }

                  setContextMenu({
                    x: Math.min(event.clientX - rect.left, rect.width - 196),
                    y: Math.min(event.clientY - rect.top, rect.height - 174),
                  });
                }
              : undefined
          }
          className={
            interactive
              ? "pointer-events-auto block h-full w-full select-none"
              : "pointer-events-auto block h-full w-full"
          }
        >
          {interactive ? (
            <rect
              x="0"
              y="0"
              width={canvasWidth}
              height={canvasHeight}
              fill="rgba(237,241,245,0.96)"
              onClick={(event) => {
                if (event.button !== 0) {
                  return;
                }

                onSelectRoom?.();
              }}
            />
          ) : null}
          {showGrid ? (
            <PlannerGrid
              width={canvasWidth}
              height={canvasHeight}
              stepPx={100}
              project={project}
              minPoint={{ x: viewportBounds.minX, y: viewportBounds.minY }}
              maxPoint={{ x: viewportBounds.maxX, y: viewportBounds.maxY }}
            />
          ) : null}
          <PlannerRoomLayer
            rooms={displayDocument.rooms}
            walls={displayDocument.walls}
            project={project}
            onSelectRoom={interactive ? onSelectRoom : undefined}
            selectedWallId={selectedWallId}
            showRoomMeasurements={!interactive || sceneSelection?.kind === "room"}
            interactive={interactive}
            onSelectWall={interactive ? onSelectWall : undefined}
            onStartDragWall={
              interactive
                ? (wallId) => {
                    setDragState(null);
                    setDragPreview({});
                    const wall = document.walls.find((entry) => entry.id === wallId);

                    if (!wall) {
                      return;
                    }

                    const isVertical =
                      Math.abs(wall.start.x - wall.end.x) <=
                      Math.abs(wall.start.y - wall.end.y);

                    setWallDragPreview({
                      wallId,
                      coordinate: isVertical ? wall.start.x : wall.start.y,
                    });
                  }
                : undefined
            }
          />
          <PlannerSelectionLayer
            rooms={displayDocument.rooms}
            walls={displayDocument.walls}
            sceneSelection={sceneSelection}
            project={project}
          />
          <PlannerItemsLayer
            items={displayDocument.items}
            selectedItemId={selectedPlacedItemId}
            project={project}
            scale={scale}
            interactive={interactive}
            onSelectItem={onSelectItem}
            onStartDrag={(itemId, pointerPosition) => {
              const targetItem = document.items.find((item) => item.id === itemId);

              if (!targetItem || !svgRef.current) {
                return;
              }

              const rect = svgRef.current.getBoundingClientRect();
              const svgX = ((pointerPosition.clientX - rect.left) / rect.width) * canvasWidth;
              const svgY = ((pointerPosition.clientY - rect.top) / rect.height) * canvasHeight;
              const worldPosition = unproject({ x: svgX, y: svgY });

              setWallDragPreview(null);
              setDragState({
                itemId,
                offsetX: Math.max(worldPosition.x - targetItem.position.x, 0),
                offsetZ: Math.max(worldPosition.y - targetItem.position.z, 0),
              });
            }}
          />
        </svg>
      </div>
      {interactive && contextMenu ? (
        <div
          className="absolute z-5 w-48 rounded-[20px] border border-[var(--border-soft)] bg-white/95 p-2 shadow-[var(--shadow-panel)] backdrop-blur"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <button
            type="button"
            className="flex w-full items-center rounded-[14px] px-3 py-2 text-left text-sm font-medium text-[var(--text-body)] transition hover:bg-[var(--color-ocean-boat-blue-50)]"
            onClick={() => {
              onSelectRoom?.();
              setContextMenu(null);
            }}
          >
            Inspect room
          </button>
          <button
            type="button"
            className="flex w-full items-center rounded-[14px] px-3 py-2 text-left text-sm font-medium text-[var(--text-body)] transition hover:bg-[var(--color-ocean-boat-blue-50)]"
            onClick={() => {
              onActivateMoveMode?.();
              setContextMenu(null);
            }}
          >
            Move and drag
          </button>
          <button
            type="button"
            className="flex w-full items-center rounded-[14px] px-3 py-2 text-left text-sm font-medium text-[var(--text-body)] transition hover:bg-[var(--color-ocean-boat-blue-50)]"
            onClick={() => {
              onToggleGrid?.();
              setContextMenu(null);
            }}
          >
            {showGrid ? "Hide grid" : "Show grid"}
          </button>
          <button
            type="button"
            className="flex w-full items-center rounded-[14px] px-3 py-2 text-left text-sm font-medium text-[var(--text-body)] transition hover:bg-[var(--color-ocean-boat-blue-50)]"
            onClick={() => {
              onSwitchView?.();
              setContextMenu(null);
            }}
          >
            {currentView === "2.5d" ? "Switch to 3D" : "Switch to 2D"}
          </button>
          <p className="px-3 pb-1 pt-2 text-[11px] uppercase tracking-[0.16em] text-[var(--text-subtle)]">
            Wall resize stays on left-click drag.
          </p>
        </div>
      ) : null}
    </div>
  );
}
