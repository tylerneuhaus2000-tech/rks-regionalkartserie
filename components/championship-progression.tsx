"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { season2026 } from "@/data/2026/season";
import { championshipProgression2026 } from "@/data/2026/selectors";

const colors = ["#e21b24", "#ffffff", "#92969b", "#e3ac47", "#56b5d4", "#b579d3", "#79be83", "#df7d45", "#64a48e", "#d978a8", "#b1b6c0", "#c9bd69", "#7a8fe0", "#cc816a", "#9bb767"];

export function ChampionshipProgression({ compact = false }: { compact?: boolean }) {
  const defaultIds = ["DRV_TYLER", "DRV_JONAH", "DRV_LENNAED_W", "DRV_LENNARD_F"];
  const [selected, setSelected] = useState<string[]>(defaultIds);
  const data = useMemo(() => championshipProgression2026(selected), [selected]);
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return <section className={`panel progression-panel${compact ? " is-compact" : ""}`} aria-labelledby="progression-title">
    <div className="chart-caption"><div><span className="eyebrow">Cumulative points</span><h3 id="progression-title">Championship progression</h3></div><span className="chart-label">By completed round</span></div>
    <div className="progression-chart" role="img" aria-label="Line chart showing cumulative 2026 championship points through Round 3. Round 4 is pending.">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 14, bottom: 0, left: -14 }}>
          <CartesianGrid stroke="#292a2c" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="round" tick={{ fill: "#b4b6b8", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, "dataMax + 5"]} tick={{ fill: "#777a7d", fontSize: 10 }} tickLine={false} axisLine={false} width={32} />
          <Tooltip contentStyle={{ background: "#171819", border: "1px solid #343638", borderRadius: 8, color: "#fff", fontSize: 12 }} formatter={(value, name) => [value, season2026.drivers.find((driver) => driver.id === name)?.name ?? name]} />
          {selected.map((id) => {
            const index = season2026.drivers.findIndex((driver) => driver.id === id);
            return <Line key={id} type="linear" dataKey={id} name={id} stroke={colors[index % colors.length]} strokeWidth={id === "DRV_TYLER" || id === "DRV_JONAH" ? 2.8 : 2} dot={{ r: 3, strokeWidth: 0, fill: colors[index % colors.length] }} activeDot={{ r: 5 }} connectNulls={false} />;
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="progression-legend" aria-label="Select drivers shown on chart">
      {season2026.drivers.map((driver, index) => <label key={driver.id} className={selected.includes(driver.id) ? "selected" : ""}>
        <input type="checkbox" checked={selected.includes(driver.id)} onChange={() => toggle(driver.id)} />
        <i style={{ "--series-color": colors[index % colors.length] } as React.CSSProperties} />{driver.name}
      </label>)}
    </div>
    <p className="chart-footnote">Rounds 1–3 are classified. Round 4 remains pending.</p>
    <p className="sr-only">{season2026.events.filter((event) => event.status === "complete").map((event) => `${event.id}: ${selected.map((id) => `${season2026.drivers.find((driver) => driver.id === id)?.name} ${data.find((row) => row.eventId === event.id)?.[id]} points`).join(", ")}`).join(". ")}</p>
  </section>;
}
