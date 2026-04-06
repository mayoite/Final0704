import clsx from "clsx";

export interface ClientBadgeData {
  name: string;
  sector: string;
  location?: string;
}

interface ClientBadgeProps extends ClientBadgeData {
  featured?: boolean;
}

const SECTOR_COLORS: Record<string, string> = {
  Government: "bg-hover text-brand border-accent",
  Finance: "bg-success-soft text-success border-success",
  Manufacturing: "bg-warning-soft text-warning border-warning",
  Energy: "bg-soft text-body border-muted",
  FMCG: "bg-soft text-body border-muted",
  Automotive: "bg-hover text-brand border-accent",
  "NGO / UN": "bg-soft text-body border-muted",
  Education: "bg-hover text-brand border-accent",
  Technology: "bg-hover text-brand border-accent",
  Telecom: "bg-soft text-body border-muted",
  Corporate: "bg-hover text-muted border-soft",
};

export function ClientBadge({
  name,
  sector,
  location,
  featured = false,
}: ClientBadgeProps) {
  const sectorStyle =
    SECTOR_COLORS[sector] ?? "bg-hover text-muted border-soft";

  return (
    <div
      className={clsx(
        "flex flex-col justify-between p-5 border border-soft bg-panel",
        "hover:border-strong hover:shadow-sm transition-all duration-200 group",
        featured && "border-muted",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-4">
        <span
          className={clsx(
            "typ-overline inline-block px-2 py-1 rounded-sm border",
            sectorStyle,
          )}
        >
          {sector}
        </span>
      </div>
      <div>
        <h3 className="text-base font-semibold text-strong group-hover:text-body transition-colors leading-tight">
          {name}
        </h3>
        {location && (
          <p className="scheme-text-muted text-xs mt-1 font-medium">{location}</p>
        )}
      </div>
    </div>
  );
}

