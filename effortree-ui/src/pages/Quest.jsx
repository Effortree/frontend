"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Tab from "@/app/ui/Tab";
import QuestItem from "@/app/ui/QuestItem";
import FocusHeader from "@/app/ui/FocusHeader";
import { api } from "@/lib/api.js";

/** -----------------------------
 * utils
 * ----------------------------- */
function ymd(d = new Date()) {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toNumberOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ✅ Gift 이미지 URL prefix (고정)
const GIFT_BASE = "http://168.107.21.74:8000";

// ✅ 컴포넌트 밖에서는 useCallback 쓰면 안됨 (그냥 함수로!)
function resolveGiftUrl(maybeUrl) {
  const u = String(maybeUrl ?? "").trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u) || u.startsWith("data:")) return u;

  const base = GIFT_BASE.replace(/\/$/, "");
  const path = u.startsWith("/") ? u : `/${u}`;
  return `${base}${path}`;
}

/** -----------------------------
 * AddQuestPopup (inline)
 * subject(크게) / title(짧게) / description(자세히)
 * ----------------------------- */
function AddQuestPopup({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    subject: "English",
    title: "Just get started",
    description:
      "English basics. Review key concepts and solve 10 quick quizzes.",
    suggested_minutes: 30,
    deadline: "2026-01-07",
    visibility: "Shared", // "Me-only" | "Shared"
  });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canSubmit =
    form.subject.trim() &&
    form.title.trim() &&
    form.deadline.trim() &&
    Number(form.suggested_minutes) > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.({
      subject: form.subject.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      suggested_minutes: Number(form.suggested_minutes),
      deadline: form.deadline,
      visibility: form.visibility,
    });
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-black/25 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center p-5"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-[min(560px,calc(100vw-40px))] rounded-[28px] border border-black/10 bg-white/85 shadow-soft backdrop-blur-md p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-extrabold text-[#0B2B5B]">
                    Add Quest
                  </div>
                  <div className="text-xs text-black/55 mt-1">
                    Subject is shown big. Title is short. Description appears on
                    click.
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-full px-3 py-1 text-sm font-semibold text-black/60 hover:bg-black/5"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-black/60">
                    Subject
                  </label>
                  <input
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0B2B5B]/10"
                    placeholder="English"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-bold text-black/60">
                    Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0B2B5B]/10"
                    placeholder="Just get started"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-bold text-black/60">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    className="w-full resize-none rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0B2B5B]/10"
                    placeholder="Details shown when you click the quest card..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <label className="text-xs font-bold text-black/60">
                      Suggested minutes
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.suggested_minutes}
                      onChange={(e) =>
                        update("suggested_minutes", e.target.value)
                      }
                      className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0B2B5B]/10"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-bold text-black/60">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(e) => update("deadline", e.target.value)}
                      className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0B2B5B]/10"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-bold text-black/60">
                    Visibility
                  </label>
                  <select
                    value={form.visibility}
                    onChange={(e) => update("visibility", e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0B2B5B]/10"
                  >
                    <option value="Me-only">Me-only</option>
                    <option value="Shared">Shared</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  className="rounded-full px-4 py-2 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition",
                    canSubmit
                      ? "bg-[#4CAF50] text-white hover:brightness-95"
                      : "bg-[#4CAF50]/40 text-white/80 cursor-not-allowed",
                  ].join(" ")}
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** -----------------------------
 * DonutChart (pure SVG, no deps)
 * ✅ 더 작게
 * ----------------------------- */
function DonutChart({ items }) {
  const palette = [
    "#4CAF50",
    "#7CD96B",
    "#0B2B5B",
    "#7AA6FF",
    "#F2C94C",
    "#EB5757",
    "#9B51E0",
    "#2D9CDB",
  ];

  const cleaned = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    const normalized = arr
      .map((x) => ({
        subject: String(x?.subject ?? "Unknown"),
        minutes: Number(x?.minutes ?? 0) || 0,
        share: x?.share == null ? null : Number(x.share),
      }))
      .filter((x) => x.minutes > 0);

    normalized.sort((a, b) => b.minutes - a.minutes);
    return normalized;
  }, [items]);

  const total = useMemo(
    () => cleaned.reduce((s, x) => s + x.minutes, 0),
    [cleaned]
  );

  if (!cleaned.length || total <= 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-black/45">
        <div className="text-sm font-semibold">No data yet</div>
        <div className="text-xs mt-1">Start a quest to see distribution</div>
      </div>
    );
  }

  // ✅ 더 작게
  const size = 96;
  const cx = size / 2;
  const cy = size / 2;
  const r = 32;
  const stroke = 12;
  const C = 2 * Math.PI * r;

  let offset = 0;

  const segments = cleaned.map((x, i) => {
    const frac = x.minutes / total;
    const len = Math.max(0, frac * C);

    const dasharray = `${len} ${C - len}`;
    const dashoffset = -offset;
    offset += len;

    return {
      ...x,
      color: palette[i % palette.length],
      dasharray,
      dashoffset,
    };
  });

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex items-center gap-4 w-full justify-center px-2">
        {/* donut */}
        <div className="relative shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(0,0,0,0.08)"
              strokeWidth={stroke}
            />
            <g transform={`rotate(-90 ${cx} ${cy})`}>
              {segments.map((seg, i) => (
                <circle
                  key={`seg-${seg.subject}-${i}`}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={seg.dasharray}
                  strokeDashoffset={seg.dashoffset}
                />
              ))}
            </g>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-sm font-extrabold text-[#0B2B5B]">
              {total}m
            </div>
            <div className="text-[11px] text-black/55 -mt-0.5">total</div>
          </div>
        </div>

        {/* legend */}
        <div className="min-w-[150px] max-w-[200px]">
          <div className="text-xs font-bold text-black/60 mb-2">By subject</div>

          <div className="flex flex-col gap-1.5">
            {segments.slice(0, 5).map((seg, idx) => (
              <div
                key={`${seg.subject}-legend-${idx}`}
                className="flex items-center gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="truncate text-black/75">{seg.subject}</span>
                </div>

                <div className="w-[78px] text-right tabular-nums text-black/55 whitespace-nowrap">
                  {seg.minutes}m
                </div>
              </div>
            ))}
          </div>

          {segments.length > 5 && (
            <div className="mt-2 text-[11px] text-black/40">
              +{segments.length - 5} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ QuestList memo
const QuestList = React.memo(function QuestList({
  quests,
  onStartToggle,
  onDone,
}) {
  const visibleQuests = useMemo(() => quests.filter((q) => !q.done), [quests]);

  return (
    <div className="mt-5 flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {visibleQuests.map((q) => (
          <QuestItem
            key={q.id}
            {...q}
            onStart={() => onStartToggle(q.id)}
            onDone={() => onDone(q.id)}
          />
        ))}
      </AnimatePresence>

      {visibleQuests.length === 0 && (
        <div className="rounded-2xl border border-black/10 bg-white/60 p-6 text-center text-black/60">
          All quests cleared 🎉
        </div>
      )}
    </div>
  );
});

export default function QuestDashboard() {
  const [mode, setMode] = useState("Daily");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // ✅ quests
  const [quests, setQuests] = useState([]);

  const totalCount = quests.length;
  const completedCount = useMemo(
    () => quests.filter((q) => q.done).length,
    [quests]
  );
  const progressPct =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const isAnyActive = useMemo(() => quests.some((q) => q.active), [quests]);
  const activeQuestId = useMemo(() => {
    const a = quests.find((q) => q.active);
    return a?.id ?? null;
  }, [quests]);

  // Focus timer
  const [focusMs, setFocusMs] = useState(0);
  const [focusStartAt, setFocusStartAt] = useState(null);

  useEffect(() => {
    if (isAnyActive) {
      if (focusStartAt === null) setFocusStartAt(Date.now());
    } else {
      if (focusStartAt !== null) {
        const elapsed = Date.now() - focusStartAt;
        setFocusMs((prev) => prev + elapsed);
        setFocusStartAt(null);
      }
    }
  }, [isAnyActive, focusStartAt]);

  // -----------------------------
  // ✅ 서버 <-> UI 매핑
  // -----------------------------
  const toUiQuest = useCallback((q) => {
    const uiVisibility = q.visibility === "me-only" ? "Me-only" : "Shared";
    return {
      id: q.questId,
      subject: q.subject,
      title: q.title,
      description: q.description ?? "",
      deadline: q.deadline,
      suggested_minutes: q.suggested_minutes,
      eta: `${q.suggested_minutes}m`,
      done: q.status === "done",
      active: q.status === "active",
      visibility: uiVisibility,
    };
  }, []);

  const visibilityToServer = (uiVisibility) =>
    uiVisibility === "Me-only" ? "me-only" : "shared";

  const loadQuests = useCallback(async () => {
    const userIdStr = localStorage.getItem("userId");
    const userId = userIdStr ? Number(userIdStr) : null;
    if (!userId || Number.isNaN(userId)) return;

    try {
      const res = await api.get("/quests", { params: { userId } });
      const data = Array.isArray(res.data) ? res.data : [];
      setQuests(data.map(toUiQuest));
    } catch (e) {
      console.error("❌ GET /quests failed:", e);
    }
  }, [toUiQuest]);

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  // -----------------------------
  // ✅ spent logging
  // -----------------------------
  const flushSpentFor = useCallback(
    async (questId) => {
      const userIdStr = localStorage.getItem("userId");
      const userId = userIdStr ? Number(userIdStr) : null;
      if (!userId || Number.isNaN(userId)) return;

      if (!questId) return;
      if (focusStartAt == null) return;

      const elapsedMs = Date.now() - focusStartAt;
      if (elapsedMs < 20_000) return;

      const minutes = Math.max(1, Math.round(elapsedMs / 60_000));

      try {
        await api.post("/quests/spent", {
          userId,
          questId,
          spent_at: ymd(),
          spent_minutes: minutes,
        });
      } catch (e) {
        console.error("❌ POST /quests/spent failed:", e);
      }
    },
    [focusStartAt]
  );

  const handleStartToggle = useCallback(
    async (id) => {
      const userIdStr = localStorage.getItem("userId");
      const userId = userIdStr ? Number(userIdStr) : null;
      if (!userId || Number.isNaN(userId)) {
        alert("로그인이 필요합니다. (userId 없음)");
        return;
      }

      const target = quests.find((q) => q.id === id);
      if (!target || target.done) return;

      try {
        if (target.active) {
          await flushSpentFor(target.id);
          await api.patch("/quests/status", {
            userId,
            questId: id,
            status: "prepare",
          });
        } else {
          const other = quests.find((q) => q.active && !q.done);
          if (other) {
            await flushSpentFor(other.id);
            await api.patch("/quests/status", {
              userId,
              questId: other.id,
              status: "prepare",
            });
          }

          await api.patch("/quests/status", {
            userId,
            questId: id,
            status: "active",
          });
        }

        await loadQuests();
      } catch (e) {
        console.error("❌ PATCH /quests/status failed:", e);
        alert("상태 변경 실패!");
      }
    },
    [quests, loadQuests, flushSpentFor]
  );

  const handleDone = useCallback(
    async (id) => {
      const userIdStr = localStorage.getItem("userId");
      const userId = userIdStr ? Number(userIdStr) : null;
      if (!userId || Number.isNaN(userId)) {
        alert("로그인이 필요합니다. (userId 없음)");
        return;
      }

      const target = quests.find((q) => q.id === id);
      if (!target) return;

      try {
        if (target.active) {
          await flushSpentFor(target.id);
        }

        await api.patch("/quests/status", {
          userId,
          questId: id,
          status: "done",
        });

        await loadQuests();
      } catch (e) {
        console.error("❌ PATCH /quests/status failed:", e);
        alert("Done 처리 실패!");
      }
    },
    [quests, loadQuests, flushSpentFor]
  );

  const stopAll = useCallback(async () => {
    const userIdStr = localStorage.getItem("userId");
    const userId = userIdStr ? Number(userIdStr) : null;
    if (!userId || Number.isNaN(userId)) {
      alert("로그인이 필요합니다. (userId 없음)");
      return;
    }

    const actives = quests.filter((q) => q.active && !q.done);
    if (actives.length === 0) return;

    try {
      await Promise.all(
        actives.map(async (q) => {
          await flushSpentFor(q.id);
          await api.patch("/quests/status", {
            userId,
            questId: q.id,
            status: "prepare",
          });
        })
      );

      await loadQuests();
    } catch (e) {
      console.error("❌ stopAll failed:", e);
      alert("Stop 실패!");
    }
  }, [quests, flushSpentFor, loadQuests]);

  const handleAddQuest = useCallback(
    async (info) => {
      const userIdStr = localStorage.getItem("userId");
      const userId = userIdStr ? Number(userIdStr) : null;
      if (!userId || Number.isNaN(userId)) {
        alert("로그인이 필요합니다. (userId 없음)");
        return;
      }

      try {
        await api.post("/quests", {
          userId,
          subject: info.subject,
          title: info.title,
          description: info.description || "",
          suggested_minutes: info.suggested_minutes,
          deadline: info.deadline,
          visibility: visibilityToServer(info.visibility),
        });
        await loadQuests();
      } catch (e) {
        console.error("❌ POST /quests failed:", e);
        alert("퀘스트 생성 실패!");
      }
    },
    [loadQuests]
  );

  // -----------------------------
  // ✅ Analytics
  // -----------------------------
  const modeParam = useMemo(() => {
    const m = String(mode || "").toLowerCase();
    if (m === "weekly") return "weekly";
    if (m === "monthly") return "monthly";
    return "daily";
  }, [mode]);

  const [summary, setSummary] = useState({
    achievement_rate: 0,
    total_actual_minutes: 0,
    total_planned_minutes: 0,
  });
  const [subjects, setSubjects] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const loadAnalytics = useCallback(async () => {
    const userIdStr = localStorage.getItem("userId");
    const userId = userIdStr ? Number(userIdStr) : null;
    if (!userId || Number.isNaN(userId)) return;

    setAnalyticsLoading(true);
    try {
      const [sumRes, subRes] = await Promise.all([
        api.get("/analytics/summary", { params: { userId, mode: modeParam } }),
        api.get("/analytics/subjects", { params: { userId, mode: modeParam } }),
      ]);

      const s = sumRes?.data ?? {};
      setSummary({
        achievement_rate: Number(s.achievement_rate ?? 0) || 0,
        total_actual_minutes: Number(s.total_actual_minutes ?? 0) || 0,
        total_planned_minutes: Number(s.total_planned_minutes ?? 0) || 0,
      });

      const arr = Array.isArray(subRes?.data) ? subRes.data : [];
      setSubjects(arr);
    } catch (e) {
      console.error("❌ analytics load failed:", e);
      setSubjects([]);
      setSummary({
        achievement_rate: 0,
        total_actual_minutes: 0,
        total_planned_minutes: 0,
      });
    } finally {
      setAnalyticsLoading(false);
    }
  }, [modeParam]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // -----------------------------
  // ✅ Gift API
  // -----------------------------
  const [gift, setGift] = useState({
    childId: null,
    imageUrl: "",
    message: "",
    updated_at: "",
  });
  const [giftLoading, setGiftLoading] = useState(false);

  const loadGift = useCallback(async () => {
    const childIdStr = localStorage.getItem("childId");
    const userIdStr = localStorage.getItem("userId");

    const childId =
      (childIdStr && Number(childIdStr)) ||
      (userIdStr && Number(userIdStr)) ||
      null;

    if (!childId || Number.isNaN(childId)) return;

    setGiftLoading(true);
    try {
      const res = await api.get("/parents/gift", { params: { childId } });
      const g = res?.data ?? {};
      setGift({
        childId: g.childId ?? childId,
        imageUrl: resolveGiftUrl(g.imageUrl), // ✅ prefix 적용
        message: String(g.message ?? ""),
        updated_at: String(g.updated_at ?? ""),
      });
    } catch (e) {
      console.error("❌ GET /parents/gift failed:", e);
      setGift({ childId: null, imageUrl: "", message: "", updated_at: "" });
    } finally {
      setGiftLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGift();
  }, [loadGift]);

  return (
    <div className="relative w-full overflow-hidden h-[calc(100vh-72px)]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("/background-skyfield.png")` }}
      />

      <AddQuestPopup
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddQuest}
      />

      <div className="relative mx-auto h-full w-full max-w-6xl px-6 py-6">
        <div className="h-full rounded-[32px] border border-white/40 bg-white/65 backdrop-blur-md shadow-soft overflow-hidden">
          <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[1fr_360px]">
            {/* LEFT */}
            <div className="relative p-6 h-full min-h-0 flex flex-col">
              <FocusHeader
                running={isAnyActive}
                onStop={stopAll}
                elapsedMs={focusMs}
                startAt={focusStartAt}
              />

              <div className="mt-5 rounded-2xl border border-black/10 bg-white/55 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-[#0B2B5B]">
                    Your Quests:{" "}
                    <span className="text-black/80">
                      {completedCount}/{totalCount} Completed
                    </span>{" "}
                    ✨
                  </div>
                  <div className="text-xs text-black/55">{mode} view</div>
                </div>

                <div className="mt-3 h-4 w-full overflow-hidden rounded-full border border-black/10 bg-white/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4CAF50] to-[#7CD96B] transition-[width] duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setIsAddOpen(true)}
                className="absolute left-6 bottom-6 z-30 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/50 bg-[#B0E56C]/90 backdrop-blur-md shadow-soft hover:bg-[#B0E56C]/65 transition"
                aria-label="Add quest"
                title="Add quest"
              >
                <span className="text-3xl font-bold text-[#0B2B5B] drop-shadow">
                  +
                </span>
              </button>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-24">
                <QuestList
                  quests={quests}
                  onStartToggle={handleStartToggle}
                  onDone={handleDone}
                />
              </div>
            </div>

            {/* RIGHT */}
            <aside className="border-t lg:border-t-0 lg:border-l border-black/10 bg-white/35 p-6">
              <div className="flex items-center justify-end gap-2">
                <Tab active={mode === "Daily"} onClick={() => setMode("Daily")}>
                  Daily
                </Tab>
                <Tab
                  active={mode === "Weekly"}
                  onClick={() => setMode("Weekly")}
                >
                  Weekly
                </Tab>
                <Tab
                  active={mode === "Monthly"}
                  onClick={() => setMode("Monthly")}
                >
                  Monthly
                </Tab>
              </div>

              {/* My Progress */}
              <div className="mt-4 rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm">
                <div className="text-sm font-extrabold text-[#0B2B5B]">
                  My Progress
                </div>

                <div className="mt-3 w-full min-h-[140px] rounded-xl bg-white/70 border border-black/10 flex items-center justify-center overflow-hidden px-2">
                  {analyticsLoading ? (
                    <div className="text-black/45 text-sm">Loading...</div>
                  ) : (
                    <DonutChart items={subjects} />
                  )}
                </div>

                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex items-baseline justify-between">
                    <span className="text-black/60">Achievement rate</span>
                    <span className="font-extrabold text-[#0B2B5B]">
                      {Math.round(summary.achievement_rate)}%
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-black/60">Studied time</span>
                    <span className="font-extrabold text-[#0B2B5B]">
                      {summary.total_actual_minutes} mins
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-black/60">Planned time</span>
                    <span className="font-extrabold text-[#0B2B5B]">
                      {summary.total_planned_minutes} mins
                    </span>
                  </div>
                </div>
              </div>

              {/* Gift */}
              <div className="mt-4 rounded-2xl border border-black/10 bg-[#4CAF50]/15 p-4 shadow-sm">
                <div className="text-base font-extrabold text-[#0B2B5B]">
                  Reward of this month
                </div>

                <div className="mt-2 text-sm text-black/65 leading-snug min-h-[22px]">
                  {giftLoading ? (
                    <span className="text-black/45">Loading...</span>
                  ) : gift.message ? (
                    gift.message
                  ) : (
                    <span className="text-black/40">No message yet 🌱</span>
                  )}
                </div>

                <div className="mt-3 aspect-square w-full rounded-2xl bg-white/70 border border-black/10 overflow-hidden flex items-center justify-center">
                  {giftLoading ? (
                    <div className="text-black/40">Loading image...</div>
                  ) : gift.imageUrl ? (
                    <img
                      src={gift.imageUrl}
                      alt="gift"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-black/40">gift image</div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
