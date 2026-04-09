import type { PlannerPoint2D, PlannerRoom, PlannerWall } from "@/lib/planner/types";

export function isSamePlannerPoint(
  a: PlannerPoint2D | undefined,
  b: PlannerPoint2D | undefined,
) {
  return !!a && !!b && a.x === b.x && a.y === b.y;
}

export function polygonAreaSqM(points: PlannerPoint2D[]) {
  if (points.length < 3) {
    return undefined;
  }

  let sum = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    sum += current.x * next.y - next.x * current.y;
  }

  return Math.abs(sum / 2) / 10000;
}

export function outlineFromWalls(walls: PlannerWall[]) {
  if (walls.length === 0) {
    return [];
  }

  const remaining = [...walls];
  const firstWall = remaining.shift();

  if (!firstWall) {
    return [];
  }

  const outline: PlannerPoint2D[] = [{ ...firstWall.start }, { ...firstWall.end }];

  while (remaining.length > 0) {
    const lastPoint = outline.at(-1);

    if (!lastPoint) {
      break;
    }

    const nextWallIndex = remaining.findIndex(
      (wall) =>
        isSamePlannerPoint(wall.start, lastPoint) ||
        isSamePlannerPoint(wall.end, lastPoint),
    );

    if (nextWallIndex === -1) {
      break;
    }

    const [nextWall] = remaining.splice(nextWallIndex, 1);
    const nextPoint = isSamePlannerPoint(nextWall.start, lastPoint)
      ? nextWall.end
      : nextWall.start;

    if (!isSamePlannerPoint(nextPoint, lastPoint)) {
      outline.push({ ...nextPoint });
    }
  }

  if (outline.length > 1 && isSamePlannerPoint(outline[0], outline.at(-1))) {
    outline.pop();
  }

  return outline.length >= 3 ? outline : [];
}

export function roomsFromWalls(walls: PlannerWall[]): PlannerRoom[] {
  const outline = outlineFromWalls(walls);

  if (outline.length < 3) {
    return [];
  }

  return [
    {
      id: "room-1",
      name: "Workspace",
      outline,
      areaSqM: polygonAreaSqM(outline),
    },
  ];
}
