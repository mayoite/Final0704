import { Button } from "@/components/ui/Button";
import type { PlannerPresetKey } from "./types";

const PRESETS: { key: PlannerPresetKey; label: string; title: string }[] = [
  {
    key: "focus-four",
    label: "Focus 4",
    title: "4 workstations with chairs in a focus configuration",
  },
  {
    key: "meeting-six",
    label: "Meeting 6",
    title: "Conference table with 6 chairs",
  },
  {
    key: "lounge-pair",
    label: "Lounge Pair",
    title: "2 lounge chairs with a coffee table",
  },
];

interface PlannerPresetsProps {
  engineOnline: boolean;
  onApplyPreset: (preset: PlannerPresetKey) => void;
}

export function PlannerPresets({
  engineOnline,
  onApplyPreset,
}: PlannerPresetsProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 text-[11px] font-semibold tracking-[0.05em] text-subtle">
        Layouts
      </span>
      {PRESETS.map((preset) => (
        <Button
          key={preset.key}
          size="sm"
          variant="ghost"
          className="h-8 rounded-md px-2.5 text-xs text-strong hover:bg-hover"
          disabled={!engineOnline}
          title={preset.title}
          onClick={() => onApplyPreset(preset.key)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
