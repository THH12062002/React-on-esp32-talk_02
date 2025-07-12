import { useEffect, useState } from "preact/hooks";
import { Fragment } from "preact";

export function PushButton() {
  const [count, setCount] = useState<number>(0);
  const [btnPressed, setBtnPressed] = useState<boolean>(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://my-esp32.local/ws-api/btn-push");
    setSocket(ws);

    ws.onopen = () => {
      ws.send("ready for button press");
    };

    ws.onmessage = (event) => {
      console.log(event.data);
      const data = JSON.parse(event.data);
      setBtnPressed(data.btn_state);
      setCount((c) => (c++ > 99 ? 0 : c));
    };

    return () => {
      if (ws) {
        ws.close();
      }
      setSocket(null);
      setBtnPressed(false);
      setCount(0);
    };
  }, []);

  return (
    <Fragment>
      <div class="flex flex-col items-center justify-center h-screen gap-4">
        <span class="countdown font-mono text-6xl">
          <span style={`--value:${count};`} />
        </span>

        <div class="alert alert-info shadow-lg w-32">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="stroke-current flex-shrink-0 w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{btnPressed ? "pressed" : "released"}</span>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
