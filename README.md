# Kafka Sensor Dashboard - Frontend

A React frontend for visualizing real-time sensor data streamed through Apache Kafka.

## Overview

This dashboard connects to the [kafka-demo](https://github.com/kristinev7/kafka-demo) Spring Boot backend to display sensor readings (temperature, humidity, pressure) in real-time. Data is fetched via REST API with automatic polling every 5 seconds.

## Tech Stack

- **React 18** - UI library
- **Vite 5** - Build tool with Hot Module Reloading (HMR)
- **Recharts** - Charting library for data visualization

## Project Structure

```
kafka-demo-frontend/
├── src/
│   ├── App.jsx           # Main application component
│   ├── App.css           # Application styles
│   ├── SensorData.jsx    # Sensor data display component
│   └── index.jsx         # Application entry point
├── vite.config.js        # Vite configuration with API proxy
└── package.json          # Dependencies and scripts
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running on `http://localhost:8080`

## Getting Started

### 1. Install Dependencies

```bash
cd kafka-demo-frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will start on `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
npm run preview    # Preview the production build
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## Configuration

### API Proxy (vite.config.js)

The development server proxies API requests to the backend:

```javascript
proxy: {
  "/api": {
    target: "http://localhost:8080",
    changeOrigin: true,
  },
}
```

All requests to `/api/*` are forwarded to the Spring Boot backend.

### Changing the Backend URL

To connect to a different backend, edit `vite.config.js`:

```javascript
proxy: {
  "/api": {
    target: "http://your-backend-url:port",
    changeOrigin: true,
  },
}
```

## Components

### App.jsx
Main application wrapper with header displaying "Kafka Sensor Dashboard".

### SensorData.jsx
Fetches and displays sensor data:
- Calls `GET /api/sensors/latest` on mount
- Polls for updates every 5 seconds
- Displays readings grouped by sensor ID
- Shows temperature, location, and timestamp for each reading

## API Integration

The frontend expects the backend to return data in this format:

```json
{
  "sensor-001": [
    {
      "sensorId": "sensor-001",
      "temperature": 23.5,
      "humidity": 65.2,
      "pressure": 1013.25,
      "location": "Building A",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "sensor-002": [...]
}
```

## Related Projects

- [kafka-demo](https://github.com/kristinev7/kafka-demo) - Spring Boot backend with Kafka integration

