import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function DashboardWidget({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
}) {
  return (
    <GlassCard hover={false} className="flex items-start justify-between">
      <div>
        <p className="eyebrow">{label}</p>
        <p className="font-display text-3xl mt-3 text-[var(--color-ivory)] tabular-nums">{value}</p>
        {trend && <p className="text-xs text-[var(--color-success)] mt-2 font-mono">{trend}</p>}
      </div>
      <span className="rounded-xl p-2.5 bg-[var(--color-gold)]/10 text-[var(--color-gold-bright)]">
        <Icon size={18} />
      </span>
    </GlassCard>
  );
}
