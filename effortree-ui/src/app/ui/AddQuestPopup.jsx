"use client";

import React, { useState } from "react";
import PillButton from "@/app/ui/PillButton";
import { motion, AnimatePresence } from "framer-motion";

export default function AddQuestPopup({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    subject: "",
    topic: "",
    suggested_minutes: 30,
    deadline: "",
    visibility: "Shared",
  });

  const update = (k, v) =>
    setForm((f) => ({
      ...f,
      [k]: v,
    }));

  const handleSubmit = () => {
    if (!form.title || !form.deadline) return;
    onSubmit?.(form);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* POPUP CARD */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-md p-5 z-[60]"
          >
            <div className="rounded-[24px] border border-black/10 bg-white shadow-soft p-5 flex flex-col gap-3">
              <div className="text-lg font-extrabold text-[#0B2B5B]">
                Add New Quest
              </div>

              <input
                placeholder="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
              />

              <input
                placeholder="subject"
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
              />

              <input
                placeholder="topic"
                value={form.topic}
                onChange={(e) => update("topic", e.target.value)}
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
              />

              <input
                type="date"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
              />

              <div className="flex justify-end gap-2 mt-2">
                <PillButton variant="secondary" onClick={onClose}>
                  Cancel
                </PillButton>

                <PillButton variant="primary" onClick={handleSubmit}>
                  Add
                </PillButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
