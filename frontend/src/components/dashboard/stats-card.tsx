import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subText?: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  subText,
  trend,
}: StatsCardProps) {
  return (
    <div className="glass-elevated rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {label}
          </p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">{value}</h3>
          {subText && (
            <p className="text-muted-foreground mt-1 text-xs">{subText}</p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={`text-xs font-semibold ${
              trend.direction === "up" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground text-xs">vs tuần trước</span>
        </div>
      )}
    </div>
  );
}
