import { useEffect, useRef, useState } from "preact/hooks";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const initialData = {
  labels: Array(20).fill(""),
  datasets: [
    {
      label: "Magnetometer Data",
      data: Array(20).fill(0),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
  ],
};

const chartOptions = {
  responsive: true,
  animation: {
    duration: 0,
  },
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Magnetometer Reading",
    },
  },
  scales: {
    y: {
      min: 0,
      max: 500,
    },
  },
};

export function Magnetometer() {
  const [chartData, setChartData] = useState(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const maxRef = useRef(0);
  const minRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket("ws://my-esp32.local/ws-api/magnetometer");
        socketRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setIsConnected(true);
          setError(null);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ cmd: "start", interval: 200 }));
          }
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            setChartData((prevData) => {
              const newData = [...prevData.datasets[0].data];
              newData.shift();
              maxRef.current = Math.max(maxRef.current, data.val);
              minRef.current = Math.min(minRef.current, data.val);
              newData.push(data.val);

              return {
                ...prevData,
                datasets: [
                  {
                    ...prevData.datasets[0],
                    data: newData,
                  },
                ],
              };
            });
          } catch (err) {
            console.error("Error parsing message:", err);
          }
        };

        ws.onerror = (event) => {
          if (!isMounted) return;
          console.error("WebSocket error:", event);
          setError("Connection error occurred");
          setIsConnected(false);
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setIsConnected(false);
          setError("Connection closed");
        };
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to create WebSocket:", err);
        setError("Failed to connect");
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ cmd: "stop" }));
        }
        socketRef.current.close();
        socketRef.current = null;
      }
      setChartData(initialData);
      setIsConnected(false);
      setError(null);
    };
  }, []);

  return (
    <div className="w-1/2">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <Line options={chartOptions} data={chartData} />
    </div>
  );
}
