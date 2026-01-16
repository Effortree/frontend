"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api.js";

/** -----------------------------
 * utils
 * ----------------------------- */
const API_ORIGIN = "http://168.107.21.74:8000";

function cn(...args) {
  return args.filter(Boolean).join(" ");
}

function safeStr(v, fallback = "") {
  const s = String(v ?? "").trim();
  return s.length ? s : fallback;
}

function withApiOrigin(url) {
  const s = safeStr(url, "");
  if (!s) return null;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `${API_ORIGIN}${s.startsWith("/") ? "" : "/"}${s}`;
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
function ChatBubble({ side, tone = "normal", text, time, imageUrl }) {
  const isLeft = side === "left";

  const bubbleClass =
    tone === "system"
      ? "bg-[#FFF6D6]/70 border-black/10 text-[#0B2B5B]"
      : isLeft
      ? "bg-white/90 border-black/10 text-[#0B2B5B]"
      : "bg-[#B7E27A]/60 border-black/10 text-[#0B2B5B]";

  const resolvedImg = imageUrl
    ? imageUrl.startsWith("blob:")
      ? imageUrl
      : withApiOrigin(imageUrl)
    : null;

  return (
    <div className={cn("flex", isLeft ? "justify-start" : "justify-end")}>
      <div className="max-w-[min(86%,640px)]">
        <div
          className={cn("rounded-3xl px-5 py-4 border shadow-sm", bubbleClass)}
        >
          {resolvedImg ? (
            <div className="mb-3 overflow-hidden rounded-2xl border border-black/10 bg-white/60 p-2">
              {/* ✅ 이미지 너무 커지는 문제 해결: contain + max-h */}
              <img
                src={resolvedImg}
                alt="upload"
                className="w-full max-h-[180px] object-contain"
              />
            </div>
          ) : null}

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

function InlineBadge({ children, tone = "neutral" }) {
  const cls =
    tone === "err"
      ? "bg-red-500/10 text-red-700 border-red-500/15"
      : tone === "ok"
      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/15"
      : "bg-black/5 text-black/55 border-black/10";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-extrabold",
        cls
      )}
    >
      {children}
    </span>
  );
}

/** -----------------------------
 * Main Page (REAL API)
 * ----------------------------- */
export default function ParentCheckinPage() {
  // parent id from localStorage
  const [userId, setUserId] = useState(null);

  // children list + selected
  const [children, setChildren] = useState([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [childrenErr, setChildrenErr] = useState("");
  const [activeChildId, setActiveChildId] = useState(null);

  // tabs
  const [tab, setTab] = useState("overview"); // overview | gift | chat

  // connect child modal
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectChildId, setConnectChildId] = useState("");
  const [connectToEmail, setConnectToEmail] = useState("");
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectErr, setConnectErr] = useState("");

  // interpretation (per child)
  const [guidanceByChild, setGuidanceByChild] = useState({});
  const [interpretLoading, setInterpretLoading] = useState(false);
  const [interpretErr, setInterpretErr] = useState("");

  // gift (per child)
  const [giftByChild, setGiftByChild] = useState({});
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftErr, setGiftErr] = useState("");
  const fileInputRef = useRef(null);
  const [giftFileByChild, setGiftFileByChild] = useState({}); // { [childId]: File }

  // chat (per child)
  const [chatByChild, setChatByChild] = useState({});
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatErr, setChatErr] = useState("");
  const listRef = useRef(null);

  // chat attachment
  const chatFileRef = useRef(null);
  const [chatImageByChild, setChatImageByChild] = useState({}); // { [childId]: File }
  const [chatImagePreviewByChild, setChatImagePreviewByChild] = useState({}); // { [childId]: objectURL }

  const sysMessage = useMemo(
    () => ({
      id: "sys-0",
      role: "assistant",
      tone: "system",
      content:
        "I don’t see raw data.\nI only help explain what has already been interpreted.",
      createdAt: new Date().toISOString(),
    }),
    []
  );

  /** -----------------------------
   * API: fetch children
   * GET /parents/children?parentId=
   * ----------------------------- */
  const fetchChildren = async (parentId) => {
    if (!parentId) return;

    setChildrenLoading(true);
    setChildrenErr("");

    try {
      const res = await api.get("/parents/children", { params: { parentId } });
      const list = Array.isArray(res.data?.children) ? res.data.children : [];

      const mapped = list
        .map((c) => ({
          childUserId: Number(c?.userId),
          nickname: safeStr(c?.nickname, `Child #${c?.userId}`),
          email: safeStr(c?.email, ""),
          role: safeStr(c?.role, ""),
        }))
        .filter((c) => Number.isFinite(c.childUserId));

      setChildren(mapped);

      setActiveChildId((prev) => {
        if (prev && mapped.some((x) => x.childUserId === prev)) return prev;
        return mapped[0]?.childUserId ?? null;
      });

      // seed chat if absent
      setChatByChild((m) => {
        const next = { ...m };
        for (const c of mapped) {
          if (!next[c.childUserId]) next[c.childUserId] = [sysMessage];
        }
        return next;
      });
    } catch (e) {
      setChildrenErr(
        e?.response?.data?.message ||
          e?.response?.data?.detail ||
          e?.message ||
          "Failed to load children."
      );
      setChildren([]);
      setActiveChildId(null);
    } finally {
      setChildrenLoading(false);
    }
  };

  /** bootstrap userId */
  useEffect(() => {
    const raw = localStorage.getItem("userId");
    const parsed = raw ? Number(raw) : null;
    const pid = Number.isFinite(parsed) ? parsed : null;

    setUserId(pid);

    if (pid) fetchChildren(pid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** scroll chat when messages/tab changes */
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

  /** -----------------------------
   * API: interpretation fetch (overview)
   * GET /parents/interpretation?childId=
   * ----------------------------- */
  useEffect(() => {
    if (!activeChildId) return;
    if (tab !== "overview") return;

    let cancelled = false;

    (async () => {
      setInterpretLoading(true);
      setInterpretErr("");

      try {
        const res = await api.get("/parents/interpretation", {
          params: { childId: activeChildId },
        });

        if (cancelled) return;

        setGuidanceByChild((m) => ({
          ...m,
          [activeChildId]: {
            current_guidance: safeStr(res.data?.current_guidance),
            interpretation_rationale: Array.isArray(
              res.data?.interpretation_rationale
            )
              ? res.data.interpretation_rationale
              : [],
          },
        }));
      } catch (e) {
        if (cancelled) return;
        setInterpretErr(
          e?.response?.data?.message ||
            e?.response?.data?.detail ||
            e?.message ||
            "Failed to load interpretation."
        );
      } finally {
        if (!cancelled) setInterpretLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeChildId, tab]);

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

  /** -----------------------------
   * API: gift fetch (gift tab)
   * GET /parents/gift?childId=
   * ----------------------------- */
  useEffect(() => {
    if (!activeChildId) return;
    if (tab !== "gift") return;

    let cancelled = false;

    (async () => {
      setGiftLoading(true);
      setGiftErr("");

      try {
        const res = await api.get("/parents/gift", {
          params: { childId: activeChildId },
        });

        if (cancelled) return;

        setGiftByChild((m) => ({
          ...m,
          [activeChildId]: {
            imageUrl: withApiOrigin(res.data?.imageUrl),
            caption: safeStr(res.data?.message, ""),
            updated_at: safeStr(res.data?.updated_at, ""),
          },
        }));
      } catch (e) {
        if (cancelled) return;

        setGiftByChild((m) => ({
          ...m,
          [activeChildId]: {
            imageUrl: null,
            caption: "",
            updated_at: "",
          },
        }));
      } finally {
        if (!cancelled) setGiftLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeChildId, tab]);

  const gift = useMemo(() => {
    const g = giftByChild[activeChildId];
    return {
      imageUrl: g?.imageUrl ?? null,
      caption:
        g?.caption ??
        "This is not a reward for performance.\nIt represents trust kept over time.",
      updated_at: g?.updated_at ?? "",
    };
  }, [giftByChild, activeChildId]);

  /** -----------------------------
   * Connect child (REAL API)
   * POST /parents/connect { childId, connectToEmail }
   * ----------------------------- */
  const openConnect = () => {
    setConnectOpen(true);
    setConnectChildId("");
    setConnectToEmail("");
    setConnectErr("");
    setConnectLoading(false);
  };
  const closeConnect = () => setConnectOpen(false);

  const doLink = async () => {
    const cid = Number(connectChildId);
    const email = safeStr(connectToEmail);

    if (!Number.isFinite(cid) || cid <= 0) {
      setConnectErr("Please enter a valid childId.");
      return;
    }
    if (!email || !email.includes("@")) {
      setConnectErr("Please enter a valid email.");
      return;
    }

    setConnectLoading(true);
    setConnectErr("");

    try {
      await api.post("/parents/connect", {
        childId: cid,
        connectToEmail: email,
      });

      await fetchChildren(userId);

      setActiveChildId(cid);
      setTab("overview");
      closeConnect();
    } catch (e) {
      setConnectErr(
        e?.response?.data?.message ||
          e?.response?.data?.detail ||
          e?.message ||
          "Failed to connect."
      );
    } finally {
      setConnectLoading(false);
    }
  };

  /** -----------------------------
   * Gift upload/update (REAL API)
   * POST /parents/gift (form-data)
   * ----------------------------- */
  const onPickGift = () => fileInputRef.current?.click();

  const onGiftFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeChildId) return;

    setGiftFileByChild((m) => ({ ...m, [activeChildId]: file }));

    // local preview
    const localUrl = URL.createObjectURL(file);
    setGiftByChild((m) => ({
      ...m,
      [activeChildId]: {
        ...(m[activeChildId] || {}),
        imageUrl: localUrl,
      },
    }));
  };

  const onGiftCaptionChange = (v) => {
    if (!activeChildId) return;
    setGiftByChild((m) => ({
      ...m,
      [activeChildId]: {
        ...(m[activeChildId] || {}),
        caption: v,
      },
    }));
  };

  const uploadGift = async () => {
    if (!activeChildId || !userId) return;

    const file = giftFileByChild[activeChildId];
    const caption = safeStr(giftByChild[activeChildId]?.caption, "");

    if (!file) {
      setGiftErr("Please choose an image file first.");
      return;
    }

    setGiftLoading(true);
    setGiftErr("");

    try {
      const fd = new FormData();
      fd.append("childId", String(activeChildId));
      fd.append("message", caption);
      fd.append("image", file);

      const res = await api.post("/parents/gift", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setGiftByChild((m) => ({
        ...m,
        [activeChildId]: {
          ...(m[activeChildId] || {}),
          imageUrl:
            withApiOrigin(res.data?.imageUrl) ||
            m[activeChildId]?.imageUrl ||
            null,
        },
      }));

      // refresh canonical
      try {
        const refetch = await api.get("/parents/gift", {
          params: { childId: activeChildId },
        });
        setGiftByChild((m) => ({
          ...m,
          [activeChildId]: {
            imageUrl: withApiOrigin(refetch.data?.imageUrl),
            caption: safeStr(refetch.data?.message, ""),
            updated_at: safeStr(refetch.data?.updated_at, ""),
          },
        }));
      } catch {}
    } catch (e) {
      setGiftErr(
        e?.response?.data?.message ||
          e?.response?.data?.detail ||
          e?.message ||
          "Failed to upload gift."
      );
    } finally {
      setGiftLoading(false);
    }
  };

  /** -----------------------------
   * Gift delete (REAL API)
   * DELETE /parents/gift  body: { childId }
   * ----------------------------- */
  const deleteGift = async () => {
    if (!activeChildId) return;

    setGiftLoading(true);
    setGiftErr("");

    try {
      await api.delete("/parents/gift", {
        data: { childId: activeChildId },
      });

      setGiftByChild((m) => ({
        ...m,
        [activeChildId]: { imageUrl: null, caption: "", updated_at: "" },
      }));
      setGiftFileByChild((m) => {
        const next = { ...m };
        delete next[activeChildId];
        return next;
      });
    } catch (e) {
      setGiftErr(
        e?.response?.data?.message ||
          e?.response?.data?.detail ||
          e?.message ||
          "Failed to delete gift."
      );
    } finally {
      setGiftLoading(false);
    }
  };

  /** -----------------------------
   * CHAT (NEW API)
   * POST /parents/chat (multipart)
   *  - childId, message, image
   * response: { status: "saved" }
   * ----------------------------- */
  const messages = useMemo(() => {
    return Array.isArray(chatByChild[activeChildId])
      ? chatByChild[activeChildId]
      : activeChildId
      ? [sysMessage]
      : [];
  }, [chatByChild, activeChildId, sysMessage]);

  const onChatImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeChildId) return;

    // cleanup old preview if exists
    const prevUrl = chatImagePreviewByChild[activeChildId];
    if (prevUrl) URL.revokeObjectURL(prevUrl);

    const url = URL.createObjectURL(file);
    setChatImageByChild((m) => ({ ...m, [activeChildId]: file }));
    setChatImagePreviewByChild((m) => ({ ...m, [activeChildId]: url }));
  };

  const clearChatImage = () => {
    if (!activeChildId) return;
    const prevUrl = chatImagePreviewByChild[activeChildId];
    if (prevUrl) URL.revokeObjectURL(prevUrl);

    setChatImageByChild((m) => {
      const next = { ...m };
      delete next[activeChildId];
      return next;
    });
    setChatImagePreviewByChild((m) => {
      const next = { ...m };
      delete next[activeChildId];
      return next;
    });

    if (chatFileRef.current) chatFileRef.current.value = "";
  };

  const sendText = async (text) => {
    const t = safeStr(text);
    const hasImg = !!chatImageByChild[activeChildId];

    if ((!t && !hasImg) || isTyping || !activeChildId) return;

    setChatErr("");
    setInput("");

    const now = new Date().toISOString();
    const imagePreview = chatImagePreviewByChild[activeChildId] || null;

    setChatByChild((m) => ({
      ...m,
      [activeChildId]: [
        ...(m[activeChildId] || [sysMessage]),
        {
          id: makeId("p"),
          role: "parent",
          tone: "normal",
          content: t || "(image)",
          imageUrl: imagePreview, // local preview (blob)
          createdAt: now,
        },
      ],
    }));

    setIsTyping(true);

    try {
      const fd = new FormData();
      fd.append("childId", String(activeChildId));
      fd.append("message", t);
      if (hasImg) fd.append("image", chatImageByChild[activeChildId]);

      const res = await api.post("/parents/chat", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const status = safeStr(res.data?.status, "saved");

      setChatByChild((m) => ({
        ...m,
        [activeChildId]: [
          ...(m[activeChildId] || [sysMessage]),
          {
            id: makeId("ack"),
            role: "assistant",
            tone: "system",
            content: status === "saved" ? "Saved." : `Saved: ${status}`,
            createdAt: new Date().toISOString(),
          },
        ],
      }));

      clearChatImage();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        "Chat failed.";

      setChatErr(msg);

      setChatByChild((m) => ({
        ...m,
        [activeChildId]: [
          ...(m[activeChildId] || [sysMessage]),
          {
            id: makeId("aerr"),
            role: "assistant",
            tone: "system",
            content: `Request failed.\n${msg}`,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    } finally {
      setIsTyping(false);
    }
  };

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(chatImagePreviewByChild).forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell>
      <Panel>
        <PanelHeader title="Parents · Check-in" right={null} />

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

              <SoftBtn
                onClick={() => fetchChildren(userId)}
                disabled={!userId || childrenLoading}
                className="h-10"
              >
                {childrenLoading ? "Refreshing…" : "↻ Refresh"}
              </SoftBtn>

              <SoftBtn
                onClick={openConnect}
                disabled={!userId}
                className="h-10"
              >
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

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-black/50">
            {activeChild ? (
              <>
                <span>
                  Viewing:{" "}
                  <span className="font-extrabold text-[#0B2B5B]">
                    {safeStr(
                      activeChild.nickname,
                      `Child #${activeChild.childUserId}`
                    )}
                  </span>
                </span>
                <span className="text-black/35">·</span>
                <span className="text-black/45">
                  {safeStr(activeChild.email)}
                </span>
                {activeChild.role ? (
                  <>
                    <span className="text-black/35">·</span>
                    <InlineBadge>{activeChild.role}</InlineBadge>
                  </>
                ) : null}
              </>
            ) : (
              <span>Select a child to view interpretation.</span>
            )}

            {childrenErr ? (
              <>
                <span className="text-black/35">·</span>
                <InlineBadge tone="err">{childrenErr}</InlineBadge>
              </>
            ) : null}
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
                Connect a child, then select them from the top.
              </div>
              <div className="mt-4 flex items-center gap-2">
                <PrimaryBtn onClick={openConnect}>Connect a child</PrimaryBtn>
              </div>
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              {tab === "overview" ? (
                <div className="grid gap-4">
                  <AccentCard
                    title={assessment.title}
                    icon="✓"
                    accent="green"
                    right={
                      <div className="flex items-center gap-2">
                        {interpretLoading ? (
                          <InlineBadge>Loading…</InlineBadge>
                        ) : interpretErr ? (
                          <InlineBadge tone="err">Error</InlineBadge>
                        ) : (
                          <InlineBadge tone="ok">Live</InlineBadge>
                        )}
                      </div>
                    }
                  >
                    <div className="inline-flex rounded-2xl bg-[#B7E27A]/22 px-4 py-3">
                      <div className="text-[16px] sm:text-[18px] font-extrabold text-[#0B2B5B] leading-snug whitespace-pre-line">
                        {assessment.main}
                      </div>
                    </div>

                    <div className="mt-3 text-[12px] font-semibold text-black/50">
                      {assessment.sub}
                    </div>

                    {interpretErr ? (
                      <div className="mt-3">
                        <InlineBadge tone="err">{interpretErr}</InlineBadge>
                      </div>
                    ) : null}
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
                </div>
              ) : null}

              {/* GIFT */}
              {tab === "gift" ? (
                <div className="grid gap-4">
                  <AccentCard
                    title="Promise gift"
                    icon="🎁"
                    accent="yellow"
                    right={
                      <div className="flex items-center gap-2">
                        {giftLoading ? (
                          <InlineBadge>Loading…</InlineBadge>
                        ) : gift.imageUrl ? (
                          <InlineBadge tone="ok">Saved</InlineBadge>
                        ) : (
                          <InlineBadge>Empty</InlineBadge>
                        )}
                      </div>
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-black/10 bg-white/70 overflow-hidden">
                        {/* ✅ 이미지 너무 커지는 문제 해결: p-3 + contain */}
                        <div className="aspect-[4/3] bg-black/5 flex items-center justify-center p-3">
                          {gift.imageUrl ? (
                            <img
                              src={gift.imageUrl}
                              alt="Gift"
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="text-[12px] font-extrabold text-black/35 px-4 text-center">
                              No gift image yet
                            </div>
                          )}
                        </div>

                        <div className="px-4 py-3 border-t border-black/10 text-[12px] font-semibold text-black/55 whitespace-pre-line">
                          {safeStr(gift.caption, "") || "—"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[14px] font-extrabold text-[#0B2B5B]">
                            Message
                          </div>
                          {gift.updated_at ? (
                            <InlineBadge>{gift.updated_at}</InlineBadge>
                          ) : null}
                        </div>

                        <textarea
                          value={safeStr(
                            giftByChild[activeChildId]?.caption,
                            ""
                          )}
                          onChange={(e) => onGiftCaptionChange(e.target.value)}
                          placeholder="Write a short message…"
                          className="mt-3 w-full min-h-[140px] rounded-2xl border border-black/10 bg-white/90 p-4 text-[13px] font-semibold outline-none resize-none"
                        />

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <PrimaryBtn
                            onClick={onPickGift}
                            disabled={giftLoading}
                            className="h-10"
                          >
                            Choose image
                          </PrimaryBtn>

                          <PrimaryBtn
                            onClick={uploadGift}
                            disabled={
                              giftLoading || !giftFileByChild[activeChildId]
                            }
                            className="h-10"
                          >
                            {giftLoading ? "Uploading…" : "Upload / Update"}
                          </PrimaryBtn>

                          <SoftBtn
                            onClick={deleteGift}
                            disabled={giftLoading || !gift.imageUrl}
                            className="h-10"
                          >
                            Delete
                          </SoftBtn>

                          {giftFileByChild[activeChildId] ? (
                            <InlineBadge tone="ok">
                              file: {giftFileByChild[activeChildId].name}
                            </InlineBadge>
                          ) : (
                            <InlineBadge>no file</InlineBadge>
                          )}
                        </div>

                        {giftErr ? (
                          <div className="mt-3">
                            <InlineBadge tone="err">{giftErr}</InlineBadge>
                          </div>
                        ) : null}
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

              {/* CHAT */}
              {tab === "chat" ? (
                <div className="grid gap-4">
                  <AccentCard
                    title="Check-in Companion"
                    icon="💬"
                    accent="mint"
                    right={<InlineBadge>Chat</InlineBadge>}
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
                              /* ✅ user(부모)=LEFT, assistant=RIGHT */
                              side={m.role === "parent" ? "left" : "right"}
                              tone={m.tone}
                              text={m.content}
                              time={formatTimeLabel(m.createdAt)}
                              imageUrl={m.imageUrl}
                            />
                          ))}
                          {isTyping && <TypingBubble />}
                        </div>
                      </div>

                      {chatErr ? (
                        <div className="mt-3">
                          <InlineBadge tone="err">{chatErr}</InlineBadge>
                        </div>
                      ) : null}

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {suggestions.map((s) => (
                          <SuggestionBtn
                            key={s}
                            label={s}
                            onClick={() => sendText(s)}
                          />
                        ))}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {chatImageByChild[activeChildId] ? (
                          <>
                            <InlineBadge tone="ok">
                              📎 {chatImageByChild[activeChildId].name}
                            </InlineBadge>
                            <SoftBtn onClick={clearChatImage} className="h-9">
                              Remove
                            </SoftBtn>
                          </>
                        ) : (
                          <InlineBadge>no image</InlineBadge>
                        )}
                      </div>

                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={() => chatFileRef.current?.click()}
                          disabled={!activeChildId || isTyping}
                          className={cn(
                            "h-12 w-12 rounded-full border border-black/10 bg-white/90 shadow-sm hover:bg-white transition flex items-center justify-center text-[18px] font-extrabold text-[#0B2B5B]",
                            (!activeChildId || isTyping) && "opacity-50"
                          )}
                          title="Attach image"
                          aria-label="Attach image"
                        >
                          📎
                        </button>

                        <input
                          ref={chatFileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={onChatImageChange}
                        />

                        <input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              sendText(input);
                            }
                          }}
                          placeholder="Write a message…"
                          className="flex-1 h-12 rounded-full border border-black/10 bg-white/90 px-5 text-[14px] font-semibold outline-none"
                        />

                        <PrimaryBtn
                          onClick={() => sendText(input)}
                          disabled={
                            (!safeStr(input) &&
                              !chatImageByChild[activeChildId]) ||
                            isTyping ||
                            !activeChildId
                          }
                          className="h-12"
                        >
                          Send
                        </PrimaryBtn>
                      </div>

                      {/* ✅ 미리보기 너무 커지는 문제 해결: contain + 낮은 max-h */}
                      {chatImagePreviewByChild[activeChildId] ? (
                        <div className="mt-3 overflow-hidden rounded-2xl border border-black/10 bg-white/70 p-2">
                          <img
                            src={chatImagePreviewByChild[activeChildId]}
                            alt="preview"
                            className="w-full max-h-[160px] object-contain"
                          />
                        </div>
                      ) : null}
                    </div>
                  </AccentCard>
                </div>
              ) : null}
            </>
          )}
        </div>
      </Panel>

      {/* Connect Child Modal (REAL API) */}
      {connectOpen ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={closeConnect}
          />
          <div className="relative w-full max-w-[520px] rounded-[26px] border border-black/10 bg-white/90 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between">
              <div className="text-[15px] font-extrabold text-[#0B2B5B]">
                Connect a child
              </div>
              <SoftBtn onClick={closeConnect} className="h-9">
                Close
              </SoftBtn>
            </div>

            <div className="p-6">
              <div className="text-[12px] font-extrabold text-black/55 mb-2">
                Child ID
              </div>
              <input
                value={connectChildId}
                onChange={(e) => setConnectChildId(e.target.value)}
                placeholder="e.g., 12"
                className="w-full h-12 rounded-full border border-black/10 bg-white px-5 text-[14px] font-semibold outline-none"
              />

              <div className="mt-4 text-[12px] font-extrabold text-black/55 mb-2">
                Connect to email
              </div>
              <input
                value={connectToEmail}
                onChange={(e) => setConnectToEmail(e.target.value)}
                placeholder="parent@email.com"
                className="w-full h-12 rounded-full border border-black/10 bg-white px-5 text-[14px] font-semibold outline-none"
              />

              <div className="mt-4 flex gap-2">
                <PrimaryBtn
                  onClick={doLink}
                  disabled={
                    !safeStr(connectChildId) ||
                    !safeStr(connectToEmail) ||
                    connectLoading
                  }
                  className="h-11"
                >
                  {connectLoading ? "Linking…" : "Link"}
                </PrimaryBtn>
                <SoftBtn
                  onClick={() => {
                    setConnectChildId("");
                    setConnectToEmail("");
                    setConnectErr("");
                  }}
                  disabled={connectLoading}
                  className="h-11"
                >
                  Reset
                </SoftBtn>
              </div>

              {connectErr ? (
                <div className="mt-3">
                  <InlineBadge tone="err">{connectErr}</InlineBadge>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
