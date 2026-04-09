import type {
  PlannerPoint2D,
  PlannerRoom,
  PlannerSceneSelection,
  PlannerWall,
} from "@/lib/planner/types";

type PlannerSelectionLayerProps = {
  rooms: PlannerRoom[];
  walls: PlannerWall[];
  sceneSelection: PlannerSceneSelection;
  project: (point: PlannerPoint2D) => PlannerPoint2D;
};

export function PlannerSelectionLayer({
  rooms,
  sceneSelection,
  project,
}: PlannerSelectionLayerProps) {
  if (sceneSelection?.kind === "wall") {
    return null;
  }

  if (sceneSelection?.kind !== "room") {
    return null;
  }

  const room = rooms[0];

  if (!room) {
    return null;
  }

  const points = room.outline
    .map((point) => {
      const projected = project(point);
      return `${projected.x},${projected.y}`;
    })
    .join(" ");
  const projectedCorners = room.outline.map((point) => project(point));

  return (
    <g data-planner-selection-layer>
      <polygon
        points={points}
        fill="var(--surface-accent-wash)"
        fillOpacity="0.28"
        stroke="var(--text-subtle)"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      {projectedCorners.map((corner, index) => (
        <g key={index}>
          <circle
            cx={corner.x}
            cy={corner.y}
            r="4"
            fill="var(--surface-panel)"
            stroke="var(--text-subtle)"
            strokeWidth="1.5"
          />
          <circle
            cx={corner.x}
            cy={corner.y}
            r="1.5"
            fill="var(--text-subtle)"
          />
        </g>
      ))}
    </g>
  );
}
