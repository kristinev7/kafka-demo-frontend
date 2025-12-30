import React from "react";
import PollingView from "./PollingView";
import PushingView from "./PushingView";

const Compare: React.FC = () => {
  return (
    <div style={{ padding: 16 }}>
      <h1>Polling vs Pushing</h1>
      <p style={{ marginTop: 0 }}>
        Top: HTTP polling snapshots.
        <br />
        Bottom: WebSocket pushing live updates.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <PollingView />
        <PushingView />
      </div>
    </div>
  );
};

export default Compare;
