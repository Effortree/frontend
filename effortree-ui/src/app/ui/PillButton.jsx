import React from "react";

export default function PillButton({
  variant = "primary",
  children,
  onClick,
  type = "button",
  disabled = false,
}) {
  const cls =
    variant === "primary"
      ? "bg-[#4CAF50] text-white hover:brightness-95"
      : "bg-white/60 text-black/80 border border-black/10 hover:bg-white/80";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        "rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition",
        cls,
        disabled ? "opacity-60 cursor-not-allowed hover:brightness-100" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
