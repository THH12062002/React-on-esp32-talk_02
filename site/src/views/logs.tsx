import { h } from "preact";
import { useState } from "preact/hooks";

const Logs = () => {
  const [logLevel, setLogLevel] = useState<string>("WARN");
  const [selectedDate, setSelectedDate] = useState<string>("2024-04-08");

  const handleLogLevelChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setLogLevel(target.value);
  };

  const handleDateChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setSelectedDate(target.value);
  };

  return (
    <div class="flex h-screen items-center justify-center">
      <div class="w-full max-w-5xl p-8">
        <div class="flex justify-between gap-48">
          {/* Server Logs Card */}
          <div class="flex flex-col items-center bg-white rounded-lg shadow-md p-6 border border-gray-100 w-[450px]">
            <div class="mb-6 flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-[#D84315]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 class="text-xl font-semibold text-gray-800">Server logs</h2>
            </div>

            <div class="w-full space-y-6">
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-600">
                  Log level
                </label>
                <select
                  value={logLevel}
                  onChange={handleLogLevelChange}
                  class="select select-bordered w-full bg-white"
                >
                  <option value="ERROR">ERROR</option>
                  <option value="WARN">WARN</option>
                  <option value="INFO">INFO</option>
                  <option value="DEBUG">DEBUG</option>
                </select>
              </div>

              <button class="btn btn-primary w-full bg-[#D84315] hover:bg-[#BF360C] border-none">
                Update
              </button>
            </div>
          </div>

          {/* Heatmap Logs Card */}
          <div class="flex flex-col items-center bg-white rounded-lg shadow-md p-6 border border-gray-100 w-[450px]">
            <div class="mb-6 flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-[#D84315]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h2 class="text-xl font-semibold text-gray-800">Heatmap logs</h2>
            </div>

            <div class="w-full space-y-6">
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-600">
                  Select a date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  class="input input-bordered w-full bg-white"
                />
              </div>

              <button class="btn btn-primary w-full bg-[#D84315] hover:bg-[#BF360C] border-none">
                Download heatmap logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
