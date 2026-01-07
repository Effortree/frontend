import React from "react";

export default function TogglePill({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-xl border border-black/10 bg-white p-1 shadow-soft">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "rounded-lg px-5 py-2 text-sm font-semibold transition",
              active
                ? "bg-[#0B5AA8] text-white"
                : "text-[#0B2B5B] hover:bg-black/5",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
