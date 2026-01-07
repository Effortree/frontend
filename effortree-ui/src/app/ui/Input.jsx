import React from "react";

export default function Input({ label, hint, ...props }) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-2 text-sm font-semibold text-[#0B2B5B]">{label}</div>
      ) : null}
      <input
        className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0B5AA8]/60 focus:ring-4 focus:ring-[#0B5AA8]/10"
        {...props}
      />
      {hint ? <div className="mt-2 text-xs text-black/55">{hint}</div> : null}
    </label>
  );
}
