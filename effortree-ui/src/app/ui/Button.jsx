import React from "react";

export default function Button({
  className = "",
  variant = "primary",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#0B5AA8] text-white hover:bg-[#0A4E93] shadow-soft",
    outline:
      "bg-white text-[#0B2B5B] border border-[#0B5AA8]/30 hover:border-[#0B5AA8]/55 hover:bg-[#0B5AA8]/5",
    ghost: "bg-transparent text-[#0B2B5B] hover:bg-black/5",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
