import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/app/AppShell.jsx";
import Login from "@/pages/Login.jsx";
import Signup from "@/pages/Signup.jsx";
import SignupProfile from "@/pages/SignupProfile.jsx";
import HomeStudent from "@/pages/HomeStudent";
import QuestDashboard from "@/pages/Quest.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/profile" element={<SignupProfile />} />
        <Route path="/home" element={<HomeStudent />} />
        <Route path="/quest" element={<QuestDashboard />} />
      </Route>
    </Routes>
  );
}
