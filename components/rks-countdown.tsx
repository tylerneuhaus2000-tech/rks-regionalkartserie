"use client";

import { useEffect, useState } from "react";

const units = [
  { key: "days", label: "DAYS", divisor: 86_400_000 },
  { key: "hours", label: "HRS", divisor: 3_600_000 },
  { key: "minutes", label: "MIN", divisor: 60_000 },
  { key: "seconds", label: "SEC", divisor: 1_000 },
] as const;

export function RksCountdown({ date, className = "" }: { date: string | null; className?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!date) return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 1_000);
    return () => window.clearInterval(timer);
  }, [date]);

  if (!date) return null;
  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) return null;
  const remaining = now === null ? null : Math.max(timestamp - now, 0);

  if (remaining === 0) return <div className={`rks-countdown is-race-day ${className}`}><strong>RACE DAY</strong></div>;

  return <div className={`rks-countdown ${className}`} role="timer" aria-label={remaining === null ? "Countdown loading" : "Countdown to the next race"}>
    {units.map(({ key, label, divisor }) => {
      const value = remaining === null ? null : Math.floor(remaining / divisor) % (key === "days" ? Number.MAX_SAFE_INTEGER : key === "hours" ? 24 : 60);
      return <span className="rks-countdown-unit" key={key}><strong>{value === null ? "--" : String(value).padStart(2, "0")}</strong><small>{label}</small></span>;
    })}
  </div>;
}
