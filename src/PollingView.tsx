import React, { useEffect, useMemo, useRef, useState } from "react";
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

type ReadingsByLocation = Record<string, SensorReading[]>;

function getLatestReading(readingsByLocation: ReadingsByLocation): SensorReading | null {
  const firstKey = Object.keys(readingsByLocation || {})[0];
  const arr = firstKey ? readingsByLocation[firstKey] : null;
  return arr && arr.length ? arr[0] : null;
}

function readingAgeMs(r?: SensorReading | null): number | null {
  if (!r?.timestamp) return null;
  const t = new Date(r.timestamp).getTime();
  if (Number.isNaN(t)) return null;
  return Date.now() - t;
}

const PollingView = () => {
  const [readingsByLocation, setReadingsByLocation] = useState<ReadingsByLocation>({});
  const [pollMs, setPollMs] = useState<number>(5000);

  // stats
  const [requestCount, setRequestCount] = useState(0);
  const [updatesApplied, setUpdatesApplied] = useState(0);
  const [lastUpdateAt, setLastUpdateAt] = useState<number | null>(null);
  const [lastFetchMs, setLastFetchMs] = useState<number | null>(null);

  const prevSnapshotHashRef = useRef<string>("");

//  get reading if readingsByLocation changes
  const latest = useMemo(
    () => getLatestReading(readingsByLocation),
    [readingsByLocation]
  );
//get time if latest changes, this shows how old the data is
  const age = useMemo(() => readingAgeMs(latest), [latest]);

//how many times it is polling, how many requests per minute
  const rpm = useMemo(() => {
    if (!pollMs || pollMs <= 0) return 0;
    //60000ms = 1min; 60000ms/ms per request
    return Math.round(60000 / pollMs);
  }, [pollMs]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      const start = performance.now();
      try {
        setRequestCount((c) => c + 1);

        const res = await fetch("/api/sensors/latest");
        const elapsed = Math.round(performance.now() - start);
        if (!cancelled) setLastFetchMs(elapsed);

        //error handling for res
        if (!res.ok) {
          const raw = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status}: ${raw || "no details"}`);
        }
        //converts res to Javascript object
        const json = (await res.json()) as ReadingsByLocation;

        //entire snapshot into a string for comparison
        const hash = JSON.stringify(json || {});
        //if there are changes, save new snapshot into hash for next comparison
        if (hash !== prevSnapshotHashRef.current) {
          prevSnapshotHashRef.current = hash;
          if (!cancelled) {
            setReadingsByLocation(json || {});//updates sensor data
            setUpdatesApplied((u) => u + 1); // updates count
            setLastUpdateAt(Date.now()); //updates timestamp
          }
        }
      } catch (e) {
        console.error("Polling fetch failed:", e);
      }
    };

    fetchData();
    //start polling
    const id = window.setInterval(fetchData, pollMs);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollMs]);

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h2>Polling View</h2>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          Poll every{" "}
          <input
            type="number"
            min={200}
            step={100}
            value={pollMs}
            onChange={(e) => setPollMs(Number(e.target.value || 0))}
            style={{ width: 110 }}
          />{" "}
          ms
        </label>

        <button
          onClick={() => {
            setRequestCount(0);
            setUpdatesApplied(0);
            setLastUpdateAt(null);
            setLastFetchMs(null);
          }}
        >
          Reset stats
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          marginTop: 10,
          padding: 10,
          borderRadius: 8,
          background: "#fafafa",
          border: "1px solid #eee",
        }}
      >
        <div><strong>Requests made:</strong> {requestCount}</div>
        <div><strong>Approx requests/min:</strong> {rpm}</div>
        <div><strong>Snapshot updates applied:</strong> {updatesApplied}</div>
        <div>
          <strong>Last update:</strong>{" "}
          {lastUpdateAt ? new Date(lastUpdateAt).toLocaleTimeString() : "(none yet)"}
        </div>
        <div>
          <strong>Latest reading age:</strong>{" "}
          {age == null ? "(unknown)" : `${age} ms`}
        </div>
        <div>
          <strong>Last fetch duration:</strong>{" "}
          {lastFetchMs == null ? "(n/a)" : `${lastFetchMs} ms`}
        </div>
      </div>

      {/* Charts */}
      <div style={{ marginTop: 12 }}>
        <DisplaySensorData readingsByLocation={readingsByLocation} />
      </div>
    </div>
  );
};

export default PollingView;
