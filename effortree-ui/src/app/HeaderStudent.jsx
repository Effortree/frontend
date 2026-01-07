import { NavLink } from "react-router-dom";

const navItemClass = ({ isActive }) =>
  [
    "text-lg font-semibold transition",
    isActive ? "text-[#0B2B5B]" : "text-black hover:text-[#0B5AA8]",
  ].join(" ");

export default function HeaderStudent() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-sm shadow-sm z-50">
      <div className="mx-auto max-w-6xl flex justify-between items-center px-6 py-4">
        <NavLink to="/home" className="flex items-end gap-2">
          <span className="text-3xl font-extrabold text-[#0B2B5B]">
            Effor<span className="text-[#4CAF50]">tree</span>
          </span>
          <span className="text-xs text-black/60 -mb-0.5">
            Small effort Real growth
          </span>
        </NavLink>

        <nav className="flex gap-10">
          <NavLink to="/quest" className={navItemClass}>
            Quest
          </NavLink>
          <NavLink to="/log" className={navItemClass}>
            Log
          </NavLink>
          <NavLink to="/analytic" className={navItemClass}>
            Analytic
          </NavLink>
          <NavLink to="/tutor" className={navItemClass}>
            AI Tutor
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
