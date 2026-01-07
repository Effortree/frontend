import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/app/ui/Button.jsx";
import Input from "@/app/ui/Input.jsx";
import { api } from "@/lib/api.js"; // ← login API 호출용

function MascotCard() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative mx-auto h-80 w-80 overflow-hidden rounded-[28px] border border-black/10 bg-gradient-to-b from-[#EAF7D5] to-white">
        {/* ✅ 핵심: 상자 내부 기준 풀 크기 */}
        <img
          src="/efforTree-logo.png"
          alt="logo"
          className="absolute inset-0 h-full w-full object-cover scale-[1.00]"
        />
      </div>
    </div>
  );
}

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const canSubmit = useMemo(() => email.trim() && pw.trim(), [email, pw]);

  const handleLogin = async () => {
    try {
      const res = await api.post("/login", {
        email,
        password: pw,
      });

      console.log("🔐 login result:", res.data);

      const userId = res.data?.userId; // ✅ 명세: { userId: number | null }

      if (typeof userId === "number") {
        // ✅ 로컬 스토리지 저장
        localStorage.setItem("userId", String(userId));

        alert("로그인 성공!");
        nav("/home");
      } else {
        alert("로그인 실패! 이메일 또는 비밀번호를 확인하세요.");
      }
    } catch (err) {
      console.error("❌ 서버 에러:", err);
      alert("서버 오류 발생! 콘솔을 확인해주세요.");
    }
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className="hidden lg:block">
        <MascotCard />
      </div>

      <div className="mx-auto w-full max-w-lg">
        <div className="rounded-2xl bg-white p-10 shadow-soft">
          <div className="text-3xl font-extrabold text-black">Sign in</div>
          <div className="mt-2 text-sm text-black/60">Access your account.</div>

          <div className="mt-8 space-y-6">
            <Input
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>

          <div className="mt-8 flex items-center gap-4">
            <Button
              disabled={!canSubmit}
              className="min-w-[140px]"
              onClick={handleLogin} // ← 🔥 로그인 API 호출
            >
              Let&apos;s study
            </Button>

            <button
              className="text-sm font-semibold text-[#0B5AA8] hover:underline"
              type="button"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-black/70">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-[#0B5AA8] hover:underline"
          >
            Create your account now.
          </Link>
        </div>
      </div>
    </div>
  );
}
