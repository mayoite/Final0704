"use client";

import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

interface WorkspacePanelProps {
  id: string;
  side: "left" | "right";
  children: ReactNode;
  onFocus?: () => void;
  isActive?: boolean;
}

/* ─────────────────────────────────────────────
   WorkspacePanel 
   A dedicated abstraction for floating CAD panels.
   Handles drag constraints, z-index elevation, 
   and entry/exit motion physics.
   ───────────────────────────────────────────── */

export function WorkspacePanel({ id, side, children, onFocus, isActive = false }: WorkspacePanelProps) {
  // Use local state fallback for elevation if external manager isn't strictly hooked
  const [localZ, setLocalZ] = useState(isActive ? 60 : 50);

  const handlePointerDown = () => {
    setLocalZ(60);
    if (onFocus) onFocus();
  };

  return (
    <motion.div
      id={id}
      drag
      dragMomentum={false}
      dragElastic={0}
      onPointerDown={handlePointerDown}
      onPointerUp={() => setLocalZ(50)}
      style={{ zIndex: isActive ? 60 : localZ }}
      className={`absolute top-4 ${
        side === "left" ? "left-4" : "right-4"
      } w-min-panel shadow-theme-float rounded-xl cursor-grab active:cursor-grabbing bg-panel border border-theme-soft overflow-hidden`}
      initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: side === "left" ? -20 : 20 }}
    >
      <div className="h-smartdraw-panel pointer-events-auto flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}
