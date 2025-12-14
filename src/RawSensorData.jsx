import React from "react";

const RawSensorData = ({sensors}) => {
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
                {Array.isArray(sensorData) && sensorData.map((reading, index) => (
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

export default RawSensorData;
