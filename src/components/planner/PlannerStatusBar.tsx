import { PenTool, Move, StretchHorizontal, Info } from "lucide-react";

interface PlannerStatusBarProps {
  status: string;
}

export function PlannerStatusBar({ status }: PlannerStatusBarProps) {
  const getIcon = () => {
    if (status.includes("(D)"))
      return <PenTool className="h-3.5 w-3.5 text-[var(--planner-accent)]" />;
    if (status.includes("(V)"))
      return <Move className="h-3.5 w-3.5 text-[var(--text-strong)]" />;
    if (status.includes("(S)"))
      return <StretchHorizontal className="h-3.5 w-3.5 text-subtle" />;
    return <Info className="h-3.5 w-3.5 text-subtle" />;
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="absolute bottom-6 left-6 z-10 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-full border border-soft bg-[var(--planner-status-bg)] px-4 py-2.5 text-[11px] font-bold tracking-wider text-[var(--planner-status-text)] uppercase shadow-theme-panel md:bottom-8 md:left-8 md:max-w-[560px]"
    >
      <div className="flex items-center gap-2 border-r border-soft pr-2">
        <span className="flex h-2 w-2 animate-pulse rounded-full bg-[var(--planner-accent)]" />
        {getIcon()}
      </div>
      <span className="min-w-0 truncate">{status}</span>
    </div>
  );
}
