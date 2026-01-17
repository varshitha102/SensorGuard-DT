# 🚀 QUICK START GUIDE

## Chemical Plant Digital Twin - Complete Setup Instructions

---

## 📋 Prerequisites

Before you begin, ensure you have:

### Required Software
1. **Python 3.8 or higher**
   - Download: https://www.python.org/downloads/
   - Verify: `python3 --version` or `python --version`

2. **Node.js 16 or higher**
   - Download: https://nodejs.org/
   - Verify: `node --version`

3. **npm** (comes with Node.js)
   - Verify: `npm --version`

---

## 📦 Installation

### Step 1: Extract the ZIP file
Extract `chemical_plant_digital_twin.zip` to your desired location.

### Step 2: Automated Setup (Recommended)

#### **Windows:**
```bash
cd chemical_plant_digital_twin
start.bat
```

#### **Linux/Mac:**
```bash
cd chemical_plant_digital_twin
chmod +x start.sh
./start.sh
```

The automated scripts will:
- Install all Python dependencies
- Install all Node.js dependencies
- Start the backend server
- Start the frontend development server
- Open the system in your browser

---

## 🔧 Manual Setup (Alternative)

If the automated scripts don't work, follow these manual steps:

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python3 -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python app.py
```

Backend will start on: **http://localhost:5000**

### Frontend Setup (Open New Terminal)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start on: **http://localhost:3000**

---

## 🌐 Accessing the System

Once both servers are running:

1. Open your web browser
2. Navigate to: **http://localhost:3000**
3. You should see the Chemical Plant Digital Twin interface

---

## 📊 System Pages

### 1. **Live Operations** (Default Page)
- Interactive 3D chemical plant
- Click sensors to view detailed information
- Real-time trust scores and system decisions
- Operator override controls

### 2. **Sensor Health** (Scenario Teaching)
- Switch between 3 scenarios:
  - Normal Operation
  - Sensor Drift/Spike
  - Real Incident
- Watch trust scores evolve in real-time
- Understand system reasoning

### 3. **Digital Twin** (Pipeline Visualization)
- Visual data flow from sensors to decisions
- See how trust evaluation works
- Understand weighted averaging logic
- Key insights about digital twins

### 4. **Real-World Impact**
- 4 real industrial incident case studies
- Financial consequences of false alarms
- How sensor trust prevents these incidents
- Comparison: False Alarm vs Real Incident

---

## 🔍 Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'flask'`
**Solution:** 
```bash
cd backend
pip install -r requirements.txt
```

**Problem:** `Port 5000 already in use`
**Solution:** 
- Close other applications using port 5000
- Or edit `backend/app.py` and change port number in the last line

### Frontend Issues

**Problem:** `npm: command not found`
**Solution:** 
- Install Node.js from https://nodejs.org/

**Problem:** `Port 3000 already in use`
**Solution:**
- The system will automatically use the next available port
- Or edit `frontend/vite.config.ts` and change the port number

**Problem:** `Failed to fetch` errors in browser console
**Solution:**
- Ensure backend is running on port 5000
- Check browser console for specific error messages
- Try clearing browser cache

### Connection Issues

**Problem:** No live data appearing
**Solution:**
1. Verify backend is running: Open http://localhost:5000/health
2. Check browser console for errors (F12)
3. Restart both backend and frontend

---

## 🛑 Stopping the System

### If using automated scripts:
- Press `Ctrl + C` in the terminal
- May need to close terminal windows manually on Windows

### If using manual setup:
- Press `Ctrl + C` in both terminal windows (backend and frontend)

---

## 📁 Project Structure

```
chemical_plant_digital_twin/
├── backend/
│   ├── app.py                    # Flask server with simulations
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/               # All 4 pages
│   │   ├── App.tsx              # Main application
│   │   └── main.tsx             # Entry point
│   ├── package.json             # Node.js dependencies
│   └── vite.config.ts           # Vite configuration
├── README.md                    # Detailed documentation
├── QUICK_START.md              # This file
├── start.sh                     # Linux/Mac startup script
└── start.bat                    # Windows startup script
```

---

## 🎯 Key Features

### Real-Time Simulation
- 5 temperature sensors with realistic behavior
- Continuous noise, drift, spikes, and dropouts
- Updates every simulated second

### Two Separate Simulations
1. **Live Simulation**: Continuous plant operation (used by Live, Digital Twin, Impact pages)
2. **Scenario Simulation**: Teaching scenarios (used only by Sensor Health page)

### Sensor Trust System
- Dynamic trust scores (0-100%)
- Automatic sensor isolation when trust < 30%
- Distinguishes sensor failures from real incidents
- Human override always available

### Interactive 3D
- Three.js chemical plant model
- Clickable sensors
- Camera controls (orbit, zoom)
- Color-coded by trust status

---

## 💡 Usage Tips

1. **Start with Live Operations** to see the plant in real-time
2. **Click sensors** in 3D view for detailed information
3. **Visit Sensor Health** to understand how trust works
4. **Check Digital Twin** to see the data pipeline
5. **Read Real-World Impact** to understand business value

### Understanding Trust Scores
- 🟢 **Green (>70%)**: Trusted sensor
- 🟡 **Orange (30-70%)**: Degraded trust
- 🔴 **Red (<30%)**: Ignored sensor

### System Decisions
- **NORMAL**: Everything operating correctly
- **IGNORE SENSOR**: One sensor failing, isolated automatically
- **ALERT OPERATOR**: Real issue detected, human intervention needed

---

## 📞 Support

### Common Questions

**Q: Is this connected to a real chemical plant?**
A: No, this is a simulation system for demonstration purposes.

**Q: Can I modify the sensors or simulation?**
A: Yes! Edit `backend/app.py` to adjust sensor count, behavior, or trust algorithm.

**Q: Why are there two separate simulations?**
A: Live simulation represents "reality" while scenario simulation is for teaching. They never share state.

**Q: Can I deploy this to production?**
A: This is a demonstration system. For production, you'd need authentication, database persistence, and security hardening.

---

## 🎓 Learning Path

1. **Day 1**: Explore all 4 pages, understand the interface
2. **Day 2**: Watch sensor trust evolve in Sensor Health scenarios
3. **Day 3**: Deep dive into Digital Twin pipeline
4. **Day 4**: Study Real-World Impact case studies
5. **Day 5**: Experiment with operator overrides and edge cases

---

## ✅ System Health Check

After starting the system, verify everything is working:

1. **Backend Health**: http://localhost:5000/health
   - Should return: `{"status": "healthy", ...}`

2. **Frontend Loading**: http://localhost:3000
   - Should show navigation and "System Active" indicator

3. **Live Data Flowing**:
   - Sensor values should change every second
   - Trust scores should update dynamically
   - 3D sensor colors should reflect trust status

4. **Scenario Animation**:
   - Switch to Sensor Health page
   - Change scenarios - charts should animate
   - Timer should count 0-60 seconds

---

## 🚀 You're Ready!

If you can see live sensor data updating and the 3D plant is interactive, you're all set!

**Enjoy exploring the Chemical Plant Digital Twin System!**

For detailed documentation, see `README.md`
