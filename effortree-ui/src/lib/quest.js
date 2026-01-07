import { api } from "@/lib/api.js";

export function getUserIdOrThrow() {
  const v = localStorage.getItem("userId");
  const userId = v ? Number(v) : null;
  if (!userId || Number.isNaN(userId)) throw new Error("No userId");
  return userId;
}

// 1) 받아오기
export async function fetchQuests() {
  const userId = getUserIdOrThrow();
  const res = await api.get("/quests/", { params: { userId } }); // ✅ /quests/?userId=7
  return res.data; // List[Quest]
}

// 2) 추가
export async function createQuest(payload) {
  const userId = getUserIdOrThrow();
  const res = await api.post("/quests/", { userId, ...payload }); // ✅ CreateQuestRequest
  return res.data; // Quest
}

// 3) 상태변경
export async function patchQuestStatus(questId, status) {
  const userId = getUserIdOrThrow();
  const res = await api.patch("/quests/status", { userId, questId, status });
  return res.data; // { questId, status, userId }
}
