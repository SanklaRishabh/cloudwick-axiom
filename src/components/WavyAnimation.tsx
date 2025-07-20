
import React from 'react';

const WavyAnimation = () => {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Background waves */}
      <div className="absolute inset-0">
        <div className="wave-container">
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
          <div className="wave wave-4"></div>
          <div className="wave wave-5"></div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .wave-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          .wave {
            position: absolute;
            width: 200%;
            height: 100%;
            background: linear-gradient(45deg, transparent, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1), transparent);
            will-change: transform;
          }

          .wave-1 {
            background: linear-gradient(45deg, transparent, rgba(20, 184, 166, 0.15), rgba(168, 85, 247, 0.1), transparent);
            animation: wave-flow-1 8s infinite linear;
            transform-origin: center;
          }

          .wave-2 {
            background: linear-gradient(-45deg, transparent, rgba(139, 92, 246, 0.12), rgba(236, 72, 153, 0.08), transparent);
            animation: wave-flow-2 12s infinite linear;
            animation-delay: -2s;
          }

          .wave-3 {
            background: linear-gradient(30deg, transparent, rgba(236, 72, 153, 0.1), rgba(244, 114, 182, 0.06), transparent);
            animation: wave-flow-3 10s infinite linear;
            animation-delay: -4s;
          }

          .wave-4 {
            background: linear-gradient(-30deg, transparent, rgba(20, 184, 166, 0.08), rgba(139, 92, 246, 0.06), transparent);
            animation: wave-flow-4 14s infinite linear;
            animation-delay: -6s;
          }

          .wave-5 {
            background: linear-gradient(60deg, transparent, rgba(168, 85, 247, 0.06), rgba(20, 184, 166, 0.04), transparent);
            animation: wave-flow-5 16s infinite linear;
            animation-delay: -8s;
          }

          @keyframes wave-flow-1 {
            0% {
              transform: translateX(-100%) translateY(-10%) skewX(5deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateX(100%) translateY(10%) skewX(5deg);
              opacity: 0;
            }
          }

          @keyframes wave-flow-2 {
            0% {
              transform: translateX(-100%) translateY(10%) skewX(-3deg);
              opacity: 0;
            }
            15% {
              opacity: 1;
            }
            85% {
              opacity: 1;
            }
            100% {
              transform: translateX(100%) translateY(-10%) skewX(-3deg);
              opacity: 0;
            }
          }

          @keyframes wave-flow-3 {
            0% {
              transform: translateX(-100%) translateY(5%) skewX(8deg);
              opacity: 0;
            }
            12% {
              opacity: 1;
            }
            88% {
              opacity: 1;
            }
            100% {
              transform: translateX(100%) translateY(-5%) skewX(8deg);
              opacity: 0;
            }
          }

          @keyframes wave-flow-4 {
            0% {
              transform: translateX(-100%) translateY(-5%) skewX(-6deg);
              opacity: 0;
            }
            8% {
              opacity: 1;
            }
            92% {
              opacity: 1;
            }
            100% {
              transform: translateX(100%) translateY(5%) skewX(-6deg);
              opacity: 0;
            }
          }

          @keyframes wave-flow-5 {
            0% {
              transform: translateX(-100%) translateY(8%) skewX(4deg);
              opacity: 0;
            }
            6% {
              opacity: 1;
            }
            94% {
              opacity: 1;
            }
            100% {
              transform: translateX(100%) translateY(-8%) skewX(4deg);
              opacity: 0;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .wave {
              animation: none;
            }
          }
        `
      }} />
    </div>
  );
};

export default WavyAnimation;
