import React from "react";
import { Leaf } from "lucide-react";

export default function HeaderAuth() {
  return (
    <header className="bg-[#F6F0B9]">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-6 py-6">
        <div className="flex items-baseline gap-2">
          <div className="text-4xl font-extrabold tracking-tight text-[#0B2B5B]">
            Effor<span className="text-[#4F9B2F]">tree</span>
          </div>
          <Leaf className="h-6 w-6 text-[#4F9B2F]" />
        </div>
        <div className="mt-3 text-sm font-semibold text-[#0B2B5B]/85">
          Small effort Real growth
        </div>
      </div>
    </header>
  );
}
