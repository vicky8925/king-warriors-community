import { StatCard } from "@/components/ui/StatCard";
import { homeStats } from "@/lib/data/stats";

export function StatsSection() {
  return (
    <section className="section-padding py-16 sm:py-20">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {homeStats.map((s, i) => (
          <StatCard key={s.label} label={s.label} value={s.value} suffix={s.suffix} index={i} />
        ))}
      </div>
    </section>
  );
}
