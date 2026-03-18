"use client";
export default function LoadingScreen({ message = "Loading your dashboard" }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8"
      style={{ background: "#010935", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Spinner + pulse rings */}
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-[#00baf2] animate-[pulse-ring_1.6s_ease-out_infinite]" />
        <div className="absolute inset-0 rounded-full border-2 border-[#00baf2] animate-[pulse-ring_1.6s_ease-out_infinite_0.5s]" />
        <div className="w-14 h-14 rounded-full border-[2.5px] border-[rgba(0,186,242,0.15)] border-t-[#00baf2] animate-spin" />
        <span className="absolute text-lg font-bold text-[#00baf2] tracking-tighter">
          Z
        </span>
      </div>

      {/* Text + dots */}
      <div className="text-center animate-[fadeUp_0.5s_ease-out_0.2s_both]">
        <p className="text-white/90 text-base font-medium mb-2">{message}</p>
        <div className="flex gap-1.5 justify-center">
          {[0, 0.2, 0.4].map((delay, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#00baf2] animate-[dot_1.4s_ease-in-out_infinite]"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-56 animate-[fadeUp_0.5s_ease-out_0.4s_both]">
        <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#00baf2] to-[#7ad7f7] rounded-full animate-[bar_2.2s_cubic-bezier(0.4,0,0.2,1)_forwards]" />
        </div>
      </div>
    </div>
  );
}
