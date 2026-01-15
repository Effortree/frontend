"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Tab from "@/app/ui/Tab";
import QuestItem from "@/app/ui/QuestItem";
import FocusHeader from "@/app/ui/FocusHeader";
import { api } from "@/lib/api.js";

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

          {/* ✅ 팝업: 정중앙 */}
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

  // ✅ 서버에서 받아온 quests를 UI 모델로 들고 있음
  const [quests, setQuests] = useState([]);

  const totalCount = quests.length;
  const completedCount = useMemo(
    () => quests.filter((q) => q.done).length,
    [quests]
  );
  const progressPct =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const isAnyActive = useMemo(() => quests.some((q) => q.active), [quests]);

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
  // ✅ 서버 <-> UI 매핑 유틸
  // -----------------------------
  const toUiQuest = useCallback((q) => {
    // 서버: visibility "me-only" | "shared"
    // UI: "Me-only" | "Shared"
    const uiVisibility = q.visibility === "me-only" ? "Me-only" : "Shared";
    return {
      id: q.questId, // ✅ UI id = questId
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

      const nextStatus = target.active ? "prepare" : "active";

      try {
        await api.patch("/quests/status", {
          userId,
          questId: id, // ✅ id == questId
          status: nextStatus,
        });
        // ✅ 서버 기준 재동기화
        await loadQuests();
      } catch (e) {
        console.error("❌ PATCH /quests/status failed:", e);
        alert("상태 변경 실패!");
      }
    },
    [quests, loadQuests]
  );

  const handleDone = useCallback(
    async (id) => {
      const userIdStr = localStorage.getItem("userId");
      const userId = userIdStr ? Number(userIdStr) : null;
      if (!userId || Number.isNaN(userId)) {
        alert("로그인이 필요합니다. (userId 없음)");
        return;
      }

      try {
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
    [loadQuests]
  );

  // stopAll은 기존 UI 동작 유지: "내 화면에서만" stop
  // (원하면 서버에도 prepare로 일괄 PATCH 하도록 바꿀 수 있음)
  const stopAll = useCallback(() => {
    setQuests((qs) => qs.map((q) => (q.active ? { ...q, active: false } : q)));
  }, []);

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
          visibility: visibilityToServer(info.visibility), // ✅ "me-only" | "shared"
        });
        await loadQuests();
      } catch (e) {
        console.error("❌ POST /quests failed:", e);
        alert("퀘스트 생성 실패!");
      }
    },
    [loadQuests]
  );

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
          {/* ✅ min-h-0 중요: 내부 overflow가 동작하게 */}
          <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[1fr_360px]">
            {/* LEFT */}
            {/* ✅ relative + min-h-0 + flex-col: 버튼 고정 + 스크롤 동작 */}
            <div className="relative p-6 h-full min-h-0 flex flex-col">
              <FocusHeader
                running={isAnyActive}
                onStop={stopAll}
                elapsedMs={focusMs}
                startAt={focusStartAt}
              />

              {/* Progress */}
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

              {/* ✅ Quest list: 여기만 스크롤 (pb-24로 버튼에 가림 방지) */}
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

              <div className="mt-4 rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm">
                <div className="text-sm font-extrabold text-[#0B2B5B]">
                  My Progress
                </div>
                <div className="mt-3 aspect-[16/9] w-full rounded-xl bg-white/70 border border-black/10 flex items-center justify-center text-black/40">
                  chart placeholder
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <div className="text-black/70">
                    <span className="font-extrabold text-[#0B2B5B]">52</span>{" "}
                    mins
                  </div>
                  <div className="text-black/70">
                    <span className="font-extrabold text-[#0B2B5B]">4</span>{" "}
                    days
                  </div>
                  <div className="text-black/70">
                    +<span className="font-extrabold text-[#0B2B5B]">24</span>{" "}
                    pts
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-black/10 bg-[#4CAF50]/15 p-4 shadow-sm">
                <div className="text-base font-extrabold text-[#0B2B5B]">
                  Reward of this month
                </div>
                <div className="mt-3 aspect-square w-full rounded-2xl bg-white/70 border border-black/10 flex items-center justify-center text-black/40">
                  reward image
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
