"use client";

import React, { useEffect, useMemo, useState } from "react";
import PillButton from "@/app/ui/PillButton";

function formatMs(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function FocusHeader({ running, onStop, elapsedMs, startAt }) {
  // 화면 표시만 1초마다 갱신
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const totalMs = useMemo(() => {
    if (!startAt) return elapsedMs;
    return elapsedMs + (Date.now() - startAt);
  }, [elapsedMs, startAt, tick]);

  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/55 p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-sm font-extrabold text-[#0B2B5B]">
            Focus Time
          </div>
          {running ? (
            <span className="rounded-full bg-[#2196F3]/15 px-2 py-0.5 text-xs font-bold text-[#0B2B5B]">
              Running
            </span>
          ) : (
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-bold text-black/50">
              Idle
            </span>
          )}
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-2xl font-extrabold text-[#0B2B5B] tabular-nums">
            {formatMs(totalMs)}
          </div>
          <div className="text-xs text-black/55">
            {running ? "Tracking your focus…" : "Start any quest to begin."}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <PillButton variant="secondary" onClick={onStop} disabled={!running}>
          Stop
        </PillButton>
      </div>
    </div>
  );
}
