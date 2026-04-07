"use client";

import { motion, useDragControls } from "framer-motion";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useState } from "react";

interface WorkspacePanelProps {
  id: string;
  side: "left" | "right";
  children: ReactNode;
  onFocus?: () => void;
  isActive?: boolean;
  docked?: boolean;
  offsetPx?: number;
  topPx?: number;
}

/* ─────────────────────────────────────────────
   WorkspacePanel 
   A dedicated abstraction for floating CAD panels.
   Handles drag constraints, z-index elevation, 
   and entry/exit motion physics.
   ───────────────────────────────────────────── */

export function WorkspacePanel({
  id,
  side,
  children,
  onFocus,
  isActive = false,
  docked = false,
  offsetPx = 0,
  topPx = 16,
}: WorkspacePanelProps) {
  // Use local state fallback for elevation if external manager isn't strictly hooked
  const [localZ, setLocalZ] = useState(isActive ? 60 : 50);
  const dragControls = useDragControls();

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    setLocalZ(60);
    if (onFocus) onFocus();
    if (docked || event.button !== 0) return;

    const target = event.target as HTMLElement | null;
    if (!target?.closest('[data-panel-drag-handle="true"]')) return;

    dragControls.start(event);
  };

  return (
    <motion.div
      id={id}
      drag={!docked}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onPointerDown={handlePointerDown}
      onPointerUp={() => {
        if (!docked) setLocalZ(50);
      }}
      style={{
        zIndex: isActive ? 60 : localZ,
        ...(docked ? { [side]: offsetPx, top: 0, bottom: 0 } : { [side]: 16 + offsetPx, top: topPx }),
      }}
      className={
        docked
          ? `absolute ${
              side === "left" ? "rounded-r-xl border-r" : "rounded-l-xl border-l"
            } w-min-panel shadow-theme-float bg-panel border-theme-soft overflow-hidden backdrop-blur-xl`
          : `absolute w-min-panel shadow-theme-float rounded-[1.4rem] cursor-grab active:cursor-grabbing bg-panel border border-theme-soft overflow-hidden backdrop-blur-xl`
      }
      initial={{ opacity: 0, x: docked ? 0 : side === "left" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: docked ? 0 : side === "left" ? -20 : 20 }}
    >
      <div className={`${docked ? "h-full" : "h-smartdraw-panel"} pointer-events-auto flex flex-col`}>
        {children}
      </div>
    </motion.div>
  );
}
