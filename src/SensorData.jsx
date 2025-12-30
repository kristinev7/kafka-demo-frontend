import DisplaySensorData from "./DisplaySensorData";
import RawSensorData from "./RawSensorData";
import React, {useState, useEffect} from "react";

const SensorData = () => {
    const[sensors, setSensors] = useState({});
    const[loading, setLoading] = useState(true);
    const[error, setError] = useState(null);
    const[view, setView] = useState("charts");

    useEffect(()=> {
        const fetchData = async () => {
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
                    //console.log("Fetched JSON: ", data);
                    setSensors(data);
                } else {
                    const text = await response.text();
                    throw new Error("Expected JSON but got something else: " + text);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching sensor data: ", error);
                setError(error.message);
                setLoading(false);
              }
        };
        fetchData();
        //poll every 5 seconds
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return(
        <div>
            {/*Toggle Buttons */}
            <div>
                <button
                    onClick={() => setView("charts")}
                    style={{ fontWeight: view === "charts" ? "bold" : "normal"}}
                >
                    Charts
                </button>
                <button
                    onClick={() => setView("raw")}
                    style={{ fontWeight: view === "raw" ? "bold" : "normal"}}
                >
                    Raw Data
                </button>
            </div>
            {/*Render selected View*/}
            {view === "charts" ? (
                <DisplaySensorData readingsByLocation={sensors} />
            ) : (
                <RawSensorData sensors={sensors} />
            )}

        </div>
    );
};
export default SensorData;