import { useState } from "react";

export default function MessengerDove({ className = "", size = "xl", interactive = true }) {
  const [clicked, setClicked] = useState(false);
  const [imgSrc, setImgSrc] = useState("/assets/flying-dove-transparent.png");

  const sizeClasses = {
    sm: "w-24 h-20",
    md: "w-44 h-36",
    lg: "w-64 h-52",
    xl: "w-72 h-60 sm:w-88 sm:h-72 md:w-[380px] md:h-[300px] lg:w-[420px] lg:h-[330px]",
  }[size] || "w-72 h-60 sm:w-88 sm:h-72 md:w-[380px] md:h-[300px]";

  const handleClick = () => {
    if (!interactive) return;
    setClicked(true);
    setTimeout(() => setClicked(false), 2000);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer group ${className}`}
      title={interactive ? "Messenger Dove: Click to dispatch a message spark!" : "SyncChat Messenger Dove"}
    >
      {/* Ethereal background ambient light aura (seamless, no border) */}
      <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-indigo-500/25 via-violet-500/20 to-blue-500/15 blur-3xl pointer-events-none sc-ethereal-glow" />

      {/* Floating Carrier Sparkles */}
      <div className="absolute top-2 left-6 w-2 h-2 rounded-full bg-indigo-300 shadow-[0_0_8px_#818CF8] sc-sparkle pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-2.5 h-2.5 rounded-full bg-violet-300 shadow-[0_0_10px_#A78BFA] sc-sparkle pointer-events-none [animation-delay:0.7s]" />
      <div className="absolute top-1/3 -right-2 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#67E8F9] sc-sparkle pointer-events-none [animation-delay:1.2s]" />

      {/* Click communication ripple wave */}
      {clicked && (
        <div className="absolute inset-0 rounded-full border border-indigo-400/80 animate-[sc-signal-ripple_1.4s_ease-out_forwards] pointer-events-none" />
      )}

      {/* Majestic Flying Dove Container with Soaring Motion (NO BORDER) */}
      <div
        className={`relative ${sizeClasses} sc-dove-soar-animation flex items-center justify-center transition-transform duration-500 group-hover:scale-105`}
      >
        <img
          src={imgSrc}
          alt="Carrier Messenger Dove in flight"
          onError={() => setImgSrc("/assets/flying-dove.jpg")}
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_12px_32px_rgba(165,180,252,0.45)]"
          referrerPolicy="no-referrer"
        />

        {/* Dynamic envelope dispatch glow when clicked */}
        {clicked && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/80 backdrop-blur-md text-white text-xs font-semibold shadow-lg shadow-indigo-500/50 animate-[sc-fade-up_0.4s_ease-out]">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>Message Dispatched!</span>
          </div>
        )}
      </div>
    </div>
  );
}
