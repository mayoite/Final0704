"use client";

import { useMemo } from "react";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei/core/Environment";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";

import { usePlannerStore } from "@/lib/planner/store";

import { PlannerItemMesh } from "./PlannerItemMesh";
import { PlannerRoomMesh } from "./PlannerRoomMesh";
import { PlannerWallMesh } from "./PlannerWallMesh";
import { resolveCssColorExpression } from "./cssVars";

const CM_TO_WORLD = 0.01;

function getSceneFrame(
  room: ReturnType<typeof usePlannerStore.getState>["history"]["present"]["rooms"][number] | null,
) {
  if (!room || room.outline.length === 0) {
    return {
      centerX: 3.5,
      centerZ: 2.5,
      span: 7,
      camera: [7, 6.5, 7] as [number, number, number],
    };
  }

  const xs = room.outline.map((point) => point.x);
  const zs = room.outline.map((point) => point.y);
  const minX = Math.min(...xs) * CM_TO_WORLD;
  const maxX = Math.max(...xs) * CM_TO_WORLD;
  const minZ = Math.min(...zs) * CM_TO_WORLD;
  const maxZ = Math.max(...zs) * CM_TO_WORLD;
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const span = Math.max(maxX - minX, maxZ - minZ, 4);

  return {
    centerX,
    centerZ,
    span,
    camera: [centerX + span * 0.9, Math.max(span * 0.8, 5), centerZ + span * 0.9] as [number, number, number],
  };
}

export function PlannerCanvas3D() {
  const document = usePlannerStore((state) => state.history.present);
  const sceneSelection = usePlannerStore((state) => state.sceneSelection);
  const selectedPlacedItemId =
    sceneSelection?.kind === "item" ? (sceneSelection.id ?? null) : null;
  const room = document.rooms[0] ?? null;
  const sceneFrame = useMemo(() => getSceneFrame(room), [room]);
  const sceneBg = useMemo(
    () => resolveCssColorExpression("var(--surface-accent-wash)", "#eef2f7"),
    [],
  );
  const sceneGridMajor = useMemo(
    () => resolveCssColorExpression("var(--color-bronze-300)", "#beaf9a"),
    [],
  );
  const sceneGridMinor = useMemo(
    () => resolveCssColorExpression("var(--surface-panel)", "#ffffff"),
    [],
  );

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top, var(--surface-panel) 0%, var(--surface-accent-wash) 55%, var(--color-bronze-300) 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-x-4 top-4 z-2 flex flex-wrap items-start justify-between gap-3">
        <div className="rounded-[18px] border border-[var(--border-soft)] bg-white/92 px-4 py-3 shadow-[var(--shadow-panel)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            3D preview
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--text-body)]">
            Drag to orbit. Scroll to zoom.
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {document.items.length > 0
              ? `${document.items.length} product${document.items.length === 1 ? "" : "s"} in scene`
              : "Room shell loaded. Add products for a richer preview."}
          </p>
        </div>

        <div className="rounded-full border border-soft bg-glass-strong px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-strong shadow-theme-soft">
          {document.walls.length} walls
        </div>
      </div>

      <Canvas shadows dpr={[1, 1.5]}>
        <color attach="background" args={[sceneBg]} />
        <fog attach="fog" args={[sceneBg, sceneFrame.span * 1.8, sceneFrame.span * 4.2]} />
        <PerspectiveCamera makeDefault position={sceneFrame.camera} fov={45} />
        <ambientLight intensity={1.18} />
        <directionalLight
          position={[sceneFrame.centerX + sceneFrame.span, sceneFrame.span * 1.7, sceneFrame.centerZ + sceneFrame.span * 0.6]}
          intensity={1.42}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <gridHelper
          args={[
            sceneFrame.span * 2.2,
            Math.max(Math.round(sceneFrame.span * 4), 12),
            sceneGridMajor,
            sceneGridMinor,
          ]}
          position={[sceneFrame.centerX, 0.001, sceneFrame.centerZ]}
        />
        <PlannerRoomMesh room={document.rooms[0] ?? null} />
        {document.walls.map((wall) => (
          <PlannerWallMesh key={wall.id} wall={wall} />
        ))}
        {document.items.map((item) => (
          <PlannerItemMesh
            key={item.id}
            item={item}
            isSelected={selectedPlacedItemId === item.id}
          />
        ))}
        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          minDistance={Math.max(sceneFrame.span * 0.45, 3)}
          maxDistance={Math.max(sceneFrame.span * 2.6, 12)}
          target={[sceneFrame.centerX, 0.8, sceneFrame.centerZ]}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
