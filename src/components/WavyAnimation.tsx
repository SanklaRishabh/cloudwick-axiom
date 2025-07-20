
import React from 'react';

interface WavyAnimationProps {
  isDark?: boolean;
}

const WavyAnimation = ({ isDark = true }: WavyAnimationProps) => {
  const waveOpacity = isDark ? 1 : 0.6;
  
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Background waves filling entire panel */}
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
            opacity: ${waveOpacity};
          }

          .wave-1 {
            background: linear-gradient(45deg, transparent, rgba(20, 184, 166, ${isDark ? '0.15' : '0.25'}), rgba(168, 85, 247, ${isDark ? '0.1' : '0.2'}), transparent);
            animation: wave-flow-1 8s infinite linear;
            transform-origin: center;
          }

          .wave-2 {
            background: linear-gradient(-45deg, transparent, rgba(139, 92, 246, ${isDark ? '0.12' : '0.22'}), rgba(236, 72, 153, ${isDark ? '0.08' : '0.18'}), transparent);
            animation: wave-flow-2 12s infinite linear;
            animation-delay: -2s;
          }

          .wave-3 {
            background: linear-gradient(30deg, transparent, rgba(236, 72, 153, ${isDark ? '0.1' : '0.2'}), rgba(244, 114, 182, ${isDark ? '0.06' : '0.16'}), transparent);
            animation: wave-flow-3 10s infinite linear;
            animation-delay: -4s;
          }

          .wave-4 {
            background: linear-gradient(-30deg, transparent, rgba(20, 184, 166, ${isDark ? '0.08' : '0.18'}), rgba(139, 92, 246, ${isDark ? '0.06' : '0.16'}), transparent);
            animation: wave-flow-4 14s infinite linear;
            animation-delay: -6s;
          }

          .wave-5 {
            background: linear-gradient(60deg, transparent, rgba(168, 85, 247, ${isDark ? '0.06' : '0.16'}), rgba(20, 184, 166, ${isDark ? '0.04' : '0.14'}), transparent);
            animation: wave-flow-5 16s infinite linear;
            animation-delay: -8s;
          }

          @keyframes wave-flow-1 {
            0% {
              transform: translateX(-100%) translateY(-10%) skewX(5deg);
              opacity: 0;
            }
            10% {
              opacity: ${waveOpacity};
            }
            90% {
              opacity: ${waveOpacity};
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
              opacity: ${waveOpacity};
            }
            85% {
              opacity: ${waveOpacity};
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
              opacity: ${waveOpacity};
            }
            88% {
              opacity: ${waveOpacity};
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
              opacity: ${waveOpacity};
            }
            92% {
              opacity: ${waveOpacity};
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
              opacity: ${waveOpacity};
            }
            94% {
              opacity: ${waveOpacity};
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
