"use client";

import { useMemo } from "react";

import type { PlannerRoom } from "@/lib/planner/types";

import { readCssVarColor } from "./cssVars";

type PlannerRoomMeshProps = {
  room: PlannerRoom | null;
};

const CM_TO_WORLD = 0.01;

export function PlannerRoomMesh({ room }: PlannerRoomMeshProps) {
  const roomColor = useMemo(
    () => readCssVarColor("--surface-panel", "#ffffff"),
    [],
  );

  if (!room || room.outline.length === 0) {
    return null;
  }

  const xs = room.outline.map((point) => point.x);
  const zs = room.outline.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const width = Math.max((maxX - minX) * CM_TO_WORLD, 0.5);
  const depth = Math.max((maxZ - minZ) * CM_TO_WORLD, 0.5);
  const centerX = ((minX + maxX) / 2) * CM_TO_WORLD;
  const centerZ = ((minZ + maxZ) / 2) * CM_TO_WORLD;

  return (
    <mesh
      position={[centerX, 0, centerZ]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color={roomColor} roughness={0.96} metalness={0.01} />
    </mesh>
  );
}
