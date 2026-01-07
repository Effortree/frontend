import React from "react";

export default function Tab({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full px-4 py-2 text-sm font-semibold transition",
        "border border-black/10",
        active
          ? "bg-[#4CAF50]/20 text-[#0B2B5B]"
          : "bg-white/50 text-black/70 hover:bg-white/70",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
