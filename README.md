# Chemical Plant Digital Twin

A realistic industrial monitoring digital twin system for chemical plant operations with sensor trust evaluation.

## 🎯 Project Overview

This system simulates a mid-scale chemical processing plant with 5 temperature sensors and implements an intelligent sensor trust evaluation system to distinguish between sensor failures and real incidents, reducing false alarms while maintaining safety.

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Three.js
- **Backend**: Python + Flask
- **Streaming**: Server-Sent Events (SSE)
- **3D Graphics**: Three.js with OrbitControls
- **Charts**: Recharts

### Two Separate Simulations

1. **Live Simulation** (Primary Reality)
   - Represents actual plant operation
   - Continuous sensor readings with realistic noise, drift, spikes
   - Used by: Live Operations, Digital Twin, Real-World Impact pages
   - Never resets automatically

2. **Scenario Simulation** (Teaching Mode)
   - Isolated educational scenarios
   - Normal Operation / Sensor Failure / Real Incident
   - Used ONLY by Sensor Health page
   - No shared state with live simulation

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend will start on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will start on `http://localhost:3000`

## 🚀 Running the System

1. Start the backend server:
   ```bash
   cd backend
   python app.py
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open browser to `http://localhost:3000`

## 📊 System Features

### Live Operations Page
- Interactive 3D chemical plant model
- Real-time sensor monitoring
- Clickable sensors showing live data, trust scores, and mini-trends
- System decision panel with trust score visualization
- Operator override capability with mandatory logging

### Sensor Health Page (Scenarios)
- Three animated teaching scenarios:
  - **Normal Operation**: All sensors agree
  - **Sensor Failure**: One sensor drifts/spikes
  - **Real Incident**: All sensors rise together
- Real-time trust score evolution
- Visual system reasoning explanations

### Digital Twin Page
- Visual pipeline: Physical Plant → Raw Signals → Trust Evaluation → Digital Twin → Decision
- Animated data flow visualization
- Stage-by-stage breakdown with live data
- Key insights on how digital twin differs from raw data

### Real-World Impact Page
- 4 real industrial incidents with images
- Detailed breakdown of what went wrong
- Specific sensor issues that caused false alarms
- Financial consequences
- Clear explanation of how sensor trust would have prevented each incident

## 🔬 Sensor Trust Algorithm

### Trust Score Calculation
- **Agreement** (deviation < 2°C): Trust increases (+0.01 per second)
- **Moderate disagreement** (2-5°C): Slow decay (×0.99 per second)
- **High disagreement** (>5°C): Fast decay (×0.90 per second)
- **Missing data**: Trust decay (×0.95 per second)

### Decision Logic
- **NORMAL**: High-trust consensus, normal temperatures
- **IGNORE SENSOR**: Single sensor trust < 0.3 with high disagreement
- **ALERT OPERATOR**: High temperature with consensus OR high disagreement with multiple low-trust sensors

### Sensor Behavior
- Base temperature: ~180°C
- Noise: ±0.5°C normal random
- Drift: Gradual deviation when failing
- Spikes: Rare sudden jumps (0.5% chance)
- Dropouts: Temporary signal loss (1% chance, 2-5 seconds)

## 📁 Project Structure

```
chemical_plant_digital_twin/
├── backend/
│   ├── app.py                 # Flask server with SSE streaming
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LivePage.tsx          # Live operations with 3D
│   │   │   ├── SensorHealthPage.tsx  # Scenario teaching
│   │   │   ├── DigitalTwinPage.tsx   # Pipeline visualization
│   │   │   └── RealWorldImpactPage.tsx
│   │   ├── App.tsx            # Main app with routing
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🎮 User Interactions

### Live Page
- Click sensors in 3D scene to view detailed information
- View real-time trust scores and mini-trends
- Use operator override with mandatory reason logging
- Observe system decisions updating live

### Sensor Health Page
- Switch between 3 scenarios using top selector
- Watch animated sensor readings and trust evolution
- Read system reasoning for each scenario
- Understand differences between false alarms and real incidents

### Digital Twin Page
- Observe data flowing through pipeline stages
- See real-time composition of digital twin state
- Understand weighted averaging based on trust
- Learn key differences between raw data and digital twin

### Real-World Impact Page
- Read actual industrial incident case studies
- Understand financial and operational consequences
- See clear explanations of how sensor trust prevents each incident

## 🔧 API Endpoints

### Live Simulation
- `GET /live/stream` - SSE stream of live simulation data
- `GET /live/state` - Current live state (REST fallback)
- `POST /live/override` - Set operator override decision

### Scenario Simulation
- `GET /scenario/stream/<scenario_name>` - SSE stream for scenario
- `GET /scenario/state/<scenario_name>` - Current scenario state

### Historical Data
- `GET /historical/baseline` - Last 7 days of baseline data

### System Health
- `GET /health` - System health check

## 📈 Data Flow

```
Physical Plant → Sensors → Backend Simulation → SSE Stream → Frontend → 3D Visualization
                                    ↓
                              Trust Evaluation
                                    ↓
                              Digital Twin State
                                    ↓
                              System Decision
```

## 🎨 Design Principles

1. **Industrial-Grade UI**: Dark theme, clear information hierarchy
2. **Live Data**: No static placeholders, everything updates in real-time
3. **Visual Communication**: Show, don't tell - especially on Digital Twin page
4. **Realistic Behavior**: Subtle sensor failures, not obvious
5. **Human Control**: Operators always remain in control with override capability

## 🚨 Important Notes

- **Do NOT use Docker** - This system is designed to run directly with Python and Node.js
- **Simulations are separate** - Live and scenario simulations never share state
- **Real-time updates** - All pages show live or animated data, never static content
- **Trust is dynamic** - Sensor trust continuously evolves based on behavior
- **Human-centered** - System reduces false alarms but never blocks alerts

## 📝 License

This is a demonstration system for industrial digital twin concepts.

## 🤝 Support

For questions or issues, refer to the inline code documentation or system architecture details above.
