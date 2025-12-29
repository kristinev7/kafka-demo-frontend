import React from "react";
import PollingView from "./PollingView";
import PushingView from "./PushingView";

const Compare: React.FC = () => {

    return (
        <div style= {{padding: 16}}>
            <h1>Polling vs Pushing</h1>
            <p style={{marginTop: 0}}>
                Left: Http polling snapshots.
                Right: WebSocket pushes live updates.
            </p>
            <div style= {{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
                <PollingView/>
                <PushingView/>
            </div>
        </div>
    );
};

export default Compare;