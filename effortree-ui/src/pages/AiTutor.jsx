"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api.js";

/** -----------------------------
 * utils: date / time
 * ----------------------------- */
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateLabel(dateLike) {
  const d = new Date(dateLike);
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);

  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, y)) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeLabel(dateLike) {
  return new Date(dateLike).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** -----------------------------
 * infer role from messageId
 * messageId: "1001-U" | "1001-A"
 * ----------------------------- */
function inferRoleFromMessageId(messageId) {
  const id = String(messageId ?? "");
  if (id.endsWith("-A")) return "ai";
  return "user";
}

/** -----------------------------
 * UI pieces
 * ----------------------------- */
function DateDivider({ label }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="h-px flex-1 bg-black/10" />
      <div className="text-xs font-extrabold text-black/45 whitespace-nowrap">
        {label}
      </div>
      <div className="h-px flex-1 bg-black/10" />
    </div>
  );
}

function Avatar({ src, fallback }) {
  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-black/10 bg-white/70 shadow-sm">
      {src ? (
        <img src={src} alt="avatar" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-lg">
          {fallback}
        </div>
      )}
    </div>
  );
}

/**
 * ✅ FIX(2번):
 * - text가 비어있으면 Bubble 자체를 렌더하지 않음
 * - time도 text가 있을 때만 렌더되게 보장
 * - (추가) text가 공백만 있는 경우도 제거
 */
function Bubble({ side, text, avatarSrc, time, isGhost = false }) {
  const isLeft = side === "left";
  const safeText = String(text ?? "").trim();

  // ✅ 핵심: 내용 없으면 아예 안 그린다 (시간만 둥둥 뜨는 현상 방지)
  if (!safeText) return null;

  return (
    <div
      className={["flex items-end gap-3", isLeft ? "" : "justify-end"].join(
        " "
      )}
    >
      {isLeft && <Avatar src={avatarSrc} fallback="🙂" />}

      <div className="max-w-[min(72%,720px)]">
        <div
          className={[
            "rounded-3xl px-5 py-4 shadow-sm border",
            isLeft
              ? "bg-white/80 border-black/10 text-[#0B2B5B]"
              : "bg-[#B7E27A]/80 border-black/10 text-[#0B2B5B]",
            isGhost ? "opacity-70" : "",
          ].join(" ")}
        >
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed font-semibold">
            {safeText}
          </div>
        </div>

        {/* ✅ 내용이 있을 때만 시간 표시 */}
        {!!time && (
          <div
            className={[
              "mt-1 text-[11px] font-semibold text-black/40",
              isLeft ? "pl-2" : "pr-2 text-right",
            ].join(" ")}
          >
            {time}
          </div>
        )}
      </div>

      {!isLeft && <Avatar src={avatarSrc} fallback="🤖" />}
    </div>
  );
}

function TypingIndicator({ avatarSrc }) {
  return (
    <div className="flex items-end justify-end gap-3">
      <div className="rounded-3xl px-5 py-4 shadow-sm border bg-[#B7E27A]/55 border-black/10">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-black/35 animate-bounce [animation-delay:-0.2s]" />
          <span className="h-2 w-2 rounded-full bg-black/35 animate-bounce [animation-delay:-0.1s]" />
          <span className="h-2 w-2 rounded-full bg-black/35 animate-bounce" />
        </div>
      </div>
      <Avatar src={avatarSrc} fallback="🤖" />
    </div>
  );
}

function QuickBtn({ label, emoji, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={[
        "flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[14px] font-extrabold text-[#0B2B5B] shadow-sm hover:bg-white transition",
        disabled ? "opacity-50 pointer-events-none" : "",
      ].join(" ")}
    >
      <span>{label}</span>
      <span className="text-[18px]">{emoji}</span>
    </button>
  );
}

/** -----------------------------
 * Main
 * ----------------------------- */
export default function AiTutorPanel({
  userAvatar = "/user-face.png",
  aiAvatar = "/robot.png",
}) {
  const [userId, setUserId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const canSend = input.trim().length > 0;

  const listRef = useRef(null);

  useEffect(() => {
    const raw = localStorage.getItem("userId");
    const parsed = raw ? Number(raw) : null;
    setUserId(Number.isFinite(parsed) ? parsed : null);
  }, []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await api.get("/tutors", { params: { userId } });

        const mapped = (res.data || []).map((m) => ({
          id: m.messageId,
          role: inferRoleFromMessageId(m.messageId),
          text: m.content ?? "",
          createdAt: m.createdAt,
        }));

        mapped.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(mapped);
      } catch (err) {
        console.error("❌ GET /tutors error:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, isTyping]);

  const timeline = useMemo(() => {
    const result = [];
    let lastDate = null;

    const sorted = [...messages].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    for (const m of sorted) {
      const label = formatDateLabel(m.createdAt);
      if (label !== lastDate) {
        result.push({ type: "date", label });
        lastDate = label;
      }
      result.push({ type: "msg", data: m });
    }
    return result;
  }, [messages]);

  /** ✅ 핵심: text는 유저 메시지를 "즉시" 올리고, quick은 유저 메시지를 올리지 않는다 */
  const postTutor = async ({ quickAction, content }) => {
    if (!userId) {
      alert("로그인이 필요합니다. (userId 없음)");
      return;
    }

    // quickAction=text이면 content 필수
    const isText = quickAction === "text";
    const text = String(content ?? "").trim();

    if (isText && !text) return;

    // 1) optimistic user bubble (text일 때만!)
    let optimisticId = null;
    if (isText) {
      optimisticId = `local-${Date.now()}-U`;
      const now = new Date().toISOString();
      setMessages((prev) => [
        ...prev,
        {
          id: optimisticId,
          role: "user",
          text,
          createdAt: now,
          __local: true,
        },
      ]);
    }

    // 2) show only assistant typing while waiting
    try {
      setIsTyping(true);

      const res = await api.post("/tutors", {
        userId,
        quickAction,
        content: isText ? text : null,
      });

      const { userMessage, assistantMessage } = res.data || {};

      // 3) 서버가 userMessage를 주더라도:
      // - text일 때는 이미 optimistic로 보여줬으니 "중복 방지" 차원에서 굳이 추가하지 않음
      // - quick일 때는 userMessage가 있더라도 UI에서는 숨김(추가 안 함)

      // 4) assistantMessage는 항상 추가 (단, content가 있을 때만)
      if (assistantMessage?.content) {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessage.messageId,
            role: inferRoleFromMessageId(assistantMessage.messageId),
            text: assistantMessage.content ?? "",
            createdAt: assistantMessage.createdAt ?? new Date().toISOString(),
          },
        ]);
      }

      void userMessage;
      void optimisticId;
    } catch (err) {
      console.error("❌ POST /tutors error:", err);
      alert("서버 오류! 콘솔 확인해줘");
    } finally {
      setIsTyping(false);
    }
  };

  const sendUser = (text) => {
    const t = text?.trim();
    if (!t || isTyping) return;

    setInput("");
    postTutor({ quickAction: "text", content: t });
  };

  const sendQuick = (action) => {
    if (isTyping) return;
    postTutor({ quickAction: action, content: null });
  };

  return (
    <div className="relative w-full overflow-hidden h-[calc(100vh-72px)]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("/background-skyfield.png")` }}
      />

      <div className="relative mx-auto h-full w-full max-w-6xl px-6 py-6">
        <div className="h-full rounded-[32px] border border-white/40 bg-white/65 backdrop-blur-md shadow-soft overflow-hidden">
          <div className="h-full min-h-0 p-6">
            <div className="h-full rounded-[32px] border border-white/40 bg-white/55 shadow-soft backdrop-blur-md overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-black/10 text-sm font-extrabold text-[#0B2B5B]">
                AI Tutor
              </div>

              <div className="px-6 py-6 flex-1 min-h-0 flex flex-col">
                <div
                  ref={listRef}
                  className="flex-1 min-h-0 overflow-y-auto pr-2"
                >
                  <div className="flex flex-col gap-4">
                    {loading ? (
                      <div className="rounded-2xl border border-black/10 bg-white/70 p-6 text-center text-black/50 font-semibold">
                        Loading...
                      </div>
                    ) : !userId ? (
                      <div className="rounded-2xl border border-black/10 bg-white/70 p-6 text-center text-black/50 font-semibold">
                        No userId found in localStorage.
                      </div>
                    ) : timeline.length === 0 ? (
                      <div className="rounded-2xl border border-black/10 bg-white/70 p-6 text-center text-black/50 font-semibold">
                        Start a conversation ✨
                      </div>
                    ) : (
                      timeline.map((item, idx) =>
                        item.type === "date" ? (
                          <DateDivider key={`d-${idx}`} label={item.label} />
                        ) : (
                          <Bubble
                            key={item.data.id}
                            side={item.data.role === "user" ? "left" : "right"}
                            text={item.data.text}
                            avatarSrc={
                              item.data.role === "user" ? userAvatar : aiAvatar
                            }
                            time={formatTimeLabel(item.data.createdAt)}
                            isGhost={!!item.data.__local}
                          />
                        )
                      )
                    )}

                    {/* ✅ 대기중엔 assistant typing만 */}
                    {isTyping && <TypingIndicator avatarSrc={aiAvatar} />}
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendUser(input)}
                    placeholder="Ask me anything…"
                    className="flex-1 h-12 rounded-full border border-black/10 bg-white/80 px-5 text-[15px] font-semibold outline-none"
                  />
                  <button
                    onClick={() => sendUser(input)}
                    disabled={!canSend || isTyping || !userId}
                    className="h-12 px-5 rounded-full bg-[#2E7D32] text-white font-extrabold disabled:opacity-50"
                  >
                    Send ✉️
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <QuickBtn
                    label="Hint"
                    emoji="💡"
                    onClick={() => sendQuick("hint")}
                    disabled={isTyping || !userId}
                  />
                  <QuickBtn
                    label="Example"
                    emoji="🧪"
                    onClick={() => sendQuick("example")}
                    disabled={isTyping || !userId}
                  />
                  <QuickBtn
                    label="Why"
                    emoji="❔"
                    onClick={() => sendQuick("why")}
                    disabled={isTyping || !userId}
                  />
                  <QuickBtn
                    label="Summary"
                    emoji="📝"
                    onClick={() => sendQuick("summary")}
                    disabled={isTyping || !userId}
                  />
                  <QuickBtn
                    label="Application"
                    emoji="🧩"
                    onClick={() => sendQuick("application")}
                    disabled={isTyping || !userId}
                  />
                </div>
              </div>
            </div>
            {/* /panel */}
          </div>
        </div>
      </div>
    </div>
  );
}
