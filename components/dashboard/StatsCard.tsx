import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  color?: "blue" | "green" | "amber" | "red";
}

const colorMap = {
  blue:  { bg: "bg-blue-50",  icon: "text-blue-600",  badge: "bg-blue-100 text-blue-700"  },
  green: { bg: "bg-green-50", icon: "text-green-600", badge: "bg-green-100 text-green-700" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
  red:   { bg: "bg-red-50",   icon: "text-red-600",   badge: "bg-red-100 text-red-700"     },
};

export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "blue",
}: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <span className={cn("mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium", c.badge)}>
              {trend}
            </span>
          )}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", c.bg)}>
          <Icon size={20} className={c.icon} />
        </div>
      </div>
    </div>
  );
}
