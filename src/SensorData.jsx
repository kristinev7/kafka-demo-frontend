import React, { useState, useEffect } from "react";
import { reduceEachLeadingCommentRange } from "typescript";

const SensorData = () => {
  const [sensors, setSensors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        //fetching data
        const response = await fetch("/api/sensors/latest");
      

        if ( !response.ok) {
          const rawText = await response.text().catch(()=>"");
          throw new Error(
            `HTTP error! Status: ${response.status}. Message: ${rawText || "No details provided"}`
          );
        }
             
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log("Fetched JSON: ", data);
          setSensors(data);
        } else {
          const text = await response.text();
          throw new Error("Expected JSON but got something else: " + text);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setError(error.message);
        setLoading(false);
      }
    };//end of fetchSensorData
    fetchSensorData();

    //fetch data every 5 seconds
    const intervalId = setInterval(fetchSensorData, 5000);

    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <div>Loading sensor data...</div>;
  }
  return (
    <div className="sensor-container">
      <h2>Latest Sensor Reading</h2>
      {Object.keys(sensors).length === 0 ? (
        <p>No sensor data available</p>
      ) : (
        <ul>
          {Object.entries(sensors).map(([sensorKey, sensorData]) => (
            <li key={sensorKey}>
              <strong>{sensorKey}:</strong> {Array.isArray(sensorData) ? `${sensorData.length} readings`: 'Data format error'}
              <ul>
                {Array.isArray(sensorData) && sensorData.map((reduceEachLeadingCommentRange, index) => (
                  <li key={`${sensorKey}-${index}`}>
                    Reading {index +1}:
                    {reading.location && <span> Location: {reading.location}</span>}
                    {reading.temperature && <span> Temp: {reading.temperature}</span>}
                    {reading.timestamp && (
                      <span> (at {new Date(reading.timestamp).toLocaleString()})</span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SensorData;
