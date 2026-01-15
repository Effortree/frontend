"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";

/** -----------------------------
 * utils
 * ----------------------------- */
function ymd(date) {
  if (typeof date === "string") return date.slice(0, 10);
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function prettyFullDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function cn(...args) {
  return args.filter(Boolean).join(" ");
}

function addDays(d, k) {
  const x = new Date(d);
  x.setDate(x.getDate() + k);
  return x;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function fmtMMDD(d) {
  const dt = new Date(d);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${mm}.${dd}`;
}

function fmtYYMM(date) {
  const d = new Date(date);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yy}.${mm}`;
}

/** -----------------------------
 * Buckets: 10 labels fallback
 * ----------------------------- */
function buildBuckets(mode) {
  const now = new Date();
  const buckets = [];
  for (let i = 9; i >= 0; i--) {
    if (mode === "daily") {
      const d = startOfDay(addDays(now, -i));
      buckets.push({ label: fmtMMDD(d) });
    } else if (mode === "weekly") {
      const end = startOfDay(addDays(now, -i * 7));
      const start = startOfDay(addDays(end, -7));
      buckets.push({ label: fmtMMDD(start) });
    } else {
      const d = new Date(now);
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const start = startOfDay(new Date(d.getFullYear(), d.getMonth(), 1));
      buckets.push({ label: fmtYYMM(start) });
    }
  }
  return buckets;
}

/** -----------------------------
 * Grass map builder
 * ----------------------------- */
function buildByDayFromDailyActual(rows) {
  const m = new Map();
  for (const r of rows ?? []) {
    const key = ymd(r.date);
    m.set(key, { elapsed: Number(r.actual_minutes ?? 0) });
  }
  return m;
}

/** -----------------------------
 * UI atoms
 * ----------------------------- */
function SoftButton({ children, onClick, className = "", disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={cn(
        "rounded-full border border-black/10 bg-white/70 px-5 py-2 text-[14px] font-extrabold text-[#0B2B5B] shadow-sm hover:bg-white transition disabled:opacity-50 disabled:hover:bg-white/70",
        className
      )}
    >
      {children}
    </button>
  );
}

function IconButton({ title, onClick, children, disabled }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-10 w-10 rounded-full border border-white/50 bg-white/60 backdrop-blur-md shadow-soft hover:bg-white/80 transition flex items-center justify-center",
        disabled ? "opacity-50 pointer-events-none" : ""
      )}
    >
      {children}
    </button>
  );
}

function CardShell({ title, right, children, className = "" }) {
  return (
    <div
      className={cn(
        "rounded-[26px] border border-black/10 bg-white/55 shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between gap-3">
        <div className="text-[18px] font-extrabold text-[#0B2B5B]">{title}</div>
        <div className="shrink-0">{right}</div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatCard({ icon, title, value, sub, tone = "green" }) {
  const toneBg = {
    green: "bg-[#B7E27A]/55",
    blue: "bg-[#9ED0FF]/45",
    yellow: "bg-[#FFE9A6]/55",
    pink: "bg-[#FFB4B4]/45",
  }[tone];

  return (
    <div className="rounded-[22px] border border-black/10 bg-white/60 shadow-sm p-5 flex items-center gap-4">
      <div
        className={cn(
          "h-12 w-12 rounded-2xl border border-black/10 flex items-center justify-center text-[22px] shrink-0",
          toneBg
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[14px] font-extrabold text-black/60">{title}</div>
        <div className="text-[26px] font-extrabold text-[#0B2B5B] leading-tight">
          {value}
        </div>
        {sub ? (
          <div className="mt-1 text-[12px] font-semibold text-black/45">
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** -----------------------------
 * Charts
 * ----------------------------- */
function BarChartPlanActual({ labels, planned, actual, height = 200 }) {
  const maxV = Math.max(1, ...planned, ...actual);
  const n = labels.length;

  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height }}>
        {Array.from({ length: n }).map((_, i) => {
          const p = planned[i] ?? 0;
          const a = actual[i] ?? 0;
          const pH = Math.round((p / maxV) * (height - 34));
          const aH = Math.round((a / maxV) * (height - 34));
          return (
            <div
              key={`${labels[i]}_${i}`}
              className="flex-1 min-w-0 flex flex-col"
            >
              <div className="flex items-end justify-center gap-1 flex-1">
                <div
                  className="w-3.5 rounded-xl border border-black/10 bg-black/10"
                  style={{ height: pH }}
                  title={`Planned: ${p} min`}
                />
                <div
                  className="w-3.5 rounded-xl border border-black/10 bg-[#B7E27A]/80"
                  style={{ height: aH }}
                  title={`Actual: ${a} min`}
                />
              </div>
              <div className="mt-2 h-5 text-[11px] font-extrabold text-black/45 text-center truncate">
                {labels[i]}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-4 text-[12px] font-extrabold text-black/50">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-black/10 bg-black/10" />
          Planned
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-black/10 bg-[#B7E27A]/80" />
          Actual
        </span>
      </div>
    </div>
  );
}

function PieChart({ items }) {
  const total = Math.max(1, sum(items.map((x) => x.value)));

  const colors = {
    green: "rgba(46,125,50,0.85)",
    blue: "rgba(11,43,91,0.75)",
    yellow: "rgba(255,200,70,0.85)",
    pink: "rgba(255,120,120,0.75)",
    gray: "rgba(0,0,0,0.25)",
  };

  let acc = 0;
  const slices = items.map((it) => {
    const a0 = (acc / total) * Math.PI * 2;
    acc += it.value;
    const a1 = (acc / total) * Math.PI * 2;

    const large = a1 - a0 > Math.PI ? 1 : 0;
    const r = 70;
    const cx = 90,
      cy = 90;

    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);

    const d = [
      `M ${cx} ${cy}`,
      `L ${x0} ${y0}`,
      `A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`,
      "Z",
    ].join(" ");

    return { ...it, d, color: colors[it.tone] ?? colors.gray };
  });

  const swatch = {
    green: "bg-[#2E7D32]/80",
    blue: "bg-[#0B2B5B]/70",
    yellow: "bg-[#FFC846]/85",
    pink: "bg-[#FF7A7A]/75",
    gray: "bg-black/20",
  };

  return (
    <div className="flex flex-col sm:flex-row gap-5 items-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="shrink-0">
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.d}
            fill={s.color}
            stroke="rgba(0,0,0,0.12)"
            strokeWidth="1"
          />
        ))}
        <circle
          cx="90"
          cy="90"
          r="36"
          fill="rgba(255,255,255,0.7)"
          stroke="rgba(0,0,0,0.08)"
        />
        <text
          x="90"
          y="92"
          textAnchor="middle"
          className="font-extrabold"
          fill="rgba(11,43,91,0.95)"
          fontSize="12"
        >
          Total
        </text>
        <text
          x="90"
          y="110"
          textAnchor="middle"
          className="font-extrabold"
          fill="rgba(0,0,0,0.55)"
          fontSize="12"
        >
          {total}m
        </text>
      </svg>

      <div className="flex-1 min-w-0 w-full">
        <div className="grid grid-cols-1 gap-2">
          {items
            .slice()
            .sort((a, b) => b.value - a.value)
            .map((it) => {
              const pct = Math.round((it.value / total) * 100);
              return (
                <div
                  key={it.label}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        "h-3 w-3 rounded",
                        swatch[it.tone] ?? swatch.gray
                      )}
                    />
                    <div className="truncate text-[14px] font-extrabold text-[#0B2B5B]">
                      {it.label}
                    </div>
                  </div>
                  <div className="text-[13px] font-extrabold text-black/55 shrink-0">
                    {pct}% · {it.value}m
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

/** -----------------------------
 * Kanban stacked area (prepare/active/done stacked per day)
 * ----------------------------- */
function KanbanStackedArea({ buckets, height = 220 }) {
  // 0) 안전장치 + 날짜 오름차순 정렬 (API가 섞여 와도 지라처럼 시간축 유지)
  const rows = (Array.isArray(buckets) ? buckets : [])
    .slice()
    .sort((a, b) => String(a.date ?? "").localeCompare(String(b.date ?? "")));

  const n = rows.length;

  const W = 980;
  const H = height;

  const padL = 36;
  const padR = 18;
  const padT = 16;
  const padB = 34;

  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const points = useMemo(() => {
    return rows.map((r, i) => {
      const prepare = Number(r.prepare ?? 0);
      const active = Number(r.active ?? 0);
      const done = Number(r.done ?? 0);
      const total = prepare + active + done;
      return { i, date: String(r.date ?? ""), prepare, active, done, total };
    });
  }, [rows]);

  const maxTotal = useMemo(() => {
    const m = Math.max(1, ...points.map((p) => p.total));
    return Math.max(1, Math.ceil(m * 1.15)); // headroom
  }, [points]);

  const xAt = (i) => {
    if (n <= 1) return padL + innerW / 2;
    return padL + (i / (n - 1)) * innerW;
  };
  const yAt = (v) => padT + innerH - (v / maxTotal) * innerH;

  // 1) 지라 CFD 느낌: 직선 기반 path (오버슈트/교차 방지)
  function linePath(pts) {
    if (!pts.length) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`;
    return d;
  }

  // 2) 밴드(면) 만들기: upper(좌→우) + lower(우→좌) 한 번에 연결해서 닫기
  function bandPath(upperPts, lowerPts) {
    if (!upperPts.length) return "";
    const up = upperPts; // left -> right
    const low = [...lowerPts].reverse(); // right -> left

    let d = `M ${up[0].x} ${up[0].y}`;
    for (let i = 1; i < up.length; i++) d += ` L ${up[i].x} ${up[i].y}`;
    for (let i = 0; i < low.length; i++) d += ` L ${low[i].x} ${low[i].y}`;
    d += " Z";
    return d;
  }

  const baseLine = points.map((p) => ({ x: xAt(p.i), y: yAt(0) }));

  const prepTop = points.map((p) => ({
    x: xAt(p.i),
    y: yAt(p.prepare),
  }));

  const activeTop = points.map((p) => ({
    x: xAt(p.i),
    y: yAt(p.prepare + p.active),
  }));

  const doneTop = points.map((p) => ({
    x: xAt(p.i),
    y: yAt(p.prepare + p.active + p.done),
  }));

  const pathPrepare = bandPath(prepTop, baseLine);
  const pathActive = bandPath(activeTop, prepTop);
  const pathDone = bandPath(doneTop, activeTop);

  const xLabels = points.map((p) => {
    const s = p.date;
    if (s && s.length >= 10) return `${s.slice(5, 7)}/${s.slice(8, 10)}`;
    return s || "-";
  });

  return (
    <div className="w-full">
      {n === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white/60 p-5 text-[13px] font-semibold text-black/45">
          No kanban data.
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="min-w-[760px] w-full"
              role="img"
              aria-label="Kanban cumulative flow (stacked)"
            >
              <defs>
                <linearGradient id="gPrepare" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(183,226,122,0.55)" />
                  <stop offset="100%" stopColor="rgba(183,226,122,0.25)" />
                </linearGradient>
                <linearGradient id="gActive" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,200,70,0.60)" />
                  <stop offset="100%" stopColor="rgba(255,200,70,0.28)" />
                </linearGradient>
                <linearGradient id="gDone" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(11,43,91,0.60)" />
                  <stop offset="100%" stopColor="rgba(11,43,91,0.25)" />
                </linearGradient>
              </defs>

              {/* grid */}
              {Array.from({ length: 4 }).map((_, k) => {
                const y = padT + (innerH * (k + 1)) / 4;
                return (
                  <line
                    key={k}
                    x1={padL}
                    x2={W - padR}
                    y1={y}
                    y2={y}
                    stroke="rgba(0,0,0,0.08)"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* stacked areas (CFD) */}
              <path d={pathPrepare} fill="url(#gPrepare)" stroke="none" />
              <path d={pathActive} fill="url(#gActive)" stroke="none" />
              <path d={pathDone} fill="url(#gDone)" stroke="none" />

              {/* top outline (total) */}
              <path
                d={linePath(doneTop)}
                fill="none"
                stroke="rgba(11,43,91,0.45)"
                strokeWidth="2"
              />

              {/* dots */}
              {doneTop.map((p, i) => {
                const r = rows[i] ?? {};
                const prep = Number(r.prepare ?? 0);
                const act = Number(r.active ?? 0);
                const done = Number(r.done ?? 0);
                const total = prep + act + done;

                return (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    fill="rgba(255,255,255,0.9)"
                    stroke="rgba(11,43,91,0.65)"
                    strokeWidth="2"
                  >
                    <title>
                      {r.date} • Prepare {prep} / Active {act} / Done {done} •
                      Total {total}
                    </title>
                  </circle>
                );
              })}

              {/* x labels */}
              {xLabels.map((lab, i) => {
                const x = xAt(i);
                const show = true; // 10개 고정이니 전부 표시
                if (!show) return null;
                return (
                  <text
                    key={i}
                    x={x}
                    y={H - 12}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="800"
                    fill="rgba(0,0,0,0.45)"
                  >
                    {lab}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* legend */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] font-extrabold text-black/55">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded border border-black/10 bg-[#B7E27A]/60" />
              Prepare
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded border border-black/10 bg-[#FFC846]/60" />
              Active
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded border border-black/10 bg-[#0B2B5B]/55" />
              Done
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/** -----------------------------
 * Grass (fixed block size, auto-fill width by increasing days)
 * ----------------------------- */
function GrassRowAuto({ byDay, minDays = 91 }) {
  const wrapRef = useRef(null);
  const [weeks, setWeeks] = useState(Math.ceil(minDays / 7));

  const CELL = 14;
  const GAP = 8;
  const COL = CELL + GAP;

  useEffect(() => {
    if (!wrapRef.current) return;

    const el = wrapRef.current;
    const calc = () => {
      const w = el.clientWidth;
      const fitWeeks = Math.max(10, Math.floor((w + GAP) / COL));
      const minWeeks = Math.ceil(minDays / 7);
      setWeeks(Math.max(minWeeks, fitWeeks));
    };

    calc();
    const ro = new ResizeObserver(() => calc());
    ro.observe(el);
    return () => ro.disconnect();
  }, [minDays]);

  const days = useMemo(() => {
    const d = [];
    const totalDays = weeks * 7;
    for (let i = totalDays - 1; i >= 0; i--)
      d.push(startOfDay(addDays(new Date(), -i)));
    return d;
  }, [weeks]);

  const values = useMemo(
    () => days.map((d) => byDay.get(ymd(d))?.elapsed ?? 0),
    [days, byDay]
  );
  const maxV = Math.max(1, ...values);

  const level = (v) => {
    if (v <= 0) return 0;
    const t = v / maxV;
    if (t < 0.25) return 1;
    if (t < 0.5) return 2;
    if (t < 0.75) return 3;
    return 4;
  };

  const cellBg = (lv) => {
    if (lv === 0) return "rgba(0,0,0,0.06)";
    if (lv === 1) return "rgba(183,226,122,0.25)";
    if (lv === 2) return "rgba(183,226,122,0.45)";
    if (lv === 3) return "rgba(46,125,50,0.45)";
    return "rgba(46,125,50,0.75)";
  };

  const monthLabels = useMemo(() => {
    const labels = [];
    for (let w = 0; w < weeks; w++) {
      const idx = w * 7;
      const dt = days[idx];
      if (!dt) continue;
      if (dt.getDate() <= 7)
        labels.push({ w, label: `${dt.getMonth() + 1}월` });
    }
    return labels;
  }, [days, weeks]);

  return (
    <div className="rounded-[26px] border border-black/10 bg-white/55 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
        <div className="text-[18px] font-extrabold text-[#0B2B5B]">
          Activity
        </div>
        <div className="text-[12px] font-extrabold text-black/40">
          Fixed block size · {weeks * 7} days
        </div>
      </div>

      <div className="p-5">
        <div ref={wrapRef} className="w-full overflow-x-auto">
          <div
            className="grid gap-2 mb-3"
            style={{ gridTemplateColumns: `repeat(${weeks}, ${CELL}px)` }}
          >
            {Array.from({ length: weeks }).map((_, w) => {
              const m = monthLabels.find((x) => x.w === w);
              return (
                <div
                  key={w}
                  className="text-[11px] font-extrabold text-black/35 h-7 leading-[1.05] text-center whitespace-pre-line"
                  style={{ width: CELL }}
                >
                  {m ? m.label : ""}
                </div>
              );
            })}
          </div>

          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${weeks}, ${CELL}px)` }}
          >
            {Array.from({ length: weeks }).map((_, w) => (
              <div key={w} className="grid grid-rows-7 gap-2">
                {Array.from({ length: 7 }).map((_, r) => {
                  const idx = w * 7 + r;
                  const dt = days[idx];
                  const v = values[idx] ?? 0;
                  const lv = level(v);

                  return (
                    <div
                      key={r}
                      className="rounded-[4px] border border-black/10"
                      style={{
                        width: CELL,
                        height: CELL,
                        background: cellBg(lv),
                      }}
                      title={`${dt ? ymd(dt) : ""} · ${v} min`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 text-[12px] font-semibold text-black/45">
          <span className="mr-2">Less</span>
          {[0, 1, 2, 3, 4].map((lv) => (
            <span
              key={lv}
              className="h-3 w-3 rounded-[3px] border border-black/10"
              style={{ background: cellBg(lv) }}
            />
          ))}
          <span className="ml-2">More</span>
        </div>
      </div>
    </div>
  );
}

/** -----------------------------
 * Main
 * ----------------------------- */
export default function AnalyticPage() {
  const [userId, setUserId] = useState(null);

  const [mode, setMode] = useState("daily"); // daily | weekly | monthly
  const modeLabel =
    mode === "daily" ? "10 days" : mode === "weekly" ? "10 weeks" : "10 months";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [summary, setSummary] = useState({
    achievement_rate: 0,
    total_actual_minutes: 0,
    total_planned_minutes: 0,
  });

  const [streakDays, setStreakDays] = useState(0);
  const [planActual, setPlanActual] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dailyActual, setDailyActual] = useState([]);

  // ✅ kanban은 이제 “버킷 배열”
  const [kanbanBuckets, setKanbanBuckets] = useState([]);

  const byDay = useMemo(
    () => buildByDayFromDailyActual(dailyActual),
    [dailyActual]
  );

  // ✅ localStorage에서 userId 로드
  useEffect(() => {
    const raw = localStorage.getItem("userId");
    const parsed = raw ? Number(raw) : null;
    setUserId(Number.isFinite(parsed) ? parsed : null);
  }, []);

  const fallbackLabels = useMemo(
    () => buildBuckets(mode).map((b) => b.label),
    [mode]
  );

  const labels = useMemo(() => {
    if (!planActual?.length) return fallbackLabels;

    return planActual.map((x) => {
      const b = String(x.bucket ?? "");
      if (!b) return "";

      if (mode === "monthly") return b.slice(2).replace("-", ".");
      if (mode === "daily") return b.slice(5).replace("-", ".");
      return b.length >= 10 ? b.slice(5, 10).replace("-", ".") : b;
    });
  }, [planActual, fallbackLabels, mode]);

  const planned = useMemo(
    () => (planActual ?? []).map((x) => Number(x.planned ?? 0)),
    [planActual]
  );
  const actual = useMemo(
    () => (planActual ?? []).map((x) => Number(x.actual ?? 0)),
    [planActual]
  );

  const subjectPie = useMemo(() => {
    const tones = ["blue", "green", "yellow", "pink"];
    return (subjects ?? []).map((s, idx) => ({
      label: s.subject ?? "Unknown",
      value: Number(s.minutes ?? 0),
      tone: tones[idx % tones.length],
    }));
  }, [subjects]);

  const totalTime = Number(summary.total_actual_minutes ?? 0);
  const totalPlanned = Number(summary.total_planned_minutes ?? 0);
  const achievementPct = useMemo(() => {
    if (totalPlanned <= 0) return 0;
    return clamp(Math.round((totalTime / totalPlanned) * 100), 0, 999);
  }, [totalTime, totalPlanned]);

  // ✅ 전체 데이터 fetch (userId + mode)
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const results = await Promise.allSettled([
          api.get(`/analytics/summary`, { params: { userId, mode } }),
          api.get(`/analytics/streak`, { params: { userId } }),
          api.get(`/analytics/plan-vs-actual`, { params: { userId, mode } }),
          api.get(`/analytics/subjects`, { params: { userId, mode } }),
          api.get(`/analytics/daily-actual-308`, { params: { userId } }),
          // ✅ kanban: mode 기반, 10 buckets
          api.get(`/analytics/kanban`, { params: { userId, mode } }),
        ]);

        if (!alive) return;

        const [
          summaryRes,
          streakRes,
          planRes,
          subjectRes,
          dailyRes,
          kanbanRes,
        ] = results;

        // summary
        if (summaryRes.status === "fulfilled") {
          const raw = summaryRes.value.data;
          const s = typeof raw === "string" ? JSON.parse(raw) : raw ?? {};
          setSummary({
            achievement_rate: Number(s.achievement_rate ?? 0),
            total_actual_minutes: Number(s.total_actual_minutes ?? 0),
            total_planned_minutes: Number(s.total_planned_minutes ?? 0),
          });
        }

        // streak
        if (streakRes.status === "fulfilled") {
          setStreakDays(Number(streakRes.value.data?.streak_days ?? 0));
        }

        // plan vs actual
        if (planRes.status === "fulfilled") {
          setPlanActual(
            Array.isArray(planRes.value.data) ? planRes.value.data : []
          );
        }

        // subjects
        if (subjectRes.status === "fulfilled") {
          setSubjects(
            Array.isArray(subjectRes.value.data) ? subjectRes.value.data : []
          );
        }

        // daily actual (grass)
        if (dailyRes.status === "fulfilled") {
          setDailyActual(
            Array.isArray(dailyRes.value.data) ? dailyRes.value.data : []
          );
        }

        // kanban buckets
        if (kanbanRes.status === "fulfilled") {
          const data = kanbanRes.value.data ?? {};
          const buckets = Array.isArray(data.buckets) ? data.buckets : [];
          setKanbanBuckets(buckets);
        }
      } catch (e) {
        if (!alive) return;
        setErr("Failed to load analytics data. Please try again.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [userId, mode]);

  const refreshKanban = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/analytics/kanban`, {
        params: { userId, mode },
      });
      const buckets = Array.isArray(res.data?.buckets) ? res.data.buckets : [];
      setKanbanBuckets(buckets);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative w-full overflow-hidden h-[calc(100vh-72px)]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("/background-skyfield.png")` }}
      />

      <div className="relative mx-auto h-full w-full max-w-6xl px-6 py-6">
        <div className="h-full rounded-[32px] border border-white/40 bg-white/65 backdrop-blur-md shadow-soft overflow-hidden">
          <div className="h-full min-h-0 flex flex-col">
            {/* header */}
            <div className="p-6">
              <div className="rounded-2xl border border-black/10 bg-white/55 p-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl border border-black/10 bg-white/70 shadow-sm flex items-center justify-center text-[18px]">
                    📊
                  </div>

                  <div className="min-w-0">
                    <div className="text-[22px] font-extrabold text-[#0B2B5B] leading-tight break-keep">
                      Analytics · {prettyFullDate(new Date())}
                    </div>
                    <div className="mt-1 text-[12px] font-semibold text-black/45">
                      Bars are fixed to{" "}
                      <span className="font-extrabold">10</span> buckets (
                      {modeLabel}). Grass increases days to fill width (block
                      size fixed).
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <SoftButton
                      onClick={() => setMode("daily")}
                      className={mode === "daily" ? "bg-white" : ""}
                      disabled={loading}
                    >
                      Daily
                    </SoftButton>
                    <SoftButton
                      onClick={() => setMode("weekly")}
                      className={mode === "weekly" ? "bg-white" : ""}
                      disabled={loading}
                    >
                      Weekly
                    </SoftButton>
                    <SoftButton
                      onClick={() => setMode("monthly")}
                      className={mode === "monthly" ? "bg-white" : ""}
                      disabled={loading}
                    >
                      Monthly
                    </SoftButton>
                  </div>
                </div>

                {err ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
                    {err}
                  </div>
                ) : null}
              </div>
            </div>

            {/* body */}
            <div className="px-6 pb-6 min-h-0 flex-1 overflow-y-auto pr-1">
              {loading ? (
                <div className="rounded-2xl border border-black/10 bg-white/70 p-6 text-center text-black/50 font-semibold">
                  Loading...
                </div>
              ) : !userId ? (
                <div className="rounded-2xl border border-black/10 bg-white/70 p-6 text-center text-black/50 font-semibold">
                  No userId found in localStorage.
                </div>
              ) : (
                <>
                  {/* top stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                      icon="🔥"
                      tone="pink"
                      title="Streak"
                      value={`${streakDays} days`}
                      sub="From /analytics/streak."
                    />
                    <StatCard
                      icon="⏱️"
                      tone="blue"
                      title={`Total Time (${modeLabel})`}
                      value={`${totalTime} mins`}
                      sub="From /analytics/summary (total_actual_minutes)."
                    />
                    <StatCard
                      icon="✅"
                      tone="green"
                      title="Achievement"
                      value={`${achievementPct}%`}
                      sub="Actual / Planned."
                    />
                  </div>

                  {/* charts */}
                  <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <CardShell
                      title={`Plan vs. Actual (${modeLabel})`}
                      right={null}
                    >
                      <BarChartPlanActual
                        labels={labels.length ? labels : fallbackLabels}
                        planned={planned.length ? planned : Array(10).fill(0)}
                        actual={actual.length ? actual : Array(10).fill(0)}
                      />
                    </CardShell>

                    <CardShell
                      title={`Time Spent by Subject (${modeLabel})`}
                      right={null}
                    >
                      <PieChart
                        items={
                          subjectPie.length
                            ? subjectPie
                            : [{ label: "No data", value: 1, tone: "gray" }]
                        }
                      />
                    </CardShell>
                  </div>

                  {/* kanban stacked */}
                  <div className="mt-5">
                    <CardShell
                      title={`Kanban (Stacked · ${modeLabel})`}
                      right={
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-extrabold text-black/45">
                            {mode}
                          </span>
                          <IconButton title="Refresh" onClick={refreshKanban}>
                            ↻
                          </IconButton>
                        </div>
                      }
                    >
                      <KanbanStackedArea buckets={kanbanBuckets} />
                    </CardShell>
                  </div>

                  {/* grass */}
                  <div className="mt-5">
                    <GrassRowAuto byDay={byDay} minDays={91} />
                  </div>

                  <div className="h-4" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
