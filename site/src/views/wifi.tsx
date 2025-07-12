import { useEffect, useState } from "preact/hooks";
import { MdWifi, MdLock } from "react-icons/md";

export const Wifi = () => {
  const [ssid, setSsid] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch("/api/ap-sta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ssid, password }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-center mb-8">
        <div className="bg-[#D84315] p-4 rounded-full">
          <MdWifi size={32} color="white" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
        Connect to WiFi
      </h2>

      {submitted ? (
        <div className="text-center p-4 bg-green-100 rounded-lg">
          <p className="text-green-700 font-medium">
            Successfully connected to {ssid}!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              SSID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdWifi size={20} color="#9CA3AF" />
              </div>
              <input
                type="text"
                value={ssid}
                onChange={(e) => setSsid((e.target as HTMLInputElement).value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D84315] focus:border-transparent"
                placeholder="Enter network name"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdLock size={20} color="#9CA3AF" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword((e.target as HTMLInputElement).value)
                }
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D84315] focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-[#D84315] text-white font-medium rounded-lg 
              ${!isLoading && "hover:bg-[#BF360C]"} 
              transition-colors duration-200 
              ${isLoading && "opacity-70 cursor-not-allowed"}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connecting...
              </span>
            ) : (
              "Connect"
            )}
          </button>
        </form>
      )}
    </div>
  );
};
