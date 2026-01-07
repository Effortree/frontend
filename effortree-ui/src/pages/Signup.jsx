import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/app/ui/Button.jsx";
import Input from "@/app/ui/Input.jsx";
import { api } from "@/lib/api.js";

function InfoBullets() {
  const items = [
    {
      title: "Focus on process, not just results:",
      desc: "Reward consistency, not perfection.",
    },
    {
      title: "Encourage daily engagement:",
      desc: "Small tasks that feel achievable.",
    },
    {
      title: "Watch growth happen naturally:",
      desc: "Progress that builds over time.",
    },
  ];

  return (
    <div className="rounded-2xl bg-white/60 p-8 shadow-soft">
      <div className="text-2xl font-extrabold text-[#0B2B5B]">
        Help effort become a lifelong habit
      </div>
      <div className="mt-3 max-w-xl text-sm leading-6 text-black/65">
        Support your child’s growth through small, consistent learning moments
        that build confidence, discipline, and real progress over time.
      </div>

      <div className="mt-7 space-y-5">
        {items.map((it) => (
          <div key={it.title} className="flex gap-4">
            <div className="mt-1 h-10 w-10 rounded-full bg-black/10" />
            <div>
              <div className="font-extrabold text-black">{it.title}</div>
              <div className="mt-1 text-sm text-black/65">{it.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 border-t border-black/10 pt-6 text-xs text-black/50">
        Tip: 나중에 여기 아이콘 넣으면 더 고급져 보여.
      </div>
    </div>
  );
}

export default function Signup() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const canNext = useMemo(() => {
    if (!email.trim() || !pw.trim() || !pw2.trim()) return false;
    if (pw.length < 6) return false;
    if (pw !== pw2) return false;
    return true;
  }, [email, pw, pw2]);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-lg">
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

          <div className="mt-7 space-y-6">
            <Input
              label={
                <span>
                  Email address <span className="text-red-500">*</span>
                </span>
              }
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label={
                <span>
                  Create password <span className="text-red-500">*</span>
                </span>
              }
              type="password"
              placeholder="At least 6 characters"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              hint={
                pw && pw.length < 6
                  ? "Password should be at least 6 characters."
                  : ""
              }
            />

            <Input
              label={
                <span>
                  Re-type password <span className="text-red-500">*</span>
                </span>
              }
              type="password"
              placeholder="••••••••"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              hint={pw2 && pw !== pw2 ? "Passwords do not match." : ""}
            />
          </div>

          <div className="mt-8">
            <Button
              disabled={!canNext}
              onClick={async () => {
                try {
                  const res = await api.post("/users", {
                    email,
                    password: pw,
                  });

                  const userId = res.data.userId;
                  console.log("🔥 Received userId:", userId);

                  // Step2로 userId 전달
                  nav("/signup/profile", {
                    state: { userId },
                  });
                } catch (err) {
                  console.error("❌ API 에러:", err);
                  alert("회원가입 실패! 콘솔에서 에러 확인!");
                }
              }}
            >
              Next
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-black/70">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#0B5AA8] hover:underline"
          >
            Sign in.
          </Link>
        </div>
      </div>

      <div className="hidden lg:block">
        <InfoBullets />
      </div>
    </div>
  );
}
