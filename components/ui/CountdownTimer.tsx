"use client";

import { useEffect, useState } from "react";

function getRemaining(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  };
}

export function CountdownTimer({ target }: { target: string }) {
  const [time, setTime] = useState<ReturnType<typeof getRemaining> | null>(null);

  useEffect(() => {
    setTime(getRemaining(target));
    const interval = setInterval(() => setTime(getRemaining(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (!time) return <div className="h-14" />; // avoid hydration flash

  if (time.done) {
    return <p className="font-mono text-sm text-[var(--color-gold-bright)]">Happening now</p>;
  }

  const units = [
    { label: "Days", value: time.days },
    { label: "Hrs", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Sec", value: time.seconds },
  ];

  return (
    <div className="flex gap-2" role="timer" aria-live="off">
      {units.map((u) => (
        <div key={u.label} className="glass rounded-lg px-2.5 py-1.5 text-center min-w-[46px]">
          <div className="font-mono text-lg text-[var(--color-gold-bright)] tabular-nums leading-none">
            {String(u.value).padStart(2, "0")}
          </div>
          <div className="text-[9px] text-[var(--color-ash-dim)] uppercase tracking-wider mt-1">{u.label}</div>
        </div>
      ))}
    </div>
  );
}
