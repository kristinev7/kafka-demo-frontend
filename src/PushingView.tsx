import React, { useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import DisplaySensorData from "./DisplaySensorData";

type SensorReading = {
  sensorId?: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  locationId?: string;
  location?: string;
  locationType?: string;
  timestamp?: string;
};

type SensorsByLocation = Record<string, SensorReading[]>;

function readingAgeMs(r?: SensorReading | null): number | null {
  if (!r?.timestamp) return null;
  const t = new Date(r.timestamp).getTime();
  if (Number.isNaN(t)) return null;
  return Date.now() - t;
}

function getLocationKey(r: SensorReading): string {
  return (r.locationId ?? r.location ?? "unknown") as string;
}

const MAX = 50;

const PushingView: React.FC = () => {
  const [sensors, setSensors] = useState<SensorsByLocation>({});
  const [connected, setConnected] = useState(false);

  // choose a location topic to subscribe to
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // stats
  const [messagesReceived, setMessagesReceived] = useState(0);
  const [updatesApplied, setUpdatesApplied] = useState(0);
  const [lastMessageAt, setLastMessageAt] = useState<number | null>(null);
  const [messagesPerSec, setMessagesPerSec] = useState<number>(0);

  const clientRef = useRef<Client | null>(null);
  const subRef = useRef<StompSubscription | null>(null);

  // rolling counter for messages/sec
  const msgTimestampsRef = useRef<number[]>([]);

  const locationKeys = useMemo(() => Object.keys(sensors || {}), [sensors]);
  const readingsForSelected = sensors?.[selectedLocation] || [];
  const latest = readingsForSelected.length ? readingsForSelected[0] : null;
  const age = useMemo(() => readingAgeMs(latest), [latest]);

  // Bootstrap once so user has locations + chart immediately (common real-world pattern)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/sensors/latest");
        if (!res.ok) return;
        const json = (await res.json()) as SensorsByLocation;
        setSensors(json || {});
        const locs = Object.keys(json || {});
        if (!selectedLocation && locs[0]) setSelectedLocation(locs[0]);
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // connect websocket once
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("/ws"),
      reconnectDelay: 2000,
      debug: () => {},
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"], frame.body);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      subRef.current?.unsubscribe();
      subRef.current = null;
      client.deactivate();
      clientRef.current = null;
    };
  }, []);

  // update messages/sec once per second
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      // keep last 5 seconds for smoothing
      msgTimestampsRef.current = msgTimestampsRef.current.filter((t) => now - t <= 5000);
      const perSec = msgTimestampsRef.current.length / 5;
      setMessagesPerSec(Number(perSec.toFixed(2)));
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  // subscribe whenever selectedLocation changes
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !connected || !selectedLocation) return;

    subRef.current?.unsubscribe();
    subRef.current = null;

    const topic = `/topic/location/${selectedLocation}`;

    subRef.current = client.subscribe(topic, (msg: IMessage) => {
      const reading = JSON.parse(msg.body) as SensorReading;
      const locKey = getLocationKey(reading);

      setMessagesReceived((c) => c + 1);
      setLastMessageAt(Date.now());
      msgTimestampsRef.current.push(Date.now());

      setSensors((prev) => {
        const prevList = prev[locKey] || [];
        const nextList = [reading, ...prevList].slice(0, MAX);
        return { ...prev, [locKey]: nextList };
      });

      setUpdatesApplied((u) => u + 1);
    });

    return () => {
      subRef.current?.unsubscribe();
      subRef.current = null;
    };
  }, [connected, selectedLocation]);

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h2>Pushing View (WebSocket)</h2>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <strong>Status:</strong> {connected ? "Connected" : "Disconnected"}
        </div>

        <label>
          Subscribe to{" "}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            disabled={!locationKeys.length}
          >
            <option value="">(pick one)</option>
            {locationKeys.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => {
            setMessagesReceived(0);
            setUpdatesApplied(0);
            setLastMessageAt(null);
            setMessagesPerSec(0);
            msgTimestampsRef.current = [];
          }}
        >
          Reset stats
        </button>
      </div>

      {/* Stats panel */}
      <div
        style={{
          marginTop: 10,
          padding: 10,
          borderRadius: 8,
          background: "#fafafa",
          border: "1px solid #eee",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Stats</div>
        <div><strong>Messages received:</strong> {messagesReceived}</div>
        <div><strong>Updates applied:</strong> {updatesApplied}</div>
        <div><strong>Messages/sec (smoothed):</strong> {messagesPerSec}</div>
        <div>
          <strong>Last message:</strong>{" "}
          {lastMessageAt ? new Date(lastMessageAt).toLocaleTimeString() : "(none yet)"}
        </div>
        <div><strong>Latest reading age:</strong> {age == null ? "(unknown)" : `${age} ms`}</div>
      </div>

      {/* Chart */}
      <div style={{ marginTop: 12 }}>
        <DisplaySensorData sensors={sensors} />
      </div>
    </div>
  );
};

export default PushingView;
