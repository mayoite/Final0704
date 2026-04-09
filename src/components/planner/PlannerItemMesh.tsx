"use client";

import { getPlannerRenderSpec } from "@/lib/planner/rendering";
import type { PlannerPlacedItem } from "@/lib/planner/types";

type PlannerItemMeshProps = {
  item: PlannerPlacedItem;
  isSelected: boolean;
};

const CM_TO_WORLD = 0.01;

function clampDimension(valueCm: number, minimumWorld: number) {
  return Math.max(valueCm * CM_TO_WORLD, minimumWorld);
}

function TaskChairMesh({
  width,
  depth,
  height,
  palette,
}: {
  width: number;
  depth: number;
  height: number;
  palette: ReturnType<typeof getPlannerRenderSpec>["palette"];
}) {
  const seatHeight = Math.max(height * 0.52, 0.28);
  const seatThickness = Math.max(height * 0.08, 0.04);
  const backHeight = Math.max(height * 0.34, 0.22);

  return (
    <group>
      <mesh position={[0, seatHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.76, seatThickness, depth * 0.76]} />
        <meshStandardMaterial color={palette.primary} roughness={0.72} metalness={0.04} />
      </mesh>
      <mesh position={[0, seatHeight + backHeight * 0.42, -depth * 0.26]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.66, backHeight, seatThickness]} />
        <meshStandardMaterial color={palette.secondary} roughness={0.66} metalness={0.04} />
      </mesh>
      <mesh position={[0, seatHeight * 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.025, 0.035, seatHeight, 12]} />
        <meshStandardMaterial color={palette.metal} roughness={0.36} metalness={0.64} />
      </mesh>
      {[0, 72, 144, 216, 288].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <mesh
            key={deg}
            position={[Math.cos(rad) * width * 0.16, 0.04, Math.sin(rad) * depth * 0.16]}
            rotation={[0, rad, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[width * 0.24, 0.02, 0.03]} />
            <meshStandardMaterial color={palette.metal} roughness={0.4} metalness={0.62} />
          </mesh>
        );
      })}
    </group>
  );
}

function LoungeChairMesh({
  width,
  depth,
  height,
  palette,
}: {
  width: number;
  depth: number;
  height: number;
  palette: ReturnType<typeof getPlannerRenderSpec>["palette"];
}) {
  const seatHeight = Math.max(height * 0.44, 0.24);
  const seatThickness = Math.max(height * 0.11, 0.05);

  return (
    <group>
      <mesh position={[0, seatHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.84, seatThickness, depth * 0.78]} />
        <meshStandardMaterial color={palette.primary} roughness={0.76} metalness={0.04} />
      </mesh>
      <mesh position={[0, seatHeight + height * 0.18, -depth * 0.24]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.82, height * 0.26, depth * 0.14]} />
        <meshStandardMaterial color={palette.secondary} roughness={0.72} metalness={0.03} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], index) => (
        <mesh
          key={index}
          position={[sx * width * 0.28, seatHeight * 0.46, sz * depth * 0.22]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.016, 0.02, seatHeight * 0.92, 10]} />
          <meshStandardMaterial color={palette.metal} roughness={0.4} metalness={0.58} />
        </mesh>
      ))}
    </group>
  );
}

function SofaMesh({
  width,
  depth,
  height,
  palette,
}: {
  width: number;
  depth: number;
  height: number;
  palette: ReturnType<typeof getPlannerRenderSpec>["palette"];
}) {
  const seatHeight = Math.max(height * 0.42, 0.2);
  const armWidth = Math.max(width * 0.12, 0.08);

  return (
    <group>
      <mesh position={[0, seatHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height * 0.2, depth * 0.84]} />
        <meshStandardMaterial color={palette.primary} roughness={0.78} metalness={0.04} />
      </mesh>
      <mesh position={[0, seatHeight + height * 0.16, -depth * 0.28]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.92, height * 0.3, depth * 0.14]} />
        <meshStandardMaterial color={palette.secondary} roughness={0.74} metalness={0.03} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 - armWidth / 2), seatHeight + height * 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[armWidth, height * 0.28, depth * 0.72]} />
          <meshStandardMaterial color={palette.secondary} roughness={0.76} metalness={0.03} />
        </mesh>
      ))}
    </group>
  );
}

function RectSurfaceMesh({
  width,
  depth,
  height,
  palette,
  pedestal = false,
}: {
  width: number;
  depth: number;
  height: number;
  palette: ReturnType<typeof getPlannerRenderSpec>["palette"];
  pedestal?: boolean;
}) {
  const topThickness = Math.max(height * 0.06, 0.04);
  const legHeight = Math.max(height - topThickness, 0.42);

  return (
    <group>
      <mesh position={[0, legHeight + topThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, topThickness, depth]} />
        <meshStandardMaterial color={palette.primary} roughness={0.56} metalness={0.08} />
      </mesh>
      {pedestal ? (
        <mesh position={[0, legHeight * 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[width * 0.18, legHeight, depth * 0.14]} />
          <meshStandardMaterial color={palette.accent} roughness={0.44} metalness={0.3} />
        </mesh>
      ) : (
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], index) => (
          <mesh
            key={index}
            position={[sx * width * 0.38, legHeight / 2, sz * depth * 0.34]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.04, legHeight, 0.04]} />
            <meshStandardMaterial color={palette.metal} roughness={0.4} metalness={0.5} />
          </mesh>
        ))
      )}
    </group>
  );
}

function LDeskMesh({
  width,
  depth,
  height,
  palette,
}: {
  width: number;
  depth: number;
  height: number;
  palette: ReturnType<typeof getPlannerRenderSpec>["palette"];
}) {
  const mainWidth = width * 0.68;
  const wingDepth = depth * 0.42;

  return (
    <group>
      <RectSurfaceMesh width={mainWidth} depth={depth} height={height} palette={palette} />
      <group position={[width * 0.16, 0, depth * 0.22]}>
        <RectSurfaceMesh width={width * 0.48} depth={wingDepth} height={height} palette={palette} />
      </group>
    </group>
  );
}

function StorageMesh({
  width,
  depth,
  height,
  palette,
  locker = false,
}: {
  width: number;
  depth: number;
  height: number;
  palette: ReturnType<typeof getPlannerRenderSpec>["palette"];
  locker?: boolean;
}) {
  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={palette.primary} roughness={0.82} metalness={0.04} />
      </mesh>
      <mesh position={[0, height / 2, depth / 2 + 0.006]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.92, height * 0.92, 0.012]} />
        <meshStandardMaterial color={palette.secondary} roughness={0.78} metalness={0.04} />
      </mesh>
      {locker ? (
        <mesh position={[0, height / 2, depth / 2 + 0.014]} castShadow receiveShadow>
          <boxGeometry args={[0.012, height * 0.86, 0.01]} />
          <meshStandardMaterial color={palette.accent} roughness={0.42} metalness={0.56} />
        </mesh>
      ) : null}
    </group>
  );
}

function ScreenMesh({
  width,
  depth,
  height,
  palette,
}: {
  width: number;
  depth: number;
  height: number;
  palette: ReturnType<typeof getPlannerRenderSpec>["palette"];
}) {
  const screenHeight = Math.max(height * 0.72, 0.7);
  const standHeight = Math.max(height - screenHeight, 0.28);

  return (
    <group>
      <mesh position={[0, standHeight + screenHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, screenHeight, Math.max(depth * 0.18, 0.05)]} />
        <meshStandardMaterial color={palette.primary} roughness={0.3} metalness={0.55} />
      </mesh>
      <mesh position={[0, standHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.04, standHeight, 12]} />
        <meshStandardMaterial color={palette.metal} roughness={0.34} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.42, 0.05, depth]} />
        <meshStandardMaterial color={palette.secondary} roughness={0.48} metalness={0.36} />
      </mesh>
    </group>
  );
}

function ColumnMesh({
  width,
  depth,
  height,
  palette,
  round = false,
}: {
  width: number;
  depth: number;
  height: number;
  palette: ReturnType<typeof getPlannerRenderSpec>["palette"];
  round?: boolean;
}) {
  return round ? (
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[Math.min(width, depth) * 0.34, Math.min(width, depth) * 0.34, height, 20]} />
      <meshStandardMaterial color={palette.primary} roughness={0.78} metalness={0.04} />
    </mesh>
  ) : (
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[width * 0.72, height, depth * 0.72]} />
      <meshStandardMaterial color={palette.primary} roughness={0.78} metalness={0.04} />
    </mesh>
  );
}

function PlantMesh({
  width,
  depth,
  height,
  palette,
}: {
  width: number;
  depth: number;
  height: number;
  palette: ReturnType<typeof getPlannerRenderSpec>["palette"];
}) {
  return (
    <group>
      <mesh position={[0, height * 0.16, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[Math.min(width, depth) * 0.16, Math.min(width, depth) * 0.22, height * 0.28, 16]} />
        <meshStandardMaterial color={palette.secondary} roughness={0.74} metalness={0.06} />
      </mesh>
      <mesh position={[0, height * 0.5, 0]} castShadow receiveShadow>
        <sphereGeometry args={[Math.min(width, depth) * 0.26, 18, 18]} />
        <meshStandardMaterial color={palette.primary} roughness={0.88} metalness={0.02} />
      </mesh>
    </group>
  );
}

function renderSemanticMesh(
  item: PlannerPlacedItem,
  dimensions: { width: number; depth: number; height: number },
) {
  const spec = getPlannerRenderSpec(item);

  switch (spec.family) {
    case "task-chair":
      return <TaskChairMesh {...dimensions} palette={spec.palette} />;
    case "lounge-chair":
      return <LoungeChairMesh {...dimensions} palette={spec.palette} />;
    case "sofa":
      return <SofaMesh {...dimensions} palette={spec.palette} />;
    case "desk-l":
      return <LDeskMesh {...dimensions} palette={spec.palette} />;
    case "desk-rect":
      return <RectSurfaceMesh {...dimensions} palette={spec.palette} pedestal={false} />;
    case "table-round":
      return <RectSurfaceMesh {...dimensions} palette={spec.palette} pedestal />;
    case "table-rect":
      return <RectSurfaceMesh {...dimensions} palette={spec.palette} pedestal={false} />;
    case "storage-locker":
      return <StorageMesh {...dimensions} palette={spec.palette} locker />;
    case "storage-cabinet":
      return <StorageMesh {...dimensions} palette={spec.palette} />;
    case "screen":
      return <ScreenMesh {...dimensions} palette={spec.palette} />;
    case "column-round":
      return <ColumnMesh {...dimensions} palette={spec.palette} round />;
    case "column-square":
      return <ColumnMesh {...dimensions} palette={spec.palette} />;
    case "plant":
      return <PlantMesh {...dimensions} palette={spec.palette} />;
    case "door":
    case "window":
    case "utility-box":
    default:
      return <StorageMesh {...dimensions} palette={spec.palette} />;
  }
}

export function PlannerItemMesh({ item, isSelected }: PlannerItemMeshProps) {
  const width = clampDimension(item.widthCm, 0.24);
  const depth = clampDimension(item.depthCm, 0.24);
  const height = clampDimension(item.heightCm, 0.34);
  const x = item.position.x * CM_TO_WORLD + width / 2;
  const z = item.position.z * CM_TO_WORLD + depth / 2;
  const rotationY = (item.rotationDeg * Math.PI) / 180;
  const spec = getPlannerRenderSpec(item);

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      {renderSemanticMesh(item, { width, depth, height })}
      {isSelected ? (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false}>
          <ringGeometry args={[Math.max(width, depth) * 0.4, Math.max(width, depth) * 0.46, 32]} />
          <meshBasicMaterial color={spec.palette.accent} transparent opacity={0.95} />
        </mesh>
      ) : null}
    </group>
  );
}
