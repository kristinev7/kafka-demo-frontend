import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const DisplaySensorData = ({ sensors }) => {
    const [selectedMetric, setSelectedMetric] = useState("temperature");
    const [selectedSensor, setSelectedSensor] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);

    //get list of sensor Ids
    const sensorIds = Object.keys(sensors);

    //get unique locations
    const locations = [...new Set(
        sensorIds.map(id => sensors[id]?.[0]?.location).filter(Boolean)
    )];

    //filter sensors by selected location
    const filteredSensorIds = selectedLocation ? sensorIds.filter(id => sensors[id]?.[0]?.location ===
        selectedLocation) : sensorIds;

    //get data for selected sensor
    const chartData = selectedSensor ? sensors[selectedSensor]?.map(reading => ({
        time: new Date(reading.timestamp).toLocaleTimeString(),
        value: reading[selectedMetric],
    }) ) : [];

    return (
        <div>
            {/*Metric buttons*/}
            <div>
                {["temperature", "humidity", "pressure"].map(metric => (
                    <button
                        key={metric}
                        onClick={() => setSelectedMetric(metric)}
                        style = {{ fontWeight: selectedMetric === metric ? "bold" : "normal"}}
                    >
                    {metric}
                    </button>
                ))}
            </div>
            {/* Location Buttons */}
            <div>
                <span>Location: </span>
                <button
                    onClick={() => {
                        setSelectedLocation(null);
                        setSelectedSensor(null);
                    }}
                    style={{ fontWeight: selectedLocation === null ? "bold" : "normal"}}
                >
                 All
                </button>
                {locations.map(location => (
                    <button
                        key={location}
                        onClick={()=>{
                            setSelectedLocation(location);
                            setSelectedSensor(null); // resets sensor when location changes
                        }}
                        style={{ fontWeight: selectedLocation === location ? "bold" : "normal"}}
                    >
                      {location}
                    </button>
                ))}
            </div>

            {/*Sensor Buttons filter by location */}
            <div>
                <span> Sensor: </span>
                {filteredSensorIds.map(sensorId => (
                    <button
                        key={sensorId}
                        onClick={() => setSelectedSensor(sensorId)}
                        style= {{fontWeight: selectedSensor === sensorId ? "bold" : "normal"}}
                    >
                     {sensorId}
                    </button>
                ))}
            </div>

            {/*Chart */}
            {selectedSensor && (
                    <div>
                        <h3>{selectedSensor}</h3>
                        <p>Location: {sensors[selectedSensor]?.[0]?.location || "Unknown"}</p>
                        <LineChart width={600} height={300} data={chartData}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey = "time"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Line type="monotone" dataKey="value" name={selectedMetric} stroke="#8884d8"/>
                        </LineChart>
                    </div>

            )}
        </div>
    );
};//end of func

export default DisplaySensorData;