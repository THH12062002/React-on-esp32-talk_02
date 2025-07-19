import { h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import GuideModal from "../components/GuideModal";

export const SceneOverview = () => {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Thêm hàm xử lý zoom
  const handleZoom = () => {
    setZoomLevel((prev) => (prev >= 2 ? 1 : prev + 0.5));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setShowGuide(false);
      setCurrentStep(1); // Reset step when closing
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Define margins and drawing area
    const margin = {
      left: 60,
      right: 20,
      top: 20,
      bottom: 50, // Tăng bottom margin từ 40 lên 50
    };

    // Draw grid with zoom
    const drawGrid = () => {
      const drawingWidth = canvas.width - margin.left - margin.right;
      const drawingHeight = canvas.height - margin.top - margin.bottom;

      // Save context for grid
      ctx.save();

      // Clip to drawing area
      ctx.beginPath();
      ctx.rect(margin.left, margin.top, drawingWidth, drawingHeight);
      ctx.clip();

      // Apply zoom transformation
      const centerX = margin.left + drawingWidth / 2;
      const centerY = margin.top + drawingHeight / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-centerX, -centerY);

      // Calculate grid sizes based on real-world units
      const metersPerPixelX = drawingWidth / (70 * zoomLevel);
      const metersPerPixelY = drawingHeight / (150 * zoomLevel);

      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 0.5;

      // Vertical lines every 5m
      for (let x = -35 * zoomLevel; x <= 35 * zoomLevel; x += 5) {
        const xPos = margin.left + drawingWidth / 2 + x * metersPerPixelX;
        ctx.beginPath();
        ctx.moveTo(xPos, margin.top);
        ctx.lineTo(xPos, canvas.height - margin.bottom);
        ctx.stroke();
      }

      // Horizontal lines every 15m
      for (let y = 0; y <= 150 * zoomLevel; y += 15) {
        const yPos = canvas.height - margin.bottom - y * metersPerPixelY;
        ctx.beginPath();
        ctx.moveTo(margin.left, yPos);
        ctx.lineTo(canvas.width - margin.right, yPos);
        ctx.stroke();
      }

      // Restore context after grid
      ctx.restore();
    };

    // Draw shaded areas with zoom
    const drawShadedAreas = () => {
      const drawingWidth = canvas.width - margin.left - margin.right;
      const drawingHeight = canvas.height - margin.top - margin.bottom;

      // Save context for shaded areas
      ctx.save();

      // Clip to drawing area
      ctx.beginPath();
      ctx.rect(margin.left, margin.top, drawingWidth, drawingHeight);
      ctx.clip();

      // Apply zoom transformation
      const centerX = margin.left + drawingWidth / 2;
      const centerY = margin.top + drawingHeight / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-centerX, -centerY);

      // Top shaded area
      ctx.fillStyle = "rgba(200, 200, 200, 0.3)";
      ctx.beginPath();
      ctx.moveTo(margin.left, margin.top);
      ctx.lineTo(canvas.width - margin.right, margin.top);
      ctx.lineTo(canvas.width - margin.right, margin.top + drawingHeight * 0.2);
      ctx.quadraticCurveTo(
        canvas.width / 2,
        margin.top + drawingHeight * 0.15,
        margin.left,
        margin.top + drawingHeight * 0.2
      );
      ctx.closePath();
      ctx.fill();

      // Bottom shaded area
      ctx.beginPath();
      ctx.moveTo(margin.left, canvas.height - margin.bottom);
      ctx.lineTo(canvas.width - margin.right, canvas.height - margin.bottom);
      ctx.lineTo(
        canvas.width - margin.right,
        canvas.height - margin.bottom - drawingHeight * 0.1
      );
      ctx.quadraticCurveTo(
        canvas.width / 2,
        canvas.height - margin.bottom - drawingHeight * 0.05,
        margin.left,
        canvas.height - margin.bottom - drawingHeight * 0.1
      );
      ctx.closePath();
      ctx.fill();

      // Restore context after shaded areas
      ctx.restore();
    };

    // Draw ROI box with zoom
    const drawROIBox = () => {
      const drawingWidth = canvas.width - margin.left - margin.right;
      const drawingHeight = canvas.height - margin.top - margin.bottom;

      // Save context for ROI box
      ctx.save();

      // Clip to drawing area
      ctx.beginPath();
      ctx.rect(margin.left, margin.top, drawingWidth, drawingHeight);
      ctx.clip();

      // Apply zoom transformation
      const centerX = margin.left + drawingWidth / 2;
      const centerY = margin.top + drawingHeight / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-centerX, -centerY);

      // Calculate ROI box dimensions
      const yStart = margin.top + drawingHeight * 0.3;
      const yEnd = margin.top + drawingHeight * 0.7;
      const xStart = margin.left + drawingWidth * 0.3;
      const xEnd = margin.left + drawingWidth * 0.7;

      // Draw dashed ROI box
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(xStart, yStart);
      ctx.lineTo(xEnd, yStart);
      ctx.lineTo(xEnd, yEnd);
      ctx.lineTo(xStart, yEnd);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw orange dashed line at 25m
      const y25m = canvas.height - margin.bottom - 25 * (drawingHeight / 150);
      ctx.strokeStyle = "#FFA500";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(margin.left, y25m);
      ctx.lineTo(canvas.width - margin.right, y25m);
      ctx.stroke();
      ctx.setLineDash([]);

      // Restore context after ROI box
      ctx.restore();
    };

    // Draw axes (không zoom)
    const drawAxes = () => {
      const drawingWidth = canvas.width - margin.left - margin.right;
      const drawingHeight = canvas.height - margin.top - margin.bottom;

      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Y axis
      ctx.moveTo(margin.left, canvas.height - margin.bottom);
      ctx.lineTo(margin.left, margin.top);

      // X axis
      ctx.moveTo(margin.left, canvas.height - margin.bottom);
      ctx.lineTo(canvas.width - margin.right, canvas.height - margin.bottom);

      ctx.stroke();

      // Add labels and numbers
      ctx.fillStyle = "#000";
      ctx.font = "12px Arial";

      // Y axis label
      ctx.save();
      ctx.translate(20, canvas.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillText("Distance (m)", 0, 0);
      ctx.restore();

      // X axis label
      ctx.textAlign = "center";
      ctx.fillText("Road Width (m)", canvas.width / 2, canvas.height - 15); // Đổi từ -5 thành -15

      // Y axis numbers
      ctx.textAlign = "right";
      for (let i = 0; i <= 150; i += 15) {
        const y = canvas.height - margin.bottom - i * (drawingHeight / 150);
        ctx.fillText(i.toString(), margin.left - 5, y + 4);
      }

      // X axis numbers
      ctx.textAlign = "center";
      for (let i = -35; i <= 35; i += 5) {
        const x = margin.left + drawingWidth / 2 + i * (drawingWidth / 70);
        ctx.fillText(i.toString(), x, canvas.height - margin.bottom + 15);
      }

      // Draw direction arrow
      const arrowY = canvas.height - margin.bottom + 25;
      const arrowCenterX = canvas.width / 2;
      const arrowSize = 10;

      ctx.beginPath();
      ctx.moveTo(arrowCenterX, arrowY + arrowSize);
      ctx.lineTo(arrowCenterX - arrowSize / 2, arrowY);
      ctx.lineTo(arrowCenterX + arrowSize / 2, arrowY);
      ctx.closePath();
      ctx.fillStyle = "#666";
      ctx.fill();
    };

    // Clear and draw everything
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      drawShadedAreas();
      drawROIBox();
      drawAxes(); // Axes drawn last and without zoom
    };

    // Initial render
    render();

    // Handle window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      render();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [zoomLevel]); // Re-render when zoom changes

  return (
    <div class="flex h-screen">
      <div class="flex-1 bg-white relative p-8">
        <div class="absolute top-4 right-8 p-4 flex items-center gap-4">
          {/* Status indicators */}
          <div class="flex items-center gap-2 text-sm">
            <span class="text-green-500">•</span>
            <span class="text-gray-600">Presence</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span class="text-orange-500">•</span>
            <span class="text-gray-600">Movement</span>
          </div>

          {/* Control buttons */}
          <div class="flex gap-2">
            <button
              class="p-2 hover:bg-gray-100 rounded transition-colors"
              onClick={() => handleZoom()}
              title={`Zoom Level: ${zoomLevel}x`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <button class="p-2 hover:bg-gray-100 rounded transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </button>
            <button
              class="p-2 hover:bg-gray-100 rounded transition-colors"
              onClick={() => setShowGuide(true)}
              title="Show guide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="w-full h-full bg-white rounded-lg shadow-lg p-4 chart-container">
          <canvas ref={canvasRef} class="w-full h-full" />
        </div>

        {isReconnecting && (
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded shadow">
            <p class="text-orange-500">Reconnecting ...</p>
          </div>
        )}

        {showGuide && (
          <GuideModal
            currentStep={currentStep}
            onClose={() => {
              setShowGuide(false);
              setCurrentStep(1);
            }}
            onNext={handleNext}
          />
        )}
      </div>

      {/* Right side controls */}
      <div class="w-[576px] bg-white p-6 mr-6 flex relative">
        {/* Main controls - 70% width */}
        <div class="w-[70%] overflow-y-auto pr-6 scrollbar-hide">
          <style>
            {`
              .scrollbar-hide {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;     /* Firefox */
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;             /* Chrome, Safari and Opera */
              }
            `}
          </style>
          {/* 1. Region of Interest (ROI) Section */}
          <section class="mb-8 bg-white rounded-lg shadow-md p-6 border border-gray-100 roi-section">
            <h2 class="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              1. Region of Interest (ROI)
            </h2>

            <div class="space-y-4">
              <div class="flex justify-between items-center gap-2">
                <label>Corner "A" of the Region of Interest (ROI)</label>
                <input
                  type="number"
                  class="w-24 border rounded px-2 py-1"
                  value="-10"
                />
                <span>m</span>
              </div>

              <div class="flex justify-between items-center gap-2">
                <label>Corner "B" of the Region of Interest (ROI)</label>
                <input
                  type="number"
                  class="w-24 border rounded px-2 py-1"
                  value="10"
                />
                <span>m</span>
              </div>

              <div class="flex justify-between items-center gap-2">
                <label>Distance between TMB radar and stopline</label>
                <input
                  type="number"
                  class="w-24 border rounded px-2 py-1"
                  value="15"
                />
                <span>m</span>
              </div>

              <div class="flex justify-between items-center gap-2">
                <label>Maximum distance from TMB radar</label>
                <input
                  type="number"
                  class="w-24 border rounded px-2 py-1"
                  value="80"
                />
                <span>m</span>
              </div>

              <div class="flex justify-between items-center gap-2">
                <label>Enable Incoming Count line</label>
                <div class="toggle-switch">
                  <input type="checkbox" checked />
                </div>
              </div>

              <div class="flex justify-between items-center gap-2">
                <label>Incoming Count line</label>
                <input
                  type="number"
                  class="w-24 border rounded px-2 py-1"
                  value="70"
                />
                <span>m</span>
              </div>

              <div class="flex justify-between items-center gap-2">
                <label>Enable Outgoing Count line</label>
                <div class="toggle-switch">
                  <input type="checkbox" checked />
                </div>
              </div>

              <div class="flex justify-between items-center gap-2">
                <label>Outgoing Count line</label>
                <input
                  type="number"
                  class="w-24 border rounded px-2 py-1"
                  value="25"
                />
                <span>m</span>
              </div>

              <div class="flex justify-between items-center gap-2">
                <label>Lock the Region of Interest (ROI)</label>
                <div class="toggle-switch">
                  <input type="checkbox" />
                </div>
              </div>

              <button class="w-full bg-orange-600 text-white py-2 rounded">
                Save the ROI
              </button>
            </div>
          </section>

          {/* 2. Installation Section */}
          <section class="mb-8 bg-white rounded-lg shadow-md p-6 border border-gray-100 installation-section">
            <h2 class="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              2. Installation
            </h2>

            <div class="space-y-4">
              <div class="flex justify-between items-center gap-2">
                <label>Installation azimut</label>
                <input
                  type="number"
                  class="w-24 border rounded px-2 py-1"
                  value="90"
                />
                <span>deg</span>
              </div>

              <button class="w-full bg-orange-600 text-white py-2 rounded">
                Save the azimuth
              </button>
            </div>
          </section>

          {/* 3. Virtual loops Section */}
          <section class="mb-8 bg-white rounded-lg shadow-md p-6 border border-gray-100 virtual-loops-section">
            <h2 class="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              3. Virtual loops
            </h2>

            <div class="space-y-4">
              <div class="flex justify-between items-center gap-2">
                <label>Loop</label>
                <input
                  type="number"
                  class="w-24 border rounded px-2 py-1"
                  value="1"
                />
              </div>

              <div class="flex justify-between items-center gap-2   ">
                <label>Virtual loop parameters</label>
                <button class="text-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>

              <div class="flex justify-between items-center gap-2">
                <label>Presence forget time</label>
                <input
                  type="number"
                  class="w-24 border rounded px-2 py-1"
                  value="2000"
                />
                <span>ms</span>
              </div>
            </div>
          </section>

          {/* 4. Misc. parameters Section */}
          <section class="mb-8 bg-white rounded-lg shadow-md p-6 border border-gray-100 parameters-section">
            <h2 class="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              4. Misc. parameters
            </h2>

            <div class="space-y-4">
              <div class="flex justify-between items-center gap-2">
                <div>
                  <label class="block">Presence forget time</label>
                  <span class="text-xs text-gray-500">(p401041)</span>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    type="number"
                    class="w-24 border rounded px-2 py-1"
                    value="3000"
                  />
                  <span>s.</span>
                </div>
              </div>

              <div class="flex justify-between items-center gap-2">
                <div>
                  <label class="block">TMB radar channel</label>
                  <span class="text-xs text-gray-500">(p400138)</span>
                </div>
                <select class="w-24 border rounded px-2 py-1">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </div>
          </section>

          {/* Commands Section */}
          <section class="mb-8 bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h2 class="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Commands
            </h2>

            <div class="space-y-3">
              <button class="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded text-gray-700">
                Reload TMB radar parameters
              </button>
              <button class="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded text-gray-700">
                Factory reset
              </button>
              <button class="w-full bg-[#D84315] hover:bg-[#BF360C] text-white py-2 rounded">
                Save configuration
              </button>
            </div>
          </section>
        </div>

        {/* Guide section - 30% width */}
        <div class="w-[30%]">
          <div class="fixed bottom-6 right-6">
            <button
              onClick={() => setShowGuide(true)}
              class="p-3 bg-[#D84315] hover:bg-[#BF360C] text-white rounded-full shadow-lg transition-all hover:shadow-xl active:scale-95 flex items-center gap-2 group"
              title="Show setup guide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showGuide && (
        <GuideModal
          currentStep={currentStep}
          onClose={() => {
            setShowGuide(false);
            setCurrentStep(1);
          }}
          onNext={handleNext}
        />
      )}
    </div>
  );
};

export default SceneOverview;
