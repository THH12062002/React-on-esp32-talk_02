import { h } from "preact";
import { X } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";

interface GuideModalProps {
  currentStep: number;
  onClose: () => void;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
}

interface Position {
  top: number;
  left: number;
}

const TOTAL_STEPS = 6;

const STEPS_CONTENT = [
  {
    title: "Region of Interest",
    description: "First, set the Region of Interest (ROI) and save it.",
    highlightSelector: ".roi-section",
  },
  {
    title: "Region of Interest Preview",
    description:
      "It is also possible to change the Region of Interest on the preview. To do this, select the dotted area and drag a corner to resize it. Remember to save the changes you have made by saving the Region of Interest.",
    highlightSelector: ".chart-container", // Highlight chart area
  },
  {
    title: "Azimut",
    description:
      "Next, set the azimuth. The azimuth is the angle between the stop-line and the TMB radar.",
    highlightSelector: ".installation-section",
  },
  {
    title: "Virtual loops",
    description: "Next, set up the different virtual loops you wish to use.",
    highlightSelector: ".virtual-loops-section",
  },
  {
    title: "Parameters",
    description: "Configure misc parameters for fine-tuning.",
    highlightSelector: ".parameters-section",
  },
  {
    title: "Viewing the data - Adjusting the loops",
    description:
      "The vehicles will start to appear in the preview after saving, so you can adjust the loops as required. Remember to save the changes you have made by saving the configuration.",
    highlightSelector: ".chart-container",
  },
];

export const GuideModal = ({
  currentStep,
  onClose,
  onNext,
  onBack,
  onSkip,
}: GuideModalProps) => {
  const currentContent = STEPS_CONTENT[currentStep - 1];
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

  useEffect(() => {
    if (currentContent.highlightSelector) {
      const section = document.querySelector(currentContent.highlightSelector);
      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        const rect = section.getBoundingClientRect();
        const modalWidth = 400;
        const modalHeight = 250;
        const spacing = 20;

        let left = rect.right + spacing;
        let top = rect.top + (rect.height - modalHeight) / 2;

        // Điều chỉnh vị trí cho step 3, 4, 5
        if (currentStep >= 3 && currentStep <= 5) {
          // Đặt modal bên trái và điều chỉnh khoảng cách theo step
          left = rect.left;
          if (currentStep === 3) {
            top = rect.bottom + 120; // Cách xa hơn
          } else if (currentStep === 4) {
            top = rect.bottom + 60; // Cách vừa phải
          } else {
            // step 5
            top = rect.bottom + 30; // Gần hơn
          }
        } else {
          // Các step khác giữ nguyên logic cũ
          if (left + modalWidth > window.innerWidth) {
            left = rect.left - modalWidth - spacing;
          }
          top = rect.top + (rect.height - modalHeight) / 2;
        }

        // Đảm bảo modal luôn nằm trong viewport
        left = Math.max(
          spacing,
          Math.min(left, window.innerWidth - modalWidth - spacing)
        );
        top = Math.max(
          spacing,
          Math.min(top, window.innerHeight - modalHeight - spacing)
        );

        setPosition({ top, left });
      }
    }
  }, [currentStep, currentContent.highlightSelector]);

  // Update position on scroll với logic tương tự
  useEffect(() => {
    const handleScroll = () => {
      if (currentContent.highlightSelector) {
        const section = document.querySelector(
          currentContent.highlightSelector
        );
        if (section) {
          const rect = section.getBoundingClientRect();
          const modalWidth = 400;
          const modalHeight = 250;
          const spacing = 20;

          let left = rect.left;
          let top = rect.top;

          // Giữ nguyên logic vị trí cho step 3, 4, 5 khi scroll
          if (currentStep >= 3 && currentStep <= 5) {
            left = rect.left;
            if (currentStep === 3) {
              top = rect.bottom + 120; // Cách xa hơn
            } else if (currentStep === 4) {
              top = rect.bottom + 60; // Cách vừa phải
            } else {
              // step 5
              top = rect.bottom + 30; // Gần hơn
            }
          } else {
            if (rect.left > window.innerWidth / 2) {
              left = rect.left - modalWidth - spacing;
            } else {
              left = rect.right + spacing;
            }
            top = rect.top + (rect.height - modalHeight) / 2;
          }

          left = Math.max(
            spacing,
            Math.min(left, window.innerWidth - modalWidth - spacing)
          );
          top = Math.max(
            spacing,
            Math.min(top, window.innerHeight - modalHeight - spacing)
          );

          requestAnimationFrame(() => {
            setPosition({ top, left });
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentStep, currentContent.highlightSelector]);

  return (
    <div class="fixed inset-0 z-50">
      {/* Single unified overlay */}
      <div class="fixed inset-0 bg-black/30">
        {currentContent.highlightSelector && (
          <style>
            {`
              ${currentContent.highlightSelector} {
                position: relative;
                z-index: 60;
              }
              .modal-arrow::before {
                content: '';
                position: absolute;
                width: 12px;
                height: 12px;
                background: white;
                transform: rotate(45deg);
                border: 1px solid #e5e7eb;
                z-index: -1;
              }
              .modal-arrow.left::before {
                left: -6px;
                top: 50%;
                margin-top: -6px;
                border-right: none;
                border-top: none;
              }
              .modal-arrow.right::before {
                right: -6px;
                top: 50%;
                margin-top: -6px;
                border-left: none;
                border-bottom: none;
              }
              .modal-arrow.top::before {
                top: -6px;
                left: 50%;
                margin-left: -6px;
                border-bottom: none;
                border-right: none;
              }
              .modal-arrow.bottom::before {
                bottom: -6px;
                left: 50%;
                margin-left: -6px;
                border-top: none;
                border-left: none;
              }
              .modal-arrow.top-left::before {
                top: -6px;
                left: 20px;
                border-bottom: none;
                border-right: none;
              }
            `}
          </style>
        )}
      </div>

      {/* Modal */}
      <div
        class={`bg-white rounded-lg shadow-xl w-[400px] absolute z-60 modal-arrow ${
          currentStep >= 3 && currentStep <= 5 ? "top-left" : getArrowPosition()
        }`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: "translate(0, 0)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          class="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100"
        >
          <X size={14} />
        </button>

        {/* Title */}
        <div class="p-4">
          <h2 class="text-lg font-semibold text-gray-800">
            {currentContent.title}
          </h2>
        </div>

        {/* Content */}
        <div class="mx-4 mb-4 border border-gray-200 rounded-lg p-4">
          <p class="text-gray-600 text-sm">{currentContent.description}</p>
        </div>

        {/* Footer */}
        <div class="p-4 flex justify-between items-center">
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-500">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <button
              onClick={onNext}
              class="px-4 py-1.5 bg-[#D84315] text-white text-sm rounded hover:bg-[#BF360C] transition-colors"
            >
              {currentStep === TOTAL_STEPS ? "Last" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to determine arrow position
  function getArrowPosition() {
    if (!currentContent.highlightSelector) return "";

    const section = document.querySelector(currentContent.highlightSelector);
    if (!section) return "";

    const rect = section.getBoundingClientRect();
    const modalRect = {
      top: position.top,
      left: position.left,
      right: position.left + 400, // modal width
      bottom: position.top + 200, // approximate modal height
    };

    // Determine which side of the modal should show the arrow
    if (modalRect.left > rect.right) return "left";
    if (modalRect.right < rect.left) return "right";
    if (modalRect.top > rect.bottom) return "top";
    return "bottom";
  }
};

export default GuideModal;
