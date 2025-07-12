import { Link, Route, Switch, useLocation } from "wouter";
import { useState, useEffect } from "preact/hooks";
import { Magnetometer } from "./views/magnetometer";
import { HelloWorld } from "./views/hello-world";
import { PushButton } from "./views/button-push";
import { Servo } from "./views/servo";
import { Led } from "./views/led";
import { Wifi } from "./views/wifi";
import { Alarm } from "./views/alarm";
import SplashScreen from "./components/SplashScreen";
import {
  MdHome,
  MdWifi,
  MdLightbulb,
  MdRadar,
  MdTouchApp,
  MdSettings,
  MdAlarm,
  MdMenu,
  MdKeyboardArrowLeft,
} from "react-icons/md";

export const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const handleBeforeUnload = () => {
      setShowSplash(true);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div class="flex h-screen">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full flex flex-col bg-[#D84315] text-white transition-all duration-300 ease-in-out ${
          isExpanded ? "w-48" : "w-16"
        }`}
      >
        <div className="flex-1">
          <Link href="/">
            <div
              class={`p-4 cursor-pointer flex items-center gap-3 ${
                location === "/" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <div className="min-w-[24px] flex justify-center">
                <MdHome size={24} color="white" />
              </div>
              <span
                className={`text-lg transition-all duration-300 ${
                  isExpanded ? "opacity-100 w-32" : "opacity-0 w-0"
                } overflow-hidden whitespace-nowrap`}
              >
                Home
              </span>
            </div>
          </Link>
          <Link href="/led">
            <div
              class={`p-4 cursor-pointer flex items-center gap-3 ${
                location === "/led" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <div className="min-w-[24px] flex justify-center">
                <MdLightbulb size={24} color="white" />
              </div>
              <span
                className={`text-lg transition-all duration-300 ${
                  isExpanded ? "opacity-100 w-32" : "opacity-0 w-0"
                } overflow-hidden whitespace-nowrap`}
              >
                LED
              </span>
            </div>
          </Link>
          <Link href="/btn-push">
            <div
              class={`p-4 cursor-pointer flex items-center gap-3 ${
                location === "/btn-push" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <div className="min-w-[24px] flex justify-center">
                <MdTouchApp size={24} color="white" />
              </div>
              <span
                className={`text-lg transition-all duration-300 ${
                  isExpanded ? "opacity-100 w-32" : "opacity-0 w-0"
                } overflow-hidden whitespace-nowrap`}
              >
                Button Push
              </span>
            </div>
          </Link>
          <Link href="/magnetometer">
            <div
              class={`p-4 cursor-pointer flex items-center gap-3 ${
                location === "/magnetometer"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              <div className="min-w-[24px] flex justify-center">
                <MdRadar size={24} color="white" />
              </div>
              <span
                className={`text-lg transition-all duration-300 ${
                  isExpanded ? "opacity-100 w-32" : "opacity-0 w-0"
                } overflow-hidden whitespace-nowrap`}
              >
                Magnetometer
              </span>
            </div>
          </Link>
          <Link href="/servo">
            <div
              class={`p-4 cursor-pointer flex items-center gap-3 ${
                location === "/servo" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <div className="min-w-[24px] flex justify-center">
                <MdSettings size={24} color="white" />
              </div>
              <span
                className={`text-lg transition-all duration-300 ${
                  isExpanded ? "opacity-100 w-32" : "opacity-0 w-0"
                } overflow-hidden whitespace-nowrap`}
              >
                Servo
              </span>
            </div>
          </Link>
          <Link href="/wifi">
            <div
              class={`p-4 cursor-pointer flex items-center gap-3 ${
                location === "/wifi" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <div className="min-w-[24px] flex justify-center">
                <MdWifi size={24} color="white" />
              </div>
              <span
                className={`text-lg transition-all duration-300 ${
                  isExpanded ? "opacity-100 w-32" : "opacity-0 w-0"
                } overflow-hidden whitespace-nowrap`}
              >
                Wifi
              </span>
            </div>
          </Link>
          <Link href="/alarm">
            <div
              class={`p-4 cursor-pointer flex items-center gap-3 ${
                location === "/alarm" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <div className="min-w-[24px] flex justify-center">
                <MdAlarm size={24} color="white" />
              </div>
              <span
                className={`text-lg transition-all duration-300 ${
                  isExpanded ? "opacity-100 w-32" : "opacity-0 w-0"
                } overflow-hidden whitespace-nowrap`}
              >
                Alarm
              </span>
            </div>
          </Link>
        </div>

        {/* Collapse/Expand Button at bottom */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-4 w-full cursor-pointer flex items-center gap-3 hover:bg-white/10 transition-colors duration-200 border-t border-white/20`}
        >
          <div
            className={`min-w-[24px] flex justify-center transition-transform duration-300 ${
              isExpanded ? "" : "rotate-180"
            }`}
          >
            <MdKeyboardArrowLeft size={24} color="white" />
          </div>
          <span
            className={`text-lg transition-all duration-300 ${
              isExpanded ? "opacity-100 w-32" : "opacity-0 w-0"
            } overflow-hidden whitespace-nowrap`}
          >
            {isExpanded ? "Thu gọn" : ""}
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 h-screen flex items-center justify-center transition-all duration-300 ease-in-out ${
          isExpanded ? "ml-48" : "ml-16"
        }`}
      >
        <Switch>
          <Route path="/" component={HelloWorld} />
          <Route path="/btn-push" component={PushButton} />
          <Route path="/led" component={Led} />
          <Route path="/magnetometer" component={Magnetometer} />
          <Route path="/servo" component={Servo} />
          <Route path="/wifi" component={Wifi} />
          <Route path="/alarm" component={Alarm} />
        </Switch>
      </div>
    </div>
  );
};
