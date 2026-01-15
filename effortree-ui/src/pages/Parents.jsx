"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/** -----------------------------
 * utils
 * ----------------------------- */
function cn(...args) {
  return args.filter(Boolean).join(" ");
}

function safeStr(v, fallback = "") {
  const s = String(v ?? "").trim();
  return s.length ? s : fallback;
}

function formatTimeLabel(dateLike) {
  if (!dateLike) return "";
  return new Date(dateLike).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function makeId(prefix = "id") {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

function deriveNicknameFromEmail(email) {
  const base = safeStr(email).split("@")[0] || "Student";
  const nice = base
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
  return nice || "Student";
}

/** -----------------------------
 * UI atoms
 * ----------------------------- */
function PageShell({ children }) {
  return (
    <div className="relative w-full overflow-hidden h-[calc(100vh-72px)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#EAF6E6] via-[#E7F2E1] to-[#E1F0EA]" />
      <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-[#B7E27A]/20 blur-3xl" />
      <div className="absolute top-24 -right-24 h-[340px] w-[340px] rounded-full bg-[#9ED0FF]/18 blur-3xl" />
      <div className="absolute bottom-[-120px] left-1/3 h-[380px] w-[380px] rounded-full bg-[#FFE9A6]/18 blur-3xl" />

      <div className="relative mx-auto h-full w-full max-w-6xl px-6 pt-0 pb-5">
        <div className="h-full rounded-[34px] border border-white/55 bg-white/22 backdrop-blur-md shadow-soft p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function Panel({ className = "", children }) {
  return (
    <div
      className={cn(
        "h-full rounded-[28px] border border-black/10 bg-white/55 shadow-sm backdrop-blur-md overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

function PanelHeader({ title, right }) {
  return (
    <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between gap-3 bg-white/35">
      <div className="text-[16px] font-extrabold text-[#0B2B5B]">{title}</div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function SoftBtn({ children, onClick, disabled, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-10 rounded-full px-4 text-[13px] font-extrabold border border-black/10 bg-white/80 text-[#0B2B5B] shadow-sm hover:bg-white transition disabled:opacity-50 disabled:hover:bg-white/80",
        className
      )}
    >
      {children}
    </button>
  );
}

function PrimaryBtn({ children, onClick, disabled, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-10 rounded-full px-4 text-[13px] font-extrabold bg-[#2E7D32] text-white shadow-sm hover:brightness-105 transition disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

function AccentCard({
  title,
  icon,
  accent = "green",
  right,
  children,
  className = "",
}) {
  const bar = {
    green: "bg-[#B7E27A]",
    blue: "bg-[#9ED0FF]",
    yellow: "bg-[#FFE9A6]",
    mint: "bg-[#BFEFE0]",
  }[accent];

  return (
    <div
      className={cn(
        "rounded-[22px] border border-black/10 bg-white/85 shadow-sm overflow-hidden",
        className
      )}
    >
      <div className={cn("h-[3px]", bar)} />
      <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {icon ? (
            <span className="h-8 w-8 rounded-2xl border border-black/10 bg-white flex items-center justify-center text-[16px]">
              {icon}
            </span>
          ) : null}
          <div className="text-[14px] font-extrabold text-[#0B2B5B] truncate">
            {title}
          </div>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/** -----------------------------
 * Tabs (bookmark-ish)
 * ----------------------------- */
function TabBar({ value, onChange, tabs }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              "h-10 rounded-full px-4 text-[13px] font-extrabold border shadow-sm transition",
              active
                ? "border-[#2E7D32]/25 bg-[#B7E27A]/28 text-[#0B2B5B]"
                : "border-black/10 bg-white/80 text-[#0B2B5B] hover:bg-white"
            )}
          >
            <span className="mr-1">{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function Select({ value, onChange, options, placeholder = "Select…" }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className="h-10 rounded-full border border-black/10 bg-white/85 px-4 text-[13px] font-extrabold text-[#0B2B5B] shadow-sm outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** -----------------------------
 * Chat UI
 * ----------------------------- */
function ChatBubble({ side, tone = "normal", text, time }) {
  const isLeft = side === "left";

  const bubbleClass =
    tone === "system"
      ? "bg-[#FFF6D6]/70 border-black/10 text-[#0B2B5B]"
      : isLeft
      ? "bg-white/90 border-black/10 text-[#0B2B5B]"
      : "bg-[#B7E27A]/60 border-black/10 text-[#0B2B5B]";

  return (
    <div className={cn("flex", isLeft ? "justify-start" : "justify-end")}>
      <div className="max-w-[min(86%,640px)]">
        <div
          className={cn("rounded-3xl px-5 py-4 border shadow-sm", bubbleClass)}
        >
          <div className="whitespace-pre-wrap text-[14px] leading-relaxed font-semibold">
            {text}
          </div>
        </div>
        {time ? (
          <div
            className={cn(
              "mt-1 text-[11px] font-semibold text-black/40",
              isLeft ? "pl-2" : "pr-2 text-right"
            )}
          >
            {time}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-3xl px-5 py-4 border shadow-sm bg-white/90 border-black/10">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-black/30 animate-bounce [animation-delay:-0.2s]" />
          <span className="h-2 w-2 rounded-full bg-black/30 animate-bounce [animation-delay:-0.1s]" />
          <span className="h-2 w-2 rounded-full bg-black/30 animate-bounce" />
        </div>
      </div>
    </div>
  );
}

function SuggestionBtn({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl border border-black/10 px-4 py-3 text-[13px] font-extrabold text-[#0B2B5B] shadow-sm bg-white/80 hover:bg-white transition"
      )}
    >
      {label}
    </button>
  );
}

/** -----------------------------
 * Main Page (SUDO)
 * ----------------------------- */
export default function ParentCheckinPage() {
  // pretend logged in
  const [userId, setUserId] = useState(null);

  // children list + selected
  const [children, setChildren] = useState(() => [
    // initial dummy (feel free to delete)
    { childUserId: 134, nickname: "Aiperi", email: "aiperi@school.com" },
    { childUserId: 137, nickname: "Minsu", email: "minsu@student.com" },
  ]);
  const [activeChildId, setActiveChildId] = useState(134);

  // tabs
  const [tab, setTab] = useState("overview"); // overview | gift | chat

  // connect child modal (sudo)
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectEmail, setConnectEmail] = useState("");
  const [preview, setPreview] = useState(null); // { childUserId, nickname, email }
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectErr, setConnectErr] = useState("");

  // per-child "interpretation" data (sudo)
  const [guidanceByChild, setGuidanceByChild] = useState(() => ({
    134: {
      current_guidance:
        "The recent learning flow appears generally steady, even with natural variation.\nShort pauses are often part of a healthy rhythm rather than a concern.",
      interpretation_rationale: [
        "Learning engagement naturally fluctuates",
        "Brief slowdowns do not necessarily indicate disengagement",
        "Overall flow matters more than short-term changes",
      ],
    },
    137: {
      current_guidance:
        "Momentum looks stable.\nIf there’s a pause, it’s likely a reset — not a drop-off.",
      interpretation_rationale: [
        "Continuity matters more than intensity",
        "Small recovery cycles are healthy",
        "The direction remains intact",
      ],
    },
  }));

  const [phase] = useState({
    title: "Current phase",
    main: "A phase of quiet rebuilding.",
    lines: [
      "Effort hasn’t stopped — it has softened.",
      "Direction remains intact.",
    ],
  });

  // gift (local preview only)
  const [gift, setGift] = useState({
    caption:
      "This is not a reward for performance.\nIt represents trust kept over time.",
    imageUrl: null,
  });

  // per-child chat history (sudo)
  const [chatByChild, setChatByChild] = useState(() => ({
    134: [
      {
        id: "sys-0",
        role: "assistant",
        tone: "system",
        content:
          "I don’t see raw data.\nI only help explain what has already been interpreted.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "a-0",
        role: "assistant",
        tone: "normal",
        content:
          "You might be wondering whether now is the right time to step in.\n\nBased on the current situation, the system believes it’s okay to wait.",
        createdAt: new Date().toISOString(),
      },
    ],
    137: [
      {
        id: "sys-0",
        role: "assistant",
        tone: "system",
        content:
          "I don’t see raw data.\nI only help explain what has already been interpreted.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "a-0",
        role: "assistant",
        tone: "normal",
        content:
          "From a broader view, there’s no signal that requires immediate intervention.\n\nBeing calmly available is enough for now.",
        createdAt: new Date().toISOString(),
      },
    ],
  }));

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const raw = localStorage.getItem("userId");
    const parsed = raw ? Number(raw) : 777; // fallback dummy
    setUserId(Number.isFinite(parsed) ? parsed : 777);
  }, []);

  // scroll chat when messages or tab changes
  useEffect(() => {
    if (tab !== "chat") return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [tab, activeChildId, chatByChild, isTyping]);

  const suggestions = useMemo(
    () => [
      "Why is waiting considered okay?",
      "What would count as a sign to be more present?",
      "Is taking a lighter pace a concern?",
      "How can I support without interfering?",
    ],
    []
  );

  const childOptions = useMemo(() => {
    return children.map((c) => ({
      value: c.childUserId,
      label: `${safeStr(c.nickname, `Child #${c.childUserId}`)}`,
    }));
  }, [children]);

  const activeChild = useMemo(
    () => children.find((c) => c.childUserId === activeChildId) || null,
    [children, activeChildId]
  );

  const assessment = useMemo(() => {
    const g = guidanceByChild[activeChildId];
    return {
      title: "Current assessment",
      main:
        safeStr(g?.current_guidance) ||
        "At the moment,\nno immediate intervention is needed.",
      sub: "This is based on overall patterns, not daily activity.",
    };
  }, [guidanceByChild, activeChildId]);

  const rationale = useMemo(() => {
    const g = guidanceByChild[activeChildId];
    const rr = Array.isArray(g?.interpretation_rationale)
      ? g.interpretation_rationale
      : [];
    return rr.length
      ? rr.map((x) => safeStr(x)).filter(Boolean)
      : [
          "We look for continuation, not intensity.",
          "Recovery matters more than consistency.",
          "Short pauses are not treated as regression.",
        ];
  }, [guidanceByChild, activeChildId]);

  const messages = useMemo(() => {
    return Array.isArray(chatByChild[activeChildId])
      ? chatByChild[activeChildId]
      : [];
  }, [chatByChild, activeChildId]);

  /** -----------------------------
   * Connect child (SUDO)
   * ----------------------------- */
  const openConnect = () => {
    setConnectOpen(true);
    setConnectEmail("");
    setPreview(null);
    setConnectErr("");
    setConnectLoading(false);
  };

  const closeConnect = () => setConnectOpen(false);

  const doPreview = async () => {
    const email = safeStr(connectEmail);
    if (!email) return;
    setConnectLoading(true);
    setConnectErr("");
    setPreview(null);

    // fake delay
    await new Promise((r) => setTimeout(r, 450));

    // super naive validation
    if (!email.includes("@") || !email.includes(".")) {
      setConnectErr("That doesn’t look like a valid email.");
      setConnectLoading(false);
      return;
    }

    // pretend we "found" a student id
    const childUserId = 100 + Math.floor(Math.random() * 900);
    const nickname = deriveNicknameFromEmail(email);
    setPreview({ childUserId, nickname, email });
    setConnectLoading(false);
  };

  const doLink = async () => {
    if (!preview?.childUserId) return;

    setConnectLoading(true);
    setConnectErr("");

    // fake delay
    await new Promise((r) => setTimeout(r, 350));

    const exists = children.some((c) => c.childUserId === preview.childUserId);
    if (exists) {
      setConnectErr("Already linked.");
      setConnectLoading(false);
      return;
    }

    setChildren((prev) => [
      ...prev,
      {
        childUserId: preview.childUserId,
        nickname: preview.nickname,
        email: preview.email,
      },
    ]);

    // seed interpretation + chat for new child
    setGuidanceByChild((m) => ({
      ...m,
      [preview.childUserId]: {
        current_guidance:
          "This is a demo interpretation.\nOnce backend is connected, this will reflect real guidance.",
        interpretation_rationale: [
          "Demo rationale item 1",
          "Demo rationale item 2",
          "Demo rationale item 3",
        ],
      },
    }));

    setChatByChild((m) => ({
      ...m,
      [preview.childUserId]: [
        {
          id: makeId("sys"),
          role: "assistant",
          tone: "system",
          content:
            "I don’t see raw data.\nI only help explain what has already been interpreted.",
          createdAt: new Date().toISOString(),
        },
        {
          id: makeId("a"),
          role: "assistant",
          tone: "normal",
          content:
            "This is a demo chat.\nWhen the API is plugged in, answers will come from the server.",
          createdAt: new Date().toISOString(),
        },
      ],
    }));

    setActiveChildId(preview.childUserId);
    setTab("overview");
    setConnectLoading(false);
    closeConnect();
  };

  /** -----------------------------
   * Gift
   * ----------------------------- */
  const fileInputRef = useRef(null);
  const onPickGift = () => fileInputRef.current?.click();

  const onGiftFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setGift((g) => ({ ...g, imageUrl: localUrl }));
  };

  /** -----------------------------
   * Chat send (SUDO)
   * ----------------------------- */
  const sendText = async (text) => {
    const t = safeStr(text);
    if (!t || isTyping || !activeChildId) return;

    setInput("");
    const now = new Date().toISOString();

    // append parent message
    setChatByChild((m) => ({
      ...m,
      [activeChildId]: [
        ...(m[activeChildId] || []),
        {
          id: makeId("p"),
          role: "parent",
          tone: "normal",
          content: t,
          createdAt: now,
        },
      ],
    }));

    setIsTyping(true);

    // fake delay + canned answer (per child slight variation)
    await new Promise((r) => setTimeout(r, 650));

    const answer =
      activeChildId % 2 === 0
        ? "In this demo, waiting is considered okay because the overall flow looks stable.\n\nWhen API connects, this will be personalized."
        : "This demo suggests calm support without pressure.\n\nWhen API connects, you’ll get a tailored explanation.";

    const at = new Date().toISOString();
    setChatByChild((m) => ({
      ...m,
      [activeChildId]: [
        ...(m[activeChildId] || []),
        {
          id: makeId("a"),
          role: "assistant",
          tone: "normal",
          content: answer,
          createdAt: at,
        },
      ],
    }));

    setIsTyping(false);
  };

  return (
    <PageShell>
      <Panel>
        <PanelHeader
          title="Parents · Check-in"
          right={
            <div className="text-[12px] font-semibold text-black/45">
              sudo mode (no API)
            </div>
          }
        />

        {/* Top bar: child select + connect + tabs */}
        <div className="px-6 py-4 border-b border-black/10 bg-white/28">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
            <div className="flex items-center gap-2">
              <Select
                value={activeChildId}
                onChange={(v) => setActiveChildId(v)}
                options={childOptions}
                placeholder={
                  children.length ? "Select a child" : "No child linked"
                }
              />
              <SoftBtn onClick={openConnect} className="h-10">
                + Connect
              </SoftBtn>
            </div>

            <div className="lg:ml-auto">
              <TabBar
                value={tab}
                onChange={setTab}
                tabs={[
                  { value: "overview", label: "Overview", icon: "📌" },
                  { value: "gift", label: "Gift", icon: "🎁" },
                  { value: "chat", label: "Chat", icon: "💬" },
                ]}
              />
            </div>
          </div>

          <div className="mt-3 text-[12px] font-semibold text-black/50">
            {activeChild ? (
              <>
                Viewing:{" "}
                <span className="font-extrabold text-[#0B2B5B]">
                  {safeStr(
                    activeChild.nickname,
                    `Child #${activeChild.childUserId}`
                  )}
                </span>
                <span className="text-black/35"> · </span>
                <span className="text-black/45">
                  {safeStr(activeChild.email, "")}
                </span>
              </>
            ) : (
              <>Select a child to view interpretation.</>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-56px-76px)] p-6 overflow-y-auto">
          {!activeChildId ? (
            <div className="rounded-[24px] border border-black/10 bg-white/70 p-6">
              <div className="text-[16px] font-extrabold text-[#0B2B5B]">
                No child selected
              </div>
              <div className="mt-2 text-[13px] font-semibold text-black/55">
                Connect a child by email, then select them from the top.
              </div>
              <div className="mt-4">
                <PrimaryBtn onClick={openConnect}>Connect a child</PrimaryBtn>
              </div>
            </div>
          ) : (
            <>
              {tab === "overview" ? (
                <div className="grid gap-4">
                  <AccentCard title={assessment.title} icon="✓" accent="green">
                    <div className="inline-flex rounded-2xl bg-[#B7E27A]/22 px-4 py-3">
                      <div className="text-[16px] sm:text-[18px] font-extrabold text-[#0B2B5B] leading-snug whitespace-pre-line">
                        {assessment.main}
                      </div>
                    </div>

                    <div className="mt-3 text-[12px] font-semibold text-black/50">
                      {assessment.sub}
                    </div>
                  </AccentCard>

                  <AccentCard
                    title="How we interpret the situation"
                    icon="🔎"
                    accent="blue"
                  >
                    <ul className="space-y-2 text-[13px] font-semibold text-black/60">
                      {rationale.map((x, i) => (
                        <li key={i}>• {x}</li>
                      ))}
                    </ul>
                  </AccentCard>

                  <AccentCard title={phase.title} icon="◌" accent="mint">
                    <div className="text-[18px] font-extrabold text-[#0B2B5B]">
                      {phase.main}
                    </div>
                    <div className="mt-3 text-[13px] font-semibold text-black/60 leading-relaxed">
                      • {phase.lines?.[0]}
                    </div>
                    <div className="mt-2 text-[13px] font-semibold text-black/60 leading-relaxed">
                      • {phase.lines?.[1]}
                    </div>
                  </AccentCard>
                </div>
              ) : null}

              {tab === "gift" ? (
                <div className="grid gap-4">
                  <AccentCard
                    title="Promise gift"
                    icon="🎁"
                    accent="yellow"
                    right={
                      <SoftBtn onClick={onPickGift} className="h-9">
                        Edit
                      </SoftBtn>
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-black/10 bg-white/70 overflow-hidden">
                        <div className="aspect-[4/3] bg-black/5 flex items-center justify-center">
                          {gift.imageUrl ? (
                            <img
                              src={gift.imageUrl}
                              alt="Gift"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-[12px] font-extrabold text-black/35 px-4 text-center">
                              Promise gift preview
                            </div>
                          )}
                        </div>
                        <div className="px-4 py-3 border-t border-black/10 text-[12px] font-semibold text-black/55 whitespace-pre-line">
                          {gift.caption}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
                        <div className="text-[14px] font-extrabold text-[#0B2B5B]">
                          Message
                        </div>
                        <div className="mt-2 text-[13px] font-semibold text-black/60 whitespace-pre-line leading-relaxed">
                          {gift.caption}
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <PrimaryBtn onClick={onPickGift} disabled={!userId}>
                            Upload / Update
                          </PrimaryBtn>
                          {!userId ? (
                            <div className="text-[12px] font-semibold text-black/40">
                              Login required
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onGiftFileChange}
                    />
                  </AccentCard>
                </div>
              ) : null}

              {tab === "chat" ? (
                <div className="grid gap-4">
                  <AccentCard
                    title="Check-in Companion"
                    icon="💬"
                    accent="mint"
                    right={
                      <div className="text-[12px] font-semibold text-black/45">
                        Chat
                      </div>
                    }
                  >
                    <div className="flex flex-col h-[560px] max-h-[calc(100vh-300px)]">
                      <div
                        ref={listRef}
                        className="flex-1 min-h-0 overflow-y-auto pr-2"
                      >
                        <div className="flex flex-col gap-3">
                          {messages.map((m) => (
                            <ChatBubble
                              key={m.id}
                              side={m.role === "parent" ? "right" : "left"}
                              tone={m.tone}
                              text={m.content}
                              time={formatTimeLabel(m.createdAt)}
                            />
                          ))}
                          {isTyping && <TypingBubble />}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {suggestions.map((s) => (
                          <SuggestionBtn
                            key={s}
                            label={s}
                            onClick={() => sendText(s)}
                          />
                        ))}
                      </div>

                      <div className="mt-4 flex gap-3">
                        <input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && sendText(input)
                          }
                          placeholder="Ask a question…"
                          className="flex-1 h-12 rounded-full border border-black/10 bg-white/90 px-5 text-[14px] font-semibold outline-none"
                        />
                        <PrimaryBtn
                          onClick={() => sendText(input)}
                          disabled={
                            !safeStr(input) || isTyping || !activeChildId
                          }
                          className="h-12"
                        >
                          Send
                        </PrimaryBtn>
                      </div>
                    </div>
                  </AccentCard>
                </div>
              ) : null}
            </>
          )}
        </div>
      </Panel>

      {/* Connect Child Modal (SUDO) */}
      {connectOpen ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={closeConnect}
          />
          <div className="relative w-full max-w-[520px] rounded-[26px] border border-black/10 bg-white/90 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between">
              <div className="text-[15px] font-extrabold text-[#0B2B5B]">
                Connect a child (sudo)
              </div>
              <SoftBtn onClick={closeConnect} className="h-9">
                Close
              </SoftBtn>
            </div>

            <div className="p-6">
              <div className="text-[12px] font-extrabold text-black/55 mb-2">
                Child email
              </div>
              <input
                value={connectEmail}
                onChange={(e) => setConnectEmail(e.target.value)}
                placeholder="student@email.com"
                className="w-full h-12 rounded-full border border-black/10 bg-white px-5 text-[14px] font-semibold outline-none"
              />

              <div className="mt-3 flex gap-2">
                <PrimaryBtn
                  onClick={doPreview}
                  disabled={!safeStr(connectEmail) || connectLoading}
                  className="h-11"
                >
                  {connectLoading ? "Checking…" : "Check"}
                </PrimaryBtn>
                <SoftBtn
                  onClick={() => {
                    setConnectEmail("");
                    setPreview(null);
                    setConnectErr("");
                  }}
                  disabled={connectLoading}
                  className="h-11"
                >
                  Reset
                </SoftBtn>
              </div>

              {connectErr ? (
                <div className="mt-3 text-[12px] font-semibold text-red-600/80">
                  {connectErr}
                </div>
              ) : null}

              {preview ? (
                <div className="mt-5 rounded-2xl border border-black/10 bg-white/80 p-4">
                  <div className="text-[12px] font-extrabold text-black/55">
                    Found student (fake)
                  </div>
                  <div className="mt-2 text-[14px] font-extrabold text-[#0B2B5B]">
                    {preview.nickname}
                    <span className="ml-2 text-[12px] font-semibold text-black/40">
                      (ID: {preview.childUserId})
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-black/45">
                    {preview.email}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <PrimaryBtn
                      onClick={doLink}
                      disabled={connectLoading}
                      className="h-11"
                    >
                      {connectLoading ? "Linking…" : "Link"}
                    </PrimaryBtn>
                    <div className="text-[12px] font-semibold text-black/45">
                      Adds this child to the dropdown.
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
