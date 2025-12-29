import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const DisplaySensorData = ({ readingsByLocation }) => {
    const [selectedMetric, setSelectedMetric] = useState("temperature");
    const [selectedLocationKey, setSelectedLocationKey] = useState(null);

    //get location keys
    const locationKeys = useMemo( ()=> Object.keys(readingsByLocation || {}), [readingsByLocation]);

    //get the first one if no location is selected
    const effectiveLocationKey = selectedLocationKey ?? (locationKeys.length>0 ? locationKeys[0] : null);

    const readingsForLocation = useMemo(() => {
        if (!effectiveLocationKey) return [];
        const arr = readingsByLocation?.[effectiveLocationKey];
        return Array.isArray(arr) ? arr: [];
    }, [readingsByLocation, effectiveLocationKey]);

    //building chars using recharts
    const chartData = useMemo( () => {
        return readingsForLocation.map( (reading) => ({
            time: reading?.timestamp ? new Date(reading.timestamp).toLocaleTimeString() : "",
            value: reading?.[selectedMetric] == null ? null : Number(reading[selectedMetric]),
        }));
    }, [readingsForLocation, selectedMetric]);

    //display metadata
    const firstReading = readingsForLocation?.[0] || null;
    const locationType = firstReading?.locationType ?? null;
    return (
        <div>
            {/*buttons for sensors*/}
            <div style={{marginBottom: 10 }}>
                {["temperature", "humidity", "pressure"].map( (metric) =>(
                    <button
                        key={metric}
                        onClick={()=> setSelectedMetric(metric)}
                        style={{
                            fontWeight: selectedMetric === metric ? "bold": "normal",
                            marginRight: 8,
                        }}
                    >
                    {metric}
                    </button>
                 ))}
             </div>
            {/*Location buttons*/}
            <div style={{marginBottom: 10}}>
                <span style={{marginRight: 8}}>Location:</span>
                {locationKeys.length === 0 ? (<span>(no locations)</span>):(
                    locationKeys.map((locKey) => (
                        <button
                            key= {locKey}
                            onClick={() => setSelectedLocationKey(locKey)}
                            style={{
                                fontWeight: effectiveLocationKey === locKey ? "bold": "normal",
                                marginRight: 8,
                            }}
                        >
                            {locKey}
                        </button>
                    ))
                )}
            </div>

            {/*chart*/}
            {effectiveLocationKey && (
                <div>
                    <h3 style={{marginBottom: 6}}>
                        {effectiveLocationKey}
                        {locationType ? ` (${locationType})`: ""}
                    </h3>
                    {chartData.length === 0 ? (
                        <p>No readings for this location yet.</p>
                    ) : (
                        <LineChart width={600} height={300} data={chartData}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="time"/>
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="value"
                                name={selectedMetric}
                                stroke="#8884d8"
                                dot={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    )}
                </div>
            )}
        </div>
    );
};


export default DisplaySensorData;