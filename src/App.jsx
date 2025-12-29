import "./App.css";
import React from "react";
import Compare from "./Compare";

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Kafka Sensor Dashboard</h1>
      </header>
      <main>
        <Compare />
      </main>
    </div>
  );
}
