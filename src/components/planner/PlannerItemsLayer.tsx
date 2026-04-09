import { useState } from "react";

import { getPlannerRenderSpec } from "@/lib/planner/rendering";
import type { PlannerPlacedItem, PlannerPoint2D } from "@/lib/planner/types";

type PlannerItemsLayerProps = {
  items: PlannerPlacedItem[];
  selectedItemId: string | null;
  project: (point: PlannerPoint2D) => PlannerPoint2D;
  scale: number;
  interactive?: boolean;
  onSelectItem?: (itemId: string) => void;
  onStartDrag?: (
    itemId: string,
    pointerPosition: { clientX: number; clientY: number },
  ) => void;
};

function getLabelMetrics(name: string, width: number) {
  const text = name.trim();
  const label = text.length > 20 ? `${text.slice(0, 20)}...` : text;
  const estimatedWidth = Math.max(68, Math.min(width, label.length * 6.4 + 20));

  return {
    label,
    width: estimatedWidth,
  };
}

function handlePrimaryPointerDown(
  event: React.PointerEvent<SVGRectElement>,
  itemId: string,
  onStartDrag?: (
    itemId: string,
    pointerPosition: { clientX: number; clientY: number },
  ) => void,
) {
  if (event.button !== 0) {
    return;
  }

  onStartDrag?.(itemId, {
    clientX: event.clientX,
    clientY: event.clientY,
  });
}

function renderFootprint(
  item: PlannerPlacedItem,
  width: number,
  height: number,
  isSelected: boolean,
) {
  const spec = getPlannerRenderSpec(item);
  const palette = spec.palette;
  const outline = isSelected ? "var(--planner-selection)" : palette.outline;
  const selectionStrokeWidth = isSelected ? 2.4 : 1.25;

  switch (spec.family) {
    case "task-chair":
      return (
        <g pointerEvents="none">
          <ellipse
            cx="0"
            cy="2"
            rx={width * 0.28}
            ry={height * 0.22}
            fill={palette.primary}
            stroke={outline}
            strokeWidth={selectionStrokeWidth}
          />
          <rect
            x={-width * 0.24}
            y={-height * 0.36}
            width={width * 0.48}
            height={height * 0.2}
            rx={Math.min(width, height) * 0.12}
            fill={palette.secondary}
            stroke={outline}
            strokeWidth="1"
          />
          <circle
            cx="0"
            cy={height * 0.18}
            r={Math.max(Math.min(width, height) * 0.05, 2.2)}
            fill={palette.metal}
          />
          {[
            [0, height * 0.18, 0, height * 0.32],
            [0, height * 0.18, width * 0.18, height * 0.3],
            [0, height * 0.18, -width * 0.18, height * 0.3],
            [0, height * 0.18, width * 0.16, height * 0.08],
            [0, height * 0.18, -width * 0.16, height * 0.08],
          ].map(([x1, y1, x2, y2], index) => (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={palette.metal}
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          ))}
        </g>
      );

    case "lounge-chair":
      return (
        <g pointerEvents="none">
          <rect
            x={-width * 0.34}
            y={-height * 0.16}
            width={width * 0.68}
            height={height * 0.42}
            rx={Math.min(width, height) * 0.18}
            fill={palette.primary}
            stroke={outline}
            strokeWidth={selectionStrokeWidth}
          />
          <rect
            x={-width * 0.3}
            y={-height * 0.42}
            width={width * 0.6}
            height={height * 0.2}
            rx={Math.min(width, height) * 0.16}
            fill={palette.secondary}
            stroke={outline}
            strokeWidth="1"
          />
          <line
            x1={-width * 0.28}
            y1={height * 0.26}
            x2={-width * 0.18}
            y2={height * 0.44}
            stroke={palette.metal}
            strokeWidth="1.4"
          />
          <line
            x1={width * 0.28}
            y1={height * 0.26}
            x2={width * 0.18}
            y2={height * 0.44}
            stroke={palette.metal}
            strokeWidth="1.4"
          />
        </g>
      );

    case "sofa":
      return (
        <g pointerEvents="none">
          <rect
            x={-width / 2}
            y={-height * 0.28}
            width={width}
            height={height * 0.56}
            rx={Math.min(width, height) * 0.18}
            fill={palette.primary}
            stroke={outline}
            strokeWidth={selectionStrokeWidth}
          />
          <rect
            x={-width * 0.38}
            y={-height * 0.12}
            width={width * 0.76}
            height={height * 0.28}
            rx={Math.min(width, height) * 0.14}
            fill={palette.secondary}
            opacity="0.9"
          />
          <line
            x1="0"
            y1={-height * 0.24}
            x2="0"
            y2={height * 0.24}
            stroke={outline}
            strokeOpacity="0.25"
            strokeWidth="1"
          />
        </g>
      );

    case "desk-l":
      return (
        <g pointerEvents="none">
          <path
            d={`
              M ${-width / 2} ${-height / 2}
              L ${width * 0.15} ${-height / 2}
              L ${width * 0.15} ${-height * 0.08}
              L ${width / 2} ${-height * 0.08}
              L ${width / 2} ${height / 2}
              L ${-width / 2} ${height / 2}
              Z
            `}
            fill={palette.primary}
            stroke={outline}
            strokeWidth={selectionStrokeWidth}
            strokeLinejoin="round"
          />
          <circle
            cx={-width * 0.34}
            cy={-height * 0.34}
            r={Math.max(Math.min(width, height) * 0.035, 2)}
            fill={palette.metal}
          />
          <circle
            cx={width * 0.34}
            cy={height * 0.34}
            r={Math.max(Math.min(width, height) * 0.035, 2)}
            fill={palette.metal}
          />
        </g>
      );

    case "desk-rect":
    case "table-rect":
      return (
        <g pointerEvents="none">
          <rect
            x={-width / 2}
            y={-height / 2}
            width={width}
            height={height}
            rx={Math.min(width, height) * 0.1}
            fill={palette.primary}
            stroke={outline}
            strokeWidth={selectionStrokeWidth}
          />
          <rect
            x={-width * 0.28}
            y={-height * 0.08}
            width={width * 0.56}
            height={height * 0.16}
            rx={Math.min(width, height) * 0.05}
            fill={palette.secondary}
            opacity="0.72"
          />
          {[
            [-width * 0.38, -height * 0.34],
            [width * 0.38, -height * 0.34],
            [-width * 0.38, height * 0.34],
            [width * 0.38, height * 0.34],
          ].map(([x, y], index) => (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={Math.max(Math.min(width, height) * 0.03, 2)}
              fill={palette.metal}
            />
          ))}
        </g>
      );

    case "table-round":
      return (
        <g pointerEvents="none">
          <ellipse
            cx="0"
            cy="0"
            rx={width * 0.42}
            ry={height * 0.42}
            fill={palette.primary}
            stroke={outline}
            strokeWidth={selectionStrokeWidth}
          />
          <circle
            cx="0"
            cy="0"
            r={Math.max(Math.min(width, height) * 0.08, 3)}
            fill={palette.metal}
          />
          <line
            x1="0"
            y1={-height * 0.24}
            x2="0"
            y2={height * 0.24}
            stroke={palette.secondary}
            strokeWidth="1.2"
          />
          <line
            x1={-width * 0.24}
            y1="0"
            x2={width * 0.24}
            y2="0"
            stroke={palette.secondary}
            strokeWidth="1.2"
          />
        </g>
      );

    case "storage-locker":
      return (
        <g pointerEvents="none">
          <rect
            x={-width / 2}
            y={-height / 2}
            width={width}
            height={height}
            rx={Math.min(width, height) * 0.08}
            fill={palette.primary}
            stroke={outline}
            strokeWidth={selectionStrokeWidth}
          />
          <line
            x1="0"
            y1={-height * 0.44}
            x2="0"
            y2={height * 0.44}
            stroke={palette.accent}
            strokeWidth="1.2"
          />
          <circle
            cx={-width * 0.16}
            cy="0"
            r={Math.max(Math.min(width, height) * 0.03, 2)}
            fill={palette.secondary}
          />
          <circle
            cx={width * 0.16}
            cy="0"
            r={Math.max(Math.min(width, height) * 0.03, 2)}
            fill={palette.secondary}
          />
        </g>
      );

    case "storage-cabinet":
      return (
        <g pointerEvents="none">
          <rect
            x={-width / 2}
            y={-height / 2}
            width={width}
            height={height}
            rx={Math.min(width, height) * 0.08}
            fill={palette.primary}
            stroke={outline}
            strokeWidth={selectionStrokeWidth}
          />
          <rect
            x={-width * 0.36}
            y={-height * 0.36}
            width={width * 0.72}
            height={height * 0.72}
            rx={Math.min(width, height) * 0.05}
            fill={palette.secondary}
            opacity="0.7"
          />
        </g>
      );

    case "screen":
      return (
        <g pointerEvents="none">
          <rect
            x={-width * 0.42}
            y={-height * 0.26}
            width={width * 0.84}
            height={height * 0.42}
            rx={Math.min(width, height) * 0.08}
            fill={palette.primary}
            stroke={outline}
            strokeWidth={selectionStrokeWidth}
          />
          <line
            x1="0"
            y1={height * 0.14}
            x2="0"
            y2={height * 0.32}
            stroke={palette.metal}
            strokeWidth="1.4"
          />
          <line
            x1={-width * 0.16}
            y1={height * 0.32}
            x2={width * 0.16}
            y2={height * 0.32}
            stroke={palette.secondary}
            strokeWidth="1.4"
          />
        </g>
      );

    case "column-round":
      return (
        <g pointerEvents="none">
          <circle
            cx="0"
            cy="0"
            r={Math.min(width, height) * 0.34}
            fill={palette.primary}
            stroke={outline}
            strokeWidth={selectionStrokeWidth}
          />
          <circle
            cx="0"
            cy="0"
            r={Math.min(width, height) * 0.16}
            fill={palette.secondary}
            opacity="0.72"
          />
        </g>
      );

    case "column-square":
      return (
        <g pointerEvents="none">
          <rect
            x={-width * 0.32}
            y={-height * 0.32}
            width={width * 0.64}
            height={height * 0.64}
            rx={Math.min(width, height) * 0.1}
            fill={palette.primary}
            stroke={outline}
            strokeWidth={selectionStrokeWidth}
          />
        </g>
      );

    case "plant":
      return (
        <g pointerEvents="none">
          <circle
            cx="0"
            cy={-height * 0.08}
            r={Math.min(width, height) * 0.24}
            fill={palette.primary}
            stroke={outline}
            strokeWidth={selectionStrokeWidth}
          />
          <rect
            x={-width * 0.12}
            y={height * 0.06}
            width={width * 0.24}
            height={height * 0.16}
            rx={Math.min(width, height) * 0.04}
            fill={palette.secondary}
          />
        </g>
      );

    case "door":
    case "window":
    case "utility-box":
    default:
      return (
        <g pointerEvents="none">
          <rect
            x={-width / 2}
            y={-height / 2}
            width={width}
            height={height}
            rx={Math.min(width, height) * 0.12}
            fill={palette.primary}
            stroke={outline}
            strokeWidth={selectionStrokeWidth}
          />
          <rect
            x={-width * 0.24}
            y={-height * 0.12}
            width={width * 0.48}
            height={height * 0.24}
            rx={Math.min(width, height) * 0.06}
            fill={palette.secondary}
            opacity="0.62"
          />
        </g>
      );
  }
}

export function PlannerItemsLayer({
  items,
  selectedItemId,
  project,
  scale,
  interactive = false,
  onSelectItem,
  onStartDrag,
}: PlannerItemsLayerProps) {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  return (
    <g data-planner-items-layer>
      {items.map((item) => {
        const topLeft = project({ x: item.position.x, y: item.position.z });
        const width = Math.max(16, item.widthCm * scale);
        const height = Math.max(16, item.depthCm * scale);
        const centerX = topLeft.x + width / 2;
        const centerY = topLeft.y + height / 2;
        const isSelected = selectedItemId === item.id;
        const isHovered = hoveredItemId === item.id;
        const showLabel = isSelected || isHovered;
        const spec = getPlannerRenderSpec(item);
        const labelMetrics = getLabelMetrics(item.name, Math.max(width - 8, 86));
        const labelX = centerX - labelMetrics.width / 2;
        const labelY = Math.max(topLeft.y - 30, 8);

        return (
          <g key={item.id}>
            <g transform={`translate(${centerX} ${centerY}) rotate(${item.rotationDeg})`}>
              {renderFootprint(item, width, height, isSelected)}
              <rect
                x={-width / 2}
                y={-height / 2}
                width={width}
                height={height}
                rx={Math.min(width, height) * 0.12}
                fill="transparent"
                onClick={interactive ? () => onSelectItem?.(item.id) : undefined}
                onPointerEnter={() => setHoveredItemId(item.id)}
                onPointerLeave={() =>
                  setHoveredItemId((current) => (current === item.id ? null : current))
                }
                onPointerDown={
                  interactive
                    ? (event) => handlePrimaryPointerDown(event, item.id, onStartDrag)
                    : undefined
                }
                style={interactive ? { cursor: "grab" } : undefined}
              />
            </g>
            {showLabel ? (
              <g pointerEvents="none">
                <rect
                  x={labelX}
                  y={labelY}
                  width={labelMetrics.width}
                  height="20"
                  rx="8"
                  fill={isSelected ? "var(--planner-selection)" : spec.palette.labelFill}
                  stroke={isSelected ? "var(--border-inverse)" : spec.palette.outline}
                  strokeWidth="1"
                />
                <text
                  x={labelX + 8}
                  y={labelY + 13}
                  fontSize="10"
                  fontWeight="600"
                  fill={isSelected ? "var(--planner-selection-text)" : spec.palette.labelText}
                >
                  {labelMetrics.label}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}
