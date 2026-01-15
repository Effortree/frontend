import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import HeaderAuth from "./HeaderAuth.jsx";
import HeaderStudent from "./HeaderStudent.jsx";

const StudentHomePath = ["/home", "/quest", "/log", "/analytic", "/tutor"];

// ✅ 헤더 아래 여백 없이 “붙여야 하는” 페이지들
const NoHeaderOffsetPaths = ["/parent-checkin"]; // 너가 부모 페이지 라우트로 쓰는 경로로 바꿔

export default function AppShell() {
  const location = useLocation();
  const isHomePage = StudentHomePath.includes(location.pathname);

  const noOffset = NoHeaderOffsetPaths.includes(location.pathname);

  return (
    <div className="min-h-screen">
      {isHomePage ? <HeaderStudent /> : <HeaderAuth />}

      <main
        className={[
          "mx-auto w-full max-w-6xl px-6",
          noOffset ? "pt-0" : "pt-[72px]",
        ].join(" ")}
      >
        <Outlet />
      </main>
    </div>
  );
}
