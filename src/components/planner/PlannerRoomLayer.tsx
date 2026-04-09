import type {
  PlannerPoint2D,
  PlannerRoom,
  PlannerWall,
} from "@/lib/planner/types";
import { formatLengthPair } from "@/lib/planner/units";

type PlannerRoomLayerProps = {
  rooms: PlannerRoom[];
  walls: PlannerWall[];
  project: (point: PlannerPoint2D) => PlannerPoint2D;
  onSelectRoom?: () => void;
  selectedWallId?: string | null;
  showRoomMeasurements?: boolean;
  interactive?: boolean;
  onSelectWall?: (wallId: string) => void;
  onStartDragWall?: (wallId: string) => void;
};

function getDimensionPillWidth(label: string, minWidth = 92) {
  return Math.max(minWidth, Math.ceil(label.length * 6.8 + 26));
}

function renderWallHandleIcon(
  midX: number,
  midY: number,
  isVertical: boolean,
  isSelected: boolean,
) {
  const stroke = isSelected ? "var(--planner-selection-text)" : "var(--surface-panel)";

  if (isVertical) {
    return (
      <g pointerEvents="none">
        <line
          x1={midX - 6}
          y1={midY}
          x2={midX + 6}
          y2={midY}
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d={`M ${midX - 6} ${midY} L ${midX - 2} ${midY - 3} M ${midX - 6} ${midY} L ${midX - 2} ${midY + 3}`}
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d={`M ${midX + 6} ${midY} L ${midX + 2} ${midY - 3} M ${midX + 6} ${midY} L ${midX + 2} ${midY + 3}`}
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
    );
  }

  return (
    <g pointerEvents="none">
      <line
        x1={midX}
        y1={midY - 6}
        x2={midX}
        y2={midY + 6}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d={`M ${midX} ${midY - 6} L ${midX - 3} ${midY - 2} M ${midX} ${midY - 6} L ${midX + 3} ${midY - 2}`}
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d={`M ${midX} ${midY + 6} L ${midX - 3} ${midY + 2} M ${midX} ${midY + 6} L ${midX + 3} ${midY + 2}`}
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </g>
  );
}

export function PlannerRoomLayer({
  rooms,
  walls,
  project,
  onSelectRoom,
  selectedWallId,
  showRoomMeasurements = false,
  interactive = false,
  onSelectWall,
  onStartDragWall,
}: PlannerRoomLayerProps) {
  return (
    <g data-planner-room-layer>
      {rooms.map((room) => {
        const projectedPoints = room.outline.map((point) => project(point));
        const points = projectedPoints
          .map((point) => `${point.x},${point.y}`)
          .join(" ");
        const roomMinX = Math.min(...room.outline.map((point) => point.x));
        const roomMinY = Math.min(...room.outline.map((point) => point.y));
        const roomMaxX = Math.max(...room.outline.map((point) => point.x));
        const roomMaxY = Math.max(...room.outline.map((point) => point.y));
        const minX = Math.min(...projectedPoints.map((point) => point.x));
        const minY = Math.min(...projectedPoints.map((point) => point.y));
        const maxX = Math.max(...projectedPoints.map((point) => point.x));
        const maxY = Math.max(...projectedPoints.map((point) => point.y));
        const topGuideY = minY - 32;
        const leftGuideX = minX - 32;
        const roomWidthLabel = formatLengthPair(roomMaxX - roomMinX);
        const roomHeightLabel = formatLengthPair(roomMaxY - roomMinY);
        const topPillWidth = getDimensionPillWidth(roomWidthLabel, 100);
        const sidePillWidth = getDimensionPillWidth(roomHeightLabel, 100);

        return (
          <g key={room.id} className="planner-room">
            <defs>
              <linearGradient
                id={`room-fill-${room.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopOpacity="0.8"
                  style={{
                    stopColor:
                      "var(--planner-room-fill-top, var(--surface-panel, #ffffff))",
                  }}
                />
                <stop
                  offset="100%"
                  stopOpacity="0.8"
                  style={{
                    stopColor:
                      "var(--planner-room-fill-bottom, var(--surface-soft, #f5f7fa))",
                  }}
                />
              </linearGradient>
            </defs>
            <polygon
              points={points}
              fill={`url(#room-fill-${room.id})`}
              stroke="var(--planner-room-stroke)"
              strokeWidth="1"
              onClick={onSelectRoom}
              className="transition-colors hover:stroke-zinc-600 cursor-cell"
            />

            {showRoomMeasurements ? (
              <g pointerEvents="none">
                {/* Horizontal Guide */}
                <line
                  x1={minX}
                  y1={topGuideY}
                  x2={maxX}
                  y2={topGuideY}
                  stroke="var(--planner-guide-line)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <line
                  x1={minX}
                  y1={topGuideY - 6}
                  x2={minX}
                  y2={topGuideY + 6}
                  stroke="var(--planner-guide-line)"
                  strokeWidth="1"
                />
                <line
                  x1={maxX}
                  y1={topGuideY - 6}
                  x2={maxX}
                  y2={topGuideY + 6}
                  stroke="var(--planner-guide-line)"
                  strokeWidth="1"
                />
                <rect
                  x={(minX + maxX) / 2 - topPillWidth / 2}
                  y={topGuideY - 12}
                  width={topPillWidth}
                  height="24"
                  rx="6"
                  fill="var(--surface-panel)"
                  stroke="var(--planner-room-stroke)"
                  strokeWidth="1"
                />
                <text
                  x={(minX + maxX) / 2}
                  y={topGuideY + 4}
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                  fill="var(--planner-room-text)"
                  className="font-mono uppercase tracking-tighter"
                >
                  {roomWidthLabel}
                </text>

                {/* Vertical Guide */}
                <line
                  x1={leftGuideX}
                  y1={minY}
                  x2={leftGuideX}
                  y2={maxY}
                  stroke="var(--planner-guide-line)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <line
                  x1={leftGuideX - 6}
                  y1={minY}
                  x2={leftGuideX + 6}
                  y2={minY}
                  stroke="var(--planner-guide-line)"
                  strokeWidth="1"
                />
                <line
                  x1={leftGuideX - 6}
                  y1={maxY}
                  x2={leftGuideX + 6}
                  y2={maxY}
                  stroke="var(--planner-guide-line)"
                  strokeWidth="1"
                />
                <g
                  transform={`translate(${leftGuideX} ${(minY + maxY) / 2}) rotate(-90)`}
                >
                  <rect
                    x={-sidePillWidth / 2}
                    y="-12"
                    width={sidePillWidth}
                    height="24"
                    rx="6"
                    fill="var(--surface-panel)"
                    stroke="var(--planner-room-stroke)"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="4"
                    fontSize="10"
                    fontWeight="900"
                    textAnchor="middle"
                    fill="var(--planner-room-text)"
                    className="font-mono uppercase tracking-tighter"
                  >
                    {roomHeightLabel}
                  </text>
                </g>
              </g>
            ) : null}
          </g>
        );
      })}

      {walls.map((wall) => {
        const start = project(wall.start);
        const end = project(wall.end);
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const isVertical =
          Math.abs(wall.start.x - wall.end.x) <=
          Math.abs(wall.start.y - wall.end.y);
        const isSelected = selectedWallId === wall.id;
        const wallLengthCm = Math.hypot(
          wall.end.x - wall.start.x,
          wall.end.y - wall.start.y,
        );
        const wallLabel = formatLengthPair(wallLengthCm);
        const wallPillWidth = getDimensionPillWidth(wallLabel, 100);
        const pillOffsetX = isVertical ? 28 : 0;
        const pillOffsetY = isVertical ? -40 : -30;

        return (
          <g key={wall.id}>
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={isSelected ? "var(--planner-wall-hit)" : "var(--planner-wall-stroke)"}
              strokeWidth={isSelected ? "6" : "8"}
              strokeOpacity={isSelected ? "0.7" : "1"}
              strokeLinecap="round"
              pointerEvents="none"
            />
            <line
              data-planner-wall-hit
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={
                isSelected
                  ? "var(--planner-selection)"
                  : "var(--planner-wall-hit)"
              }
              strokeWidth={isSelected ? "3" : "2"}
              strokeLinecap="round"
              pointerEvents={onSelectRoom ? "stroke" : "none"}
              cursor={
                interactive
                  ? isVertical
                    ? "ew-resize"
                    : "ns-resize"
                  : "pointer"
              }
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.stopPropagation();
                onSelectWall?.(wall.id);
                onStartDragWall?.(wall.id);
              }}
              className="transition-all"
            />

            <g
              data-planner-wall-hit
              cursor={
                interactive
                  ? isVertical
                    ? "ew-resize"
                    : "ns-resize"
                  : "pointer"
              }
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.stopPropagation();
                onSelectWall?.(wall.id);
                onStartDragWall?.(wall.id);
              }}
            >
              <circle
                cx={midX}
                cy={midY}
                r={isSelected ? 9 : 8}
                fill={
                  isSelected
                    ? "var(--planner-selection)"
                    : "var(--planner-wall-stroke)"
                }
                stroke={
                  isSelected
                    ? "var(--planner-selection-text)"
                    : "var(--planner-wall-hit)"
                }
                strokeWidth="1.5"
                className="transition-all"
              />
              {renderWallHandleIcon(midX, midY, isVertical, isSelected)}
            </g>

            {isSelected && (
              <g pointerEvents="none">
                <rect
                  x={midX + pillOffsetX - wallPillWidth / 2}
                  y={midY + pillOffsetY - 12}
                  width={wallPillWidth}
                  height="24"
                  rx="8"
                  fill="var(--surface-panel)"
                  fillOpacity="0.96"
                  stroke="var(--planner-selection)"
                  strokeWidth="1.5"
                />
                <text
                  x={midX + pillOffsetX}
                  y={midY + pillOffsetY + 4}
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                  fill="var(--planner-selection)"
                  className="font-mono uppercase tracking-tighter"
                >
                  {wallLabel}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
