import { useEffect, useState } from "preact/hooks";

export const Alarm = () => {
  const [alarms, setAlarms] = useState([]);
  const [newTime, setNewTime] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const addAlarm = async () => {
    const newAlarm = {
      id: Date.now(),
      time: newTime,
      label: newLabel,
      enabled: true,
    };
    await fetch("/api/alarms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newAlarm),
    });
    setAlarms([...alarms, newAlarm]);
    setNewTime("");
    setNewLabel("");
  };

  const toggleAlarm = (id) => {
    setAlarms(
      alarms.map((alarm) =>
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
      )
    );
  };

  const deleteAlarm = (id) => {
    setAlarms(alarms.filter((alarm) => alarm.id !== id));
  };

  return (
    <div class="flex flex-col items-center justify-center h-screen gap-4">
      <h2>Clock Alarms</h2>

      <div>
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime((e.target as HTMLInputElement).value)}
        />
        <input
          type="text"
          placeholder="Label"
          value={newLabel}
          onChange={(e) => setNewLabel((e.target as HTMLInputElement).value)}
        />
        <button onClick={addAlarm}>Add Alarm</button>
      </div>

      <ul>
        {alarms.map((alarm) => (
          <li key={alarm.id}>
            <span>
              {alarm.time} - {alarm.label}
            </span>
            <button onClick={() => toggleAlarm(alarm.id)}>
              {alarm.enabled ? "Disable" : "Enable"}
            </button>
            <button onClick={() => deleteAlarm(alarm.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
