"use client";

import { useMemo } from "react";

import type { PlannerWall } from "@/lib/planner/types";

import { readCssVarColor } from "./cssVars";

type PlannerWallMeshProps = {
  wall: PlannerWall;
};

const CM_TO_WORLD = 0.01;
const WALL_HEIGHT = 2.8;
const WALL_THICKNESS = 0.08;

export function PlannerWallMesh({ wall }: PlannerWallMeshProps) {
  const wallColor = useMemo(
    () => readCssVarColor("--color-bronze-300", "#beaf9a"),
    [],
  );

  const dx = wall.end.x - wall.start.x;
  const dz = wall.end.y - wall.start.y;
  const length = Math.max(Math.hypot(dx, dz) * CM_TO_WORLD, 0.1);
  const rotationY = Math.atan2(dz, dx);
  const centerX = ((wall.start.x + wall.end.x) / 2) * CM_TO_WORLD;
  const centerZ = ((wall.start.y + wall.end.y) / 2) * CM_TO_WORLD;

  return (
    <mesh
      position={[centerX, WALL_HEIGHT / 2, centerZ]}
      rotation={[0, -rotationY, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[length, WALL_HEIGHT, WALL_THICKNESS]} />
      <meshStandardMaterial color={wallColor} roughness={0.85} metalness={0.02} />
    </mesh>
  );
}
