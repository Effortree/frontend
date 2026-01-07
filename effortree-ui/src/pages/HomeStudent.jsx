import React from "react";

export default function HomeStudent() {
  return (
    <div className="relative w-full overflow-hidden h-[calc(100vh-72px)]">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url("/background-skyfield.png")` }}
      />

      {/* Character + Bubble */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-10">
        <div className="relative">
          <div className="absolute -top-24 left-40 rounded-xl bg-[#FFF8D6] px-6 py-4 shadow-md border border-black/10">
            <div className="text-base font-semibold text-black leading-snug">
              You’re on day 12. <br /> You’re doing well.
            </div>
          </div>

          <img
            src="/student-mascot.png"
            alt="student mascot"
            className="w-[300px] select-none"
          />
        </div>
      </div>
    </div>
  );
}
