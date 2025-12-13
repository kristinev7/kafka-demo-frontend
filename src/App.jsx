import "./App.css";
import SensorData from "./SensorData.jsx";

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Kafka Sensor Dashboard</h1>
      </header>
      <main>
        <SensorData />
      </main>
    </div>
  );
}
