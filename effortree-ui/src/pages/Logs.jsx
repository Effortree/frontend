"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "@/lib/api.js";

/** -----------------------------
 * utils
 * ----------------------------- */
function ymd(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function prettyFullDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function cn(...args) {
  return args.filter(Boolean).join(" ");
}

function normType(t) {
  const x = String(t || "")
    .toLowerCase()
    .trim();
  if (x === "learned") return "learned";
  if (x === "insight") return "insight";
  if (x === "todo" || x === "to do" || x === "to-do") return "to do";
  return x;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function typeLabel(t) {
  const x = normType(t);
  if (x === "learned") return "Learned";
  if (x === "to do") return "To-do";
  if (x === "insight") return "Insights";
  return t;
}

function typeTone(t) {
  const x = normType(t);
  if (x === "learned") return "green";
  if (x === "to do") return "blue";
  if (x === "insight") return "yellow";
  return "gray";
}

function typeIcon(t) {
  const x = normType(t);
  if (x === "learned") return "✅";
  if (x === "to do") return "➡️";
  if (x === "insight") return "💡";
  return "📝";
}

/** -----------------------------
 * UI atoms
 * ----------------------------- */
function Pill({ children, tone = "gray" }) {
  const map = {
    gray: "bg-black/10 text-black/60",
    green: "bg-[#B7E27A]/70 text-[#0B2B5B]",
    blue: "bg-[#9ED0FF]/55 text-[#0B2B5B]",
    yellow: "bg-[#FFE9A6]/80 text-[#0B2B5B]",
    pink: "bg-[#FFB4B4]/70 text-[#0B2B5B]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[12px] font-extrabold",
        map[tone] ?? map.gray
      )}
    >
      {children}
    </span>
  );
}

function SoftButton({ children, onClick, className = "", disabled, type }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type ?? "button"}
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
      className="h-10 w-10 rounded-full border border-white/50 bg-white/60 backdrop-blur-md shadow-soft hover:bg-white/80 transition flex items-center justify-center disabled:opacity-50 disabled:hover:bg-white/60"
    >
      {children}
    </button>
  );
}

/** -----------------------------
 * Modal (generic)
 * ----------------------------- */
function Modal({ open, title, children, onClose, onConfirm, confirmText }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[640px] rounded-[28px] border border-black/10 bg-white/85 shadow-soft backdrop-blur-md overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10 text-sm font-extrabold text-[#0B2B5B]">
          {title}
        </div>
        <div className="p-6">{children}</div>
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <SoftButton onClick={onClose}>Cancel</SoftButton>
          <button
            onClick={onConfirm}
            className="h-11 px-5 rounded-full bg-[#2E7D32] text-white font-extrabold"
          >
            {confirmText ?? "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** -----------------------------
 * Summary Modal (dedicated - view only)
 * ----------------------------- */
function SummaryModal({ open, dateLabel, loading, summary, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[720px] rounded-[28px] border border-black/10 bg-white/85 shadow-soft backdrop-blur-md overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between gap-3">
          <div className="text-sm font-extrabold text-[#0B2B5B]">
            Today&apos;s summary
          </div>
          <div className="text-[12px] font-semibold text-black/45">
            {dateLabel}
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-[22px] border border-black/10 bg-white/80 p-4">
            {loading ? (
              <div className="text-[14px] font-semibold text-black/45">
                Summarizing…
              </div>
            ) : summary?.trim() ? (
              <div className="whitespace-pre-wrap text-[16px] leading-relaxed font-semibold text-black/75">
                {summary}
              </div>
            ) : (
              <div className="text-[14px] font-semibold text-black/45">
                No summary available for this day.
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center justify-end">
          <SoftButton onClick={onClose}>Close</SoftButton>
        </div>
      </div>
    </div>
  );
}

/** -----------------------------
 * Mini Calendar (simple)
 * ----------------------------- */
function MiniCalendar({ value, onChange }) {
  const [cursor, setCursor] = useState(() => new Date(value));

  useEffect(() => {
    setCursor(new Date(value));
  }, [value]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();
  const days = last.getDate();

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));

  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const selectedYmd = ymd(value);

  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconButton
            title="Prev month"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
          >
            ‹
          </IconButton>
          <div className="text-sm font-extrabold text-[#0B2B5B]">
            {monthLabel}
          </div>
          <IconButton
            title="Next month"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
          >
            ›
          </IconButton>
        </div>

        <SoftButton
          className="px-4 py-1.5 text-[12px]"
          onClick={() => onChange(new Date())}
        >
          Today
        </SoftButton>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[11px] font-extrabold text-black/45 mb-2">
        {["S", "M", "T", "W", "Th", "F", "S"].map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((dt, idx) => {
          if (!dt) return <div key={idx} className="h-9" />;

          const isSel = ymd(dt) === selectedYmd;
          const isToday = ymd(dt) === ymd(new Date());

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(dt)}
              className={cn(
                "h-9 rounded-xl border text-[12px] font-extrabold transition",
                isSel
                  ? "bg-[#B7E27A]/70 border-black/10 text-[#0B2B5B]"
                  : "bg-white/70 border-black/10 text-black/60 hover:bg-white",
                isToday && !isSel ? "ring-1 ring-black/10" : ""
              )}
            >
              {dt.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** -----------------------------
 * Log Item Card (feed)
 * ----------------------------- */
function LogItemCard({ item, onEdit, onDelete }) {
  const tone = typeTone(item.type);
  const toneBg = {
    green: "bg-[#B7E27A]/55",
    blue: "bg-[#9ED0FF]/45",
    yellow: "bg-[#FFE9A6]/55",
    gray: "bg-black/10",
  }[tone];

  return (
    <div className="rounded-[26px] border border-black/10 bg-white/55 shadow-sm">
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className={cn(
              "h-12 w-12 rounded-2xl border border-black/10 flex items-center justify-center text-[22px] shrink-0",
              toneBg
            )}
          >
            {typeIcon(item.type)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[18px] font-extrabold text-[#0B2B5B]">
                {typeLabel(item.type)}
              </div>
              <Pill tone={tone}>{typeLabel(item.type)}</Pill>
            </div>

            <div className="mt-2 whitespace-pre-wrap text-[16px] leading-relaxed font-semibold text-black/70 break-words">
              {item.content}
            </div>

            {(item.tags ?? []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(item.tags ?? []).map((t) => (
                  <Pill key={t} tone="gray">
                    {t}
                  </Pill>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <IconButton title="Edit" onClick={onEdit}>
            ✏️
          </IconButton>
          <IconButton title="Delete" onClick={onDelete}>
            🗑️
          </IconButton>
        </div>
      </div>
    </div>
  );
}

/** -----------------------------
 * Main
 * ----------------------------- */
export default function LogPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ search mode
  const [searchMode, setSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState("learned");
  const [addContent, setAddContent] = useState("");
  const [addTags, setAddTags] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  // ✅ summary modal
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState("");

  // edit modal
  const [edit, setEdit] = useState({ open: false, target: null });
  const [draft, setDraft] = useState("");
  const [draftTags, setDraftTags] = useState("");

  // tag/search panel
  const [tagQuery, setTagQuery] = useState("");
  const [tagLimit, setTagLimit] = useState(6);

  const dateKey = ymd(selectedDate);

  const userId = useMemo(() => {
    const s =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const n = s ? Number(s) : null;
    return n && !Number.isNaN(n) ? n : null;
  }, []);

  const loadByDate = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.get("/logs", { params: { userId, date: dateKey } });
      const data = res?.data?.entries ?? [];
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("❌ GET /logs failed:", e);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [userId, dateKey]);

  useEffect(() => {
    // 날짜 바꾸면 "날짜 기반 모드"로 자동 복귀
    setSearchMode(false);
    setSearchResults([]);
    loadByDate();
  }, [loadByDate, dateKey]);

  /** -----------------------------
   * Search: /logs/search
   * ----------------------------- */
  const runSearch = useCallback(async () => {
    if (!userId) {
      alert("로그인이 필요합니다. (userId 없음)");
      return;
    }
    const q = tagQuery.trim();
    if (!q) {
      setSearchMode(false);
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const res = await api.get("/logs/search", {
        params: { userId, content: q },
      });
      const data = res?.data?.entries ?? [];
      setSearchResults(Array.isArray(data) ? data : []);
      setSearchMode(true);
      setTagLimit(6);
    } catch (e) {
      console.error("❌ GET /logs/search failed:", e);
      alert("검색 실패!");
    } finally {
      setSearching(false);
    }
  }, [userId, tagQuery]);

  const clearSearch = useCallback(() => {
    setTagQuery("");
    setSearchMode(false);
    setSearchResults([]);
    setTagLimit(6);
  }, []);

  // ✅ 현재 뷰(검색이면 searchResults, 아니면 entries)
  const baseList = searchMode ? searchResults : entries;

  // ✅ feed 정렬
  const feed = useMemo(() => {
    const copy = [...baseList];
    copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return copy;
  }, [baseList]);

  // ✅ tags도 현재 뷰 기준으로 계산 (검색 결과 consume)
  const tagsSource = baseList;

  const allTags = useMemo(() => {
    const tags = tagsSource.flatMap((e) => e.tags ?? []);
    return uniq(tags);
  }, [tagsSource]);

  const filteredTags = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    const list = q
      ? allTags.filter((t) => t.toLowerCase().includes(q))
      : allTags;
    return list.slice(0, tagLimit);
  }, [allTags, tagQuery, tagLimit]);

  /** -----------------------------
   * Add
   * ----------------------------- */
  const openAdd = () => {
    setAddOpen(true);
    setAddType("learned");
    setAddContent("");
    setAddTags("");
  };

  const closeAdd = () => {
    setAddOpen(false);
    setAddContent("");
    setAddTags("");
  };

  const submitAdd = async () => {
    if (!userId) {
      alert("로그인이 필요합니다. (userId 없음)");
      return;
    }
    if (!addContent.trim()) return;

    const tags = uniq(
      addTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );

    try {
      setAddSaving(true);
      await api.post("/logs", {
        userId,
        type: addType,
        content: addContent.trim(),
        tags,
      });
      closeAdd();

      await loadByDate();
      // 검색모드면 검색도 재실행해서 결과 최신화
      if (searchMode && tagQuery.trim()) await runSearch();
    } catch (e) {
      console.error("❌ POST /logs failed:", e);
      alert("추가 실패!");
    } finally {
      setAddSaving(false);
    }
  };

  /** -----------------------------
   * Summary (separate modal)
   * ----------------------------- */
  const todaysSummary = async () => {
    if (!userId) {
      alert("로그인이 필요합니다. (userId 없음)");
      return;
    }

    setSummaryOpen(true);
    setSummaryLoading(true);
    setSummaryText("");

    try {
      const res = await api.get("/logs/summary", {
        params: { userId, date: dateKey }, // "YYYY-MM-DD"
      });

      // response: { userId, date, summary, createdAt, updatedAt }
      setSummaryText(res?.data?.summary ?? "");
    } catch (e) {
      console.error("❌ GET /logs/summary failed:", e);
      setSummaryText("");
      alert("summary 불러오기 실패!");
    } finally {
      setSummaryLoading(false);
    }
  };

  const closeSummary = () => {
    setSummaryOpen(false);
    setSummaryLoading(false);
    setSummaryText("");
  };

  /** -----------------------------
   * Edit/Delete
   * ----------------------------- */
  const openEdit = (item) => {
    setEdit({ open: true, target: item });
    setDraft(item.content ?? "");
    setDraftTags((item.tags ?? []).join(", "));
  };

  const closeEdit = () => {
    setEdit({ open: false, target: null });
    setDraft("");
    setDraftTags("");
  };

  const saveEdit = async () => {
    if (!userId) return;
    const item = edit.target;
    if (!item) return;

    const tags = uniq(
      draftTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );

    try {
      await api.patch("/logs", {
        pageId: item.pageId,
        userId,
        content: draft,
        tags,
      });
      closeEdit();

      await loadByDate();
      if (searchMode && tagQuery.trim()) await runSearch();
    } catch (e) {
      console.error("❌ PATCH /logs failed:", e);
      alert("수정 실패!");
    }
  };

  const deleteEntry = async (item) => {
    if (!userId) {
      alert("로그인이 필요합니다. (userId 없음)");
      return;
    }
    if (!confirm("Delete this log?")) return;

    try {
      await api.delete("/logs", { params: { userId, pageId: item.pageId } });

      await loadByDate();
      if (searchMode && tagQuery.trim()) await runSearch();
    } catch (e) {
      console.error("❌ DELETE /logs failed:", e);
      alert("삭제 실패!");
    }
  };

  // Enter로 검색
  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") runSearch();
  };

  return (
    <div className="relative w-full overflow-hidden h-[calc(100vh-72px)]">
      {/* background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("/background-skyfield.png")` }}
      />

      {/* container */}
      <div className="relative mx-auto h-full w-full max-w-6xl px-6 py-6">
        <div className="h-full rounded-[32px] border border-white/40 bg-white/65 backdrop-blur-md shadow-soft overflow-hidden">
          <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[1fr_360px]">
            {/* LEFT */}
            <div className="relative p-6 h-full min-h-0 flex flex-col">
              {/* header bar */}
              <div className="rounded-2xl border border-black/10 bg-white/55 p-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl border border-black/10 bg-white/70 shadow-sm flex items-center justify-center text-[18px]">
                    📓
                  </div>

                  <div className="min-w-0">
                    <div className="text-[22px] font-extrabold text-[#0B2B5B] leading-tight break-keep">
                      Daily log for {prettyFullDate(selectedDate)}
                    </div>

                    {(loading || searching) && (
                      <div className="mt-1 text-[12px] font-semibold text-black/45">
                        {loading ? "loading…" : "searching…"}
                      </div>
                    )}

                    {searchMode && (
                      <div className="mt-1 text-[12px] font-semibold text-black/50">
                        Showing search results for{" "}
                        <span className="font-extrabold text-[#0B2B5B]">
                          “{tagQuery.trim()}”
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-[12px] font-semibold text-black/45">
                    Small effort, real growth.
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <SoftButton onClick={openAdd}>
                      + Add a quick note
                    </SoftButton>
                    <SoftButton onClick={todaysSummary}>
                      Today&apos;s summary
                    </SoftButton>
                  </div>
                </div>
              </div>

              {/* feed area */}
              <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1 pb-6">
                {feed.length === 0 ? (
                  <div className="rounded-[26px] border border-black/10 bg-white/55 shadow-sm p-10 text-center">
                    <div className="text-[22px] font-extrabold text-[#0B2B5B]">
                      {searchMode ? "No results" : "Empty day"}
                    </div>
                    <div className="mt-2 text-[14px] font-semibold text-black/50">
                      {searchMode
                        ? "Try another keyword."
                        : "Click Add a quick note to create your first log."}
                    </div>
                    {searchMode && (
                      <div className="mt-4 flex justify-center">
                        <SoftButton onClick={clearSearch}>
                          Clear search
                        </SoftButton>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {feed.map((it) => (
                      <LogItemCard
                        key={it.pageId}
                        item={it}
                        onEdit={() => openEdit(it)}
                        onDelete={() => deleteEntry(it)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <aside className="border-t lg:border-t-0 lg:border-l border-black/10 bg-white/35 p-6">
              <MiniCalendar value={selectedDate} onChange={setSelectedDate} />

              <div className="mt-4 rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm">
                <div className="text-[22px] font-extrabold text-[#0B2B5B]">
                  Tags
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {filteredTags.length === 0 ? (
                    <div className="text-sm font-semibold text-black/45">
                      No tags.
                    </div>
                  ) : (
                    filteredTags.map((t) => (
                      <Pill key={t} tone="gray">
                        {t}
                      </Pill>
                    ))
                  )}
                </div>

                <div className="mt-4">
                  <SoftButton
                    className="w-full justify-center"
                    onClick={() => setTagLimit((n) => n + 6)}
                    disabled={filteredTags.length >= allTags.length}
                  >
                    Load more
                  </SoftButton>
                </div>

                {/* ✅ Search input uses /logs/search */}
                <div className="mt-4 flex gap-2 items-stretch">
                  <input
                    value={tagQuery}
                    onChange={(e) => setTagQuery(e.target.value)}
                    onKeyDown={onSearchKeyDown}
                    placeholder="Search keyword"
                    className="flex-1 min-w-0 h-11 rounded-full border border-black/10 bg-white/80 px-4 text-[14px] font-semibold outline-none"
                  />

                  <button
                    type="button"
                    onClick={runSearch}
                    disabled={searching}
                    className={cn(
                      "h-11 rounded-full text-white font-extrabold transition whitespace-nowrap shrink-0 px-5 min-w-[96px]",
                      searching
                        ? "bg-[#2E7D32]/40 cursor-not-allowed"
                        : "bg-[#2E7D32] hover:brightness-95"
                    )}
                  >
                    {searching ? "..." : "Search"}
                  </button>
                </div>

                {searchMode && (
                  <div className="mt-3">
                    <SoftButton className="w-full" onClick={clearSearch}>
                      Clear search
                    </SoftButton>
                  </div>
                )}

                <div className="mt-4 border-t border-black/10 pt-4">
                  <div className="text-[12px] font-extrabold text-black/45 mb-2">
                    Total logs (this view):{" "}
                    <span className="text-[#0B2B5B]">{baseList.length}</span>
                  </div>

                  <div className="text-[12px] font-extrabold text-black/45">
                    Total tags (this view):{" "}
                    <span className="text-[#0B2B5B]">{allTags.length}</span>
                  </div>

                  {!searchMode && (
                    <div className="mt-1 text-[12px] font-semibold text-black/40">
                      (date: {entries.length})
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ✅ Summary Modal */}
      <SummaryModal
        open={summaryOpen}
        dateLabel={prettyFullDate(selectedDate)}
        loading={summaryLoading}
        summary={summaryText}
        onClose={closeSummary}
      />

      {/* Add Modal */}
      <Modal
        open={addOpen}
        title="Add a quick note"
        onClose={closeAdd}
        onConfirm={submitAdd}
        confirmText={addSaving ? "Adding..." : "Add"}
      >
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { v: "learned", label: "Learned" },
              { v: "to do", label: "To-do" },
              { v: "insight", label: "Insights" },
            ].map((x) => (
              <button
                key={x.v}
                type="button"
                onClick={() => setAddType(x.v)}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-extrabold border transition",
                  addType === x.v
                    ? "bg-[#B7E27A]/70 border-black/10 text-[#0B2B5B]"
                    : "bg-white/70 border-black/10 text-black/60 hover:bg-white"
                )}
              >
                {x.label}
              </button>
            ))}
          </div>

          <textarea
            value={addContent}
            onChange={(e) => setAddContent(e.target.value)}
            rows={6}
            className="w-full rounded-[22px] border border-black/10 bg-white/80 p-4 text-[14px] font-semibold outline-none"
            placeholder="Write your note…"
          />

          <input
            value={addTags}
            onChange={(e) => setAddTags(e.target.value)}
            className="w-full h-11 rounded-full border border-black/10 bg-white/80 px-4 text-[14px] font-semibold outline-none"
            placeholder="tags (comma separated)  e.g. English, mindset"
          />

          <div className="text-[12px] font-semibold text-black/45">
            Tip: same section can have multiple logs. They show up as separate
            cards.
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={edit.open}
        title="Edit log"
        onClose={closeEdit}
        onConfirm={saveEdit}
        confirmText="Save"
      >
        <div className="grid gap-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            className="w-full rounded-[22px] border border-black/10 bg-white/80 p-4 text-[14px] font-semibold outline-none"
            placeholder="Edit content…"
          />
          <input
            value={draftTags}
            onChange={(e) => setDraftTags(e.target.value)}
            className="w-full h-11 rounded-full border border-black/10 bg-white/80 px-4 text-[14px] font-semibold outline-none"
            placeholder="tags (comma separated)"
          />
        </div>
      </Modal>
    </div>
  );
}
