"use client";

import { Heart } from "lucide-react";

export function DonateButton() {
  const handleClick = () => {
    const donateBtn = document.querySelector(
      '[aria-label="Apoie o Pronto.IA"]'
    );
    if (donateBtn instanceof HTMLElement) {
      donateBtn.click();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 bg-[#00D97E] text-[#0A0E1A] px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform duration-240"
    >
      <Heart className="w-4 h-4" fill="#0A0E1A" />
      Doar agora
    </button>
  );
}
