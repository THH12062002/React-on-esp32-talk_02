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
    <div className="fixed inset-0 flex items-center justify-center bg-[#D84315]/90 transition-opacity">
      <div className="animate-pulse text-white">
        <HomeIcon size={80} />
      </div>
    </div>
  );
};

export default SplashScreen;
