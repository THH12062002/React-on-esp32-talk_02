import React, { useEffect } from "react";
import { MdHome } from "react-icons/md";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1500); // 1.5 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  // Explicitly cast the icon component to a valid React component type
  const HomeIcon = MdHome as React.ComponentType<{ size?: number }>;

  return (
    <div class="fixed inset-0 flex flex-col items-center justify-center bg-[#D84315]/90 transition-opacity">
      <div class="flex flex-col items-center gap-8">
        <div class="animate-pulse text-white">
          <HomeIcon size={80} />
        </div>
        <div class="flex flex-col items-center gap-3">
          <div class="text-white text-lg tracking-[0.2em]">LOADING...</div>
          <div class="w-[300px] h-[2px] bg-white/20 relative overflow-hidden">
            <div class="absolute top-0 left-0 h-full w-full bg-white/40">
              <div
                class="absolute top-0 right-0 h-full w-[50%] bg-white animate-[glow_1.5s_linear_infinite]"
                style={{
                  boxShadow: "0 0 20px 2px rgba(255,255,255,0.7)",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this to your global CSS or use a styled-components
const style = document.createElement("style");
style.textContent = `
  @keyframes glow {
    0% {
      transform: translateX(-200%);
    }
    100% {
      transform: translateX(200%);
    }
  }
`;
document.head.appendChild(style);

export default SplashScreen;
