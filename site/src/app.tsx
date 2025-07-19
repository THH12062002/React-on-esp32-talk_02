import { Link, Route, Switch, useLocation, Redirect } from "wouter";
import { useState, useEffect } from "preact/hooks";
import { Magnetometer } from "./views/magnetometer";
import { HelloWorld } from "./views/hello-world";
import { PushButton } from "./views/button-push";
import { Servo } from "./views/servo";
import { Led } from "./views/led";
import { Wifi } from "./views/wifi";
import { Alarm } from "./views/alarm";
import SplashScreen from "./components/SplashScreen";
import LoginForm from "./components/LoginForm";
import { getUserInfo, clearUserInfo } from "./utils/auth";
import { SceneOverview } from "./views/scene-overview";
import Logs from "./views/logs";

// Types
interface NavItem {
  path: string;
  label: string;
  icon: () => preact.VNode;
  component: () => preact.VNode;
}

// Icons
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-6 h-6"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const LightbulbIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-6 h-6"
  >
    <path d="M9 18h6"></path>
    <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"></path>
  </svg>
);

const TouchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-6 h-6"
  >
    <path d="M12 2v4"></path>
    <path d="M12 18v4"></path>
    <path d="m4.93 4.93 2.83 2.83"></path>
    <path d="m16.24 16.24 2.83 2.83"></path>
    <path d="M2 12h4"></path>
    <path d="M18 12h4"></path>
    <path d="m4.93 19.07 2.83-2.83"></path>
    <path d="m16.24 7.76 2.83-2.83"></path>
  </svg>
);

const RadarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-6 h-6"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 12v6"></path>
    <path d="M12 2v4"></path>
    <path d="M12 12h6"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-6 h-6"
  >
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const WifiIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-6 h-6"
  >
    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    <line x1="12" y1="20" x2="12.01" y2="20"></line>
  </svg>
);

const AlarmIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-6 h-6"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-6 h-6"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-6 h-6"
  >
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

// Navigation Configuration
const navItems: NavItem[] = [
  { path: "/", label: "Home", icon: HomeIcon, component: HelloWorld },
  { path: "/led", label: "LED", icon: LightbulbIcon, component: Led },
  {
    path: "/btn-push",
    label: "Button Push",
    icon: TouchIcon,
    component: PushButton,
  },
  {
    path: "/magnetometer",
    label: "Magnetometer",
    icon: RadarIcon,
    component: Magnetometer,
  },
  { path: "/servo", label: "Servo", icon: SettingsIcon, component: Servo },
  { path: "/wifi", label: "Wifi", icon: WifiIcon, component: Wifi },
  { path: "/alarm", label: "Alarm", icon: AlarmIcon, component: Alarm },
  {
    path: "/scene-overview",
    label: "Scene Overview",
    icon: SettingsIcon,
    component: SceneOverview,
  },
  { path: "/logs", label: "Logs", icon: SettingsIcon, component: Logs },
];

// Components
const NavLink = ({
  path,
  label,
  icon: Icon,
  isExpanded,
  currentLocation,
}: {
  path: string;
  label: string;
  icon: () => preact.VNode;
  isExpanded: boolean;
  currentLocation: string;
}) => (
  <Link href={path}>
    <div
      class={`p-4 cursor-pointer flex items-center gap-3 ${
        currentLocation === path ? "bg-white/20" : "hover:bg-white/10"
      }`}
    >
      <div class="min-w-[24px] flex justify-center">
        <Icon />
      </div>
      <span
        class={`text-lg transition-all duration-300 ${
          isExpanded ? "opacity-100 w-32" : "opacity-0 w-0"
        } overflow-hidden whitespace-nowrap`}
      >
        {label}
      </span>
    </div>
  </Link>
);

// Custom Hooks
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userInfo = getUserInfo();
    setIsAuthenticated(!!userInfo);
  }, []);

  const handleLogout = () => {
    clearUserInfo();
    setIsAuthenticated(false);
  };

  return { isAuthenticated, setIsAuthenticated, handleLogout };
};

const useSplashScreen = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const handleBeforeUnload = () => setShowSplash(true);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return { showSplash, setShowSplash };
};

export const App = () => {
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const { isAuthenticated, setIsAuthenticated, handleLogout } = useAuth();
  const { showSplash, setShowSplash } = useSplashScreen();

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated && location !== "/login") {
    return <Redirect to="/login" />;
  }

  if (!isAuthenticated) {
    return (
      <div class="w-full h-screen bg-gray-100">
        <LoginForm onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div class="flex h-screen">
      <div
        class={`fixed left-0 top-0 h-full flex flex-col bg-[#D84315] text-white transition-all duration-300 ease-in-out ${
          isExpanded ? "w-48" : "w-16"
        }`}
      >
        <div class="flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              {...item}
              isExpanded={isExpanded}
              currentLocation={location}
            />
          ))}
        </div>

        <button
          onClick={handleLogout}
          class={`p-4 w-full cursor-pointer flex items-center gap-3 hover:bg-white/10 transition-colors duration-200 border-t border-white/20`}
        >
          <div class="min-w-[24px] flex justify-center">
            <LogoutIcon />
          </div>
          <span
            class={`text-lg transition-all duration-300 ${
              isExpanded ? "opacity-100 w-32" : "opacity-0 w-0"
            } overflow-hidden whitespace-nowrap`}
          >
            Đăng xuất
          </span>
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          class={`p-4 w-full cursor-pointer flex items-center gap-3 hover:bg-white/10 transition-colors duration-200 border-t border-white/20`}
        >
          <div
            class={`min-w-[24px] flex justify-center transition-transform duration-300 ${
              isExpanded ? "" : "rotate-180"
            }`}
          >
            <ArrowLeftIcon />
          </div>
          <span
            class={`text-lg transition-all duration-300 ${
              isExpanded ? "opacity-100 w-32" : "opacity-0 w-0"
            } overflow-hidden whitespace-nowrap`}
          >
            {isExpanded ? "Thu gọn" : ""}
          </span>
        </button>
      </div>

      <div
        class={`flex-1 h-screen flex items-center justify-center transition-all duration-300 ease-in-out ${
          isExpanded ? "ml-48" : "ml-16"
        }`}
      >
        <Switch>
          <Route
            path="/login"
            component={() => (
              <LoginForm onLogin={() => setIsAuthenticated(true)} />
            )}
          />
          {navItems.map((item) => (
            <Route
              key={item.path}
              path={item.path}
              component={item.component}
            />
          ))}
        </Switch>
      </div>
    </div>
  );
};
