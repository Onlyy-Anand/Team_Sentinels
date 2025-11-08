export function WaveAnimation() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.8)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.4)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
          </linearGradient>
          <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(236, 72, 153, 0.6)" />
            <stop offset="50%" stopColor="rgba(236, 72, 153, 0.3)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0)" />
          </linearGradient>
        </defs>

        <path
          d="M0,100 Q300,50 600,100 T1200,100 L1200,0 L0,0 Z"
          fill="url(#wave-gradient)"
          className="animate-wave-1"
        />
        <path
          d="M0,150 Q300,80 600,150 T1200,150 L1200,50 Q600,30 0,50 Z"
          fill="url(#wave-gradient-2)"
          className="animate-wave-2"
        />
        <path
          d="M0,200 Q300,150 600,200 T1200,200 L1200,120 Q600,100 0,120 Z"
          fill="rgba(168, 85, 247, 0.3)"
          className="animate-wave-3"
        />
      </svg>

      <style>{`
        @keyframes wave-1 {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(25px);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes wave-2 {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-25px);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes wave-3 {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(20px);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-wave-1 {
          animation: wave-1 6s ease-in-out infinite;
        }

        .animate-wave-2 {
          animation: wave-2 7s ease-in-out infinite;
        }

        .animate-wave-3 {
          animation: wave-3 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
