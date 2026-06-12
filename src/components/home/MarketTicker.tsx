'use client'

export default function MarketTicker() {
  const announcements = [
    "JUST ADDED: STUNNING 5-BEDROOM VILLA IN RUNDA",
    "ELEGANT LIVING: WESTLANDS APARTMENTS FROM KES 12M",
    "PRICE UPDATE: BEAUTIFUL KAREN MANSION NOW KES 85M",
    "READY FOR YOU: LUXURY RIVERSIDE PENTHOUSE",
    "COMING SOON: EXCLUSIVE NYALI BEACHFRONT RESIDENCES",
    "VERIFIED & SECURE: HAND-PICKED HOMES ACROSS KENYA",
  ];

  return (
    <div className="bg-[#7B2CBF] py-3 overflow-hidden whitespace-nowrap border-y border-white/10 shadow-lg">
      <div className="flex animate-marquee">
        {/* We repeat the array twice for a seamless infinite loop */}
        {[...announcements, ...announcements].map((text, i) => (
          <div key={i} className="flex items-center mx-12">
            <span className="text-white font-medium text-sm tracking-[0.15em] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
              {text}
            </span>
            {/* The separator star - using Deep Violet color */}
            <span className="mx-12 text-[#2D004F] text-xl">✦</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 35s linear infinite;
        }
        /* Pause on hover for better user experience */
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}