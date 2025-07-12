import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { Fragment } from "preact";
import debounce from "lodash.debounce";

export const Servo = () => {
  const [angle, setAngle] = useState(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://my-esp32.local/ws-api/servo");
    setSocket(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({ angle: 0 }));
    };

    return () => {
      if (ws) {
        try {
          ws.send(JSON.stringify({ angle: 0 }));
          ws.close();
        } catch (e) {
          console.error("Error closing servo websocket:", e);
        }
      }
      setSocket(null);
      setAngle(0);
    };
  }, []);

  const onSlide = (value: number) => {
    setAngle(value);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ angle: value }));
    }
  };

  return (
    <Fragment>
      <div class="flex flex-col items-center justify-center h-screen gap-4">
        <svg
          transform={`rotate(${(angle + 270) * -1})`}
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7l4-4m0 0l4 4m-4-4v18"
          />
        </svg>
        <input
          type="range"
          min="0"
          max="180"
          value={angle}
          class="range range-accent w-96"
          onChange={(e: any) => onSlide(Number(e.target.value))}
        ></input>
      </div>
    </Fragment>
  );
};
