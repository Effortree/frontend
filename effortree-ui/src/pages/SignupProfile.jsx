import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "@/app/ui/Button.jsx";
import Input from "@/app/ui/Input.jsx";
import TogglePill from "@/app/ui/TogglePill.jsx";
import { api } from "@/lib/api.js";

export default function SignupProfile() {
  const nav = useNavigate();
  const { state } = useLocation();
  const userId = state?.userId; // Step1에서 넘어온 userId

  // userId 없으면 Step1으로 되돌리기 (새로고침한 경우)
  useEffect(() => {
    if (!userId) {
      alert("잘못된 접근입니다. 다시 회원가입을 진행해주세요.");
      nav("/signup");
    }
  }, [userId, nav]);

  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState("student");

  const canCreate = useMemo(() => nickname.trim().length >= 2, [nickname]);

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl">
        <div className="rounded-2xl bg-white p-10 shadow-soft">
          <div className="text-3xl font-extrabold text-black">
            Create account
          </div>
          <div className="mt-2 text-sm text-black/60">
            Get started with an account.
          </div>

          <div className="mt-6 text-xs text-black/55">
            <span className="text-red-500">*</span> indicates a required field.
          </div>

          <div className="mt-10 space-y-8">
            <Input
              label={
                <span>
                  Nickname <span className="text-red-500">*</span>
                </span>
              }
              placeholder="e.g., Minsu"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              hint={
                nickname && nickname.trim().length < 2
                  ? "Nickname must be at least 2 characters."
                  : ""
              }
            />

            <div>
              <div className="mb-3 text-sm font-semibold text-[#0B2B5B]">
                Role <span className="text-red-500">*</span>
              </div>
              <TogglePill
                value={role}
                onChange={setRole}
                options={[
                  { value: "student", label: "Student" },
                  { value: "parent", label: "Parent" },
                ]}
              />
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => nav("/signup")}>
                Back
              </Button>

              <Button
                disabled={!canCreate}
                onClick={async () => {
                  try {
                    const res = await api.patch("/users", {
                      userId, // Step1에서 전달받은 userId
                      nickname,
                      role,
                    });

                    console.log("🔥 PATCH 성공:", res.data);
                    alert("회원가입 완료!");

                    nav("/login");
                  } catch (err) {
                    console.error("❌ API 에러:", err);
                    alert("회원가입 실패! 콘솔에서 확인해.");
                  }
                }}
              >
                Create account
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-black/50">
          네 정보는 안전하게 저장됩니다.
        </div>
      </div>
    </div>
  );
}
