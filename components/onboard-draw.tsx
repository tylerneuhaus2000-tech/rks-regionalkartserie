"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { Check, CornerUpLeft, Eraser } from "lucide-react";

type Point = { x: number; y: number };
type Stroke = { points: Point[]; color: string; kind: "pen" | "marker" | "arrow" };
const colors = ["#ffffff", "#e00000", "#ffd74a", "#42c7ff", "#75e29a"];

export function OnboardDraw({ onClose }: { onClose: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const [kind, setKind] = useState<Stroke["kind"]>("pen");
  const [color, setColor] = useState(colors[1]);
  const [revision, setRevision] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);
  const render = useCallback(() => {
    const node = canvas.current;
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(bounds.width * ratio));
    const height = Math.max(1, Math.round(bounds.height * ratio));
    if (node.width !== width || node.height !== height) { node.width = width; node.height = height; }
    const ctx = node.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.scale(ratio, ratio);
    const paint = (stroke: Stroke) => {
      const points = stroke.points;
      if (!points.length) return;
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      ctx.globalAlpha = stroke.kind === "marker" ? .5 : 1;
      ctx.lineWidth = stroke.kind === "marker" ? 16 : 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(points[0].x * bounds.width, points[0].y * bounds.height);
      for (const point of points.slice(1)) ctx.lineTo(point.x * bounds.width, point.y * bounds.height);
      if (points.length === 1) ctx.lineTo(points[0].x * bounds.width + .01, points[0].y * bounds.height + .01);
      ctx.stroke();
      if (stroke.kind === "arrow" && points.length > 1) {
        const end = points[points.length - 1];
        const before = points[Math.max(0, points.length - 4)];
        const angle = Math.atan2((end.y - before.y) * bounds.height, (end.x - before.x) * bounds.width);
        const x = end.x * bounds.width, y = end.y * bounds.height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 15 * Math.cos(angle - .55), y - 15 * Math.sin(angle - .55));
        ctx.moveTo(x, y);
        ctx.lineTo(x - 15 * Math.cos(angle + .55), y - 15 * Math.sin(angle + .55));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };
    strokes.current.forEach(paint);
    if (current.current) paint(current.current);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, []);
  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const observer = new ResizeObserver(render);
    observer.observe(node);
    render();
    return () => observer.disconnect();
  }, [render]);
  useEffect(() => { render(); }, [revision, render]);
  function point(event: PointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
  }
  function start(event: PointerEvent<HTMLCanvasElement>) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    current.current = { points: [point(event)], color, kind };
    render();
  }
  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!current.current) return;
    current.current.points.push(point(event));
    render();
  }
  function finish(event: PointerEvent<HTMLCanvasElement>) {
    if (!current.current) return;
    event.stopPropagation();
    current.current.points.push(point(event));
    strokes.current.push(current.current);
    setStrokeCount(strokes.current.length);
    current.current = null;
    setRevision(value => value + 1);
  }
  return <div className="onboard-draw" onClick={event => event.stopPropagation()} onPointerDown={event => event.stopPropagation()}>
    <canvas ref={canvas} className="onboard-draw-canvas" aria-label="Auf dem pausierten Videobild zeichnen" onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} />
    <div className="onboard-draw-tools" role="toolbar" aria-label="Zeichenwerkzeuge">
      <span className="onboard-draw-label">ZEICHENMODUS · PAUSIERT</span>
      <div className="onboard-draw-group" aria-label="Stiftart">{(["pen", "marker", "arrow"] as const).map(item => <button key={item} type="button" aria-pressed={kind === item} onClick={() => setKind(item)}>{item === "pen" ? "Stift" : item === "marker" ? "Marker" : "Pfeil"}</button>)}</div>
      <div className="onboard-draw-group" aria-label="Farbe">{colors.map(item => <button key={item} type="button" className="onboard-draw-color" aria-label={`Farbe ${item}`} aria-pressed={color === item} style={{ "--draw-color": item } as React.CSSProperties} onClick={() => setColor(item)} />)}</div>
      <button type="button" title="Letzten Strich entfernen" aria-label="Rückgängig" disabled={strokeCount === 0} onClick={() => { strokes.current.pop(); setStrokeCount(strokes.current.length); setRevision(value => value + 1); }}><CornerUpLeft size={17}/></button>
      <button type="button" title="Alle Zeichnungen entfernen" aria-label="Alles löschen" disabled={strokeCount === 0} onClick={() => { strokes.current = []; setStrokeCount(0); setRevision(value => value + 1); }}><Eraser size={17}/></button>
      <button type="button" className="onboard-draw-done" onClick={onClose}><Check size={17}/> Fertig</button>
    </div>
  </div>;
}
