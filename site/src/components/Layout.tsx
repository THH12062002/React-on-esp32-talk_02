import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  MdHome,
  MdWifi,
  MdSettings,
  MdMonitor,
  MdDescription,
  MdLogout,
} from "react-icons/md";

interface NavItemProps {
  to: string;
  icon: IconType;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, icon: Icon, isActive, onClick }: NavItemProps) => {
  // Explicitly cast the icon component to a valid React component type
  const IconComponent = Icon as React.ComponentType<{ size?: number }>;

  return (
    <Link
      to={to}
      className={`w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg
        ${isActive ? "bg-white/20" : ""}`}
      onClick={onClick}
    >
      <IconComponent size={24} />
    </Link>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

const Layout = ({ children, onLogout }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Create a reusable logo component with proper typing
  const LogoIcon = MdMonitor as React.ComponentType<{ size?: number }>;

  const handleLogout = () => {
    onLogout?.();
    navigate("/login");
  };

  return (
    <div className="flex max-h-screen">
      <div className="w-20 bg-[#D84315] py-5 flex flex-col items-center">
        <div className="mb-10">
          <Link to="/" className="text-white">
            <LogoIcon size={32} />
          </Link>
        </div>
        <nav className="flex flex-col gap-3 flex-1">
          <NavItem to="/" icon={MdHome} isActive={location.pathname === "/"} />
          <NavItem
            to="/wifi"
            icon={MdWifi}
            isActive={location.pathname === "/wifi"}
          />
          <NavItem
            to="/settings"
            icon={MdSettings}
            isActive={location.pathname === "/settings"}
          />
          <NavItem
            to="/logs"
            icon={MdDescription}
            isActive={location.pathname === "/logs"}
          />
        </nav>
        {/* Logout button */}
        <div className="mt-auto pt-5 border-t border-white/10 w-full flex justify-center">
          <NavItem
            to="/login"
            icon={MdLogout}
            isActive={false}
            onClick={handleLogout}
          />
        </div>
      </div>
      <div className="flex-1 bg-white p-5">{children}</div>
    </div>
  );
};

export default Layout;
