"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PillButton from "@/app/ui/PillButton";

export default function QuestItem({
  subject,
  title,
  description,
  deadline,
  eta,
  done,
  active,
  onStart,
  onDone,
}) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded((v) => !v);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        x: 140,
        transition: { duration: 0.28, ease: "easeInOut" },
      }}
      className={[
        "rounded-2xl border border-black/10 bg-white/65 p-4 shadow-sm",
        active ? "ring-2 ring-[#2196F3]/30" : "",
      ].join(" ")}
    >
      {/* 상단 row (클릭 영역) */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleExpanded}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF7D5] border border-black/10 shrink-0"
          aria-label="Toggle quest details"
          title="Toggle details"
        >
          <span className="text-xl">🧪</span>
        </button>

        {/* ✅ subject 크게, title은 아래 */}
        <button onClick={toggleExpanded} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <div className="text-lg font-extrabold text-[#0B2B5B] truncate">
              {subject}
            </div>

            {done ? (
              <span className="rounded-full bg-[#4CAF50]/15 px-2 py-0.5 text-xs font-bold text-[#2F7A35]">
                Done
              </span>
            ) : active ? (
              <span className="rounded-full bg-[#2196F3]/15 px-2 py-0.5 text-xs font-bold text-[#0B2B5B]">
                Active
              </span>
            ) : null}
          </div>

          <div className="truncate text-sm text-black/70 mt-0.5">{title}</div>
        </button>

        <div className="hidden sm:flex flex-col items-end gap-1 rounded-2xl bg-white/70 px-3 py-2 border border-black/10">
          <div className="text-xs text-black/55">
            deadline:{" "}
            <span className="font-semibold text-[#E53935]">{deadline}</span>
          </div>
          <div className="text-xs text-black/55">
            Estimated:{" "}
            <span className="font-semibold text-[#0B2B5B]">{eta}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PillButton variant="secondary" onClick={onStart} disabled={done}>
            {active ? "Stop" : "Start"}
          </PillButton>
          <PillButton variant="primary" onClick={onDone} disabled={done}>
            Done
          </PillButton>
        </div>
      </div>

      {/* ✅ 펼쳐지는 description */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ opacity: 0, height: 0, y: -2 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-2xl border border-black/10 bg-white/70 p-4 text-sm text-black/70">
              {description?.trim() ? description : "No description yet."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
