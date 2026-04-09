import type { PlannerPoint2D } from "@/lib/planner/types";

type PlannerGridProps = {
  width: number;
  height: number;
  stepPx: number;
  project: (point: PlannerPoint2D) => PlannerPoint2D;
  minPoint: PlannerPoint2D;
  maxPoint: PlannerPoint2D;
};

function getGridStart(value: number, step: number) {
  return Math.floor(value / step) * step;
}

export function PlannerGrid({
  width,
  height,
  stepPx,
  project,
  minPoint,
  maxPoint,
}: PlannerGridProps) {
  const minorStep = Math.max(Math.round(stepPx / 2), 50);
  const minorStartX = getGridStart(minPoint.x, minorStep);
  const minorStartY = getGridStart(minPoint.y, minorStep);
  const xCount =
    Math.floor((maxPoint.x + minorStep - minorStartX) / minorStep) + 1;
  const yCount =
    Math.floor((maxPoint.y + minorStep - minorStartY) / minorStep) + 1;

  return (
    <g data-planner-grid width={width} height={height} pointerEvents="none">
      {Array.from({ length: xCount }, (_, index) => {
        const x = minorStartX + index * minorStep;
        const projectedStart = project({ x, y: minPoint.y });
        const projectedEnd = project({ x, y: maxPoint.y });
        const isMajor = x % stepPx === 0;

        return (
          <line
            key={`grid-x-${x}`}
            x1={projectedStart.x}
            y1={projectedStart.y}
            x2={projectedEnd.x}
            y2={projectedEnd.y}
            stroke={
              isMajor
                ? "var(--planner-grid-major, var(--border-muted))"
                : "var(--planner-grid-minor, var(--border-soft))"
            }
            strokeWidth={isMajor ? "1" : "0.5"}
          />
        );
      })}
      {Array.from({ length: yCount }, (_, index) => {
        const y = minorStartY + index * minorStep;
        const projectedStart = project({ x: minPoint.x, y });
        const projectedEnd = project({ x: maxPoint.x, y });
        const isMajor = y % stepPx === 0;

        return (
          <line
            key={`grid-y-${y}`}
            x1={projectedStart.x}
            y1={projectedStart.y}
            x2={projectedEnd.x}
            y2={projectedEnd.y}
            stroke={
              isMajor
                ? "var(--planner-grid-major, var(--border-muted))"
                : "var(--planner-grid-minor, var(--border-soft))"
            }
            strokeWidth={isMajor ? "1" : "0.5"}
          />
        );
      })}
    </g>
  );
}
