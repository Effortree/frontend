import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import HeaderAuth from "./HeaderAuth.jsx";
import HeaderStudent from "./HeaderStudent.jsx";

const StudentHomePath = ["/home", "/quest", "/log", "/analytic", "/tutor"];

export default function AppShell() {
  const location = useLocation();
  const isHomePage = StudentHomePath.includes(location.pathname);

  return (
    <div className="min-h-screen">
      {isHomePage ? <HeaderStudent /> : <HeaderAuth />}
      <main className="mx-auto w-full max-w-6xl px-6 pt-[72px]">
        <Outlet />
      </main>
    </div>
  );
}
