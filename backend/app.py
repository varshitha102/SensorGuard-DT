"""
Chemical Plant Digital Twin - Flask Backend
Implements separate live and scenario simulations with SSE streaming
"""

from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import json
import time
import threading
import numpy as np
from datetime import datetime, timedelta
import queue

app = Flask(__name__)
CORS(app)

# ============================================================================
# SIMULATION STATE MANAGEMENT
# ============================================================================

class SensorState:
    """Individual sensor state with realistic behavior"""
    def __init__(self, sensor_id, base_temp=180.0):
        self.id = sensor_id
        self.base_temp = base_temp
        self.current_temp = base_temp
        self.trust_score = 1.0
        self.status = "Healthy"
        self.maintenance_state = "Normal"
        self.is_failing = False
        self.failure_start_time = None
        self.drift_rate = 0.0
        self.noise_level = 0.5
        self.last_update = time.time()
        self.history = []  # Last 60 seconds
        self.dropout_until = 0
        
    def update(self, current_time):
        """Update sensor reading with realistic behavior"""
        # Check for dropout
        if current_time < self.dropout_until:
            return None
            
        # Random dropout (1% chance)
        if np.random.random() < 0.01:
            self.dropout_until = current_time + np.random.uniform(2, 5)
            return None
        
        # Base temperature with slow natural variation
        natural_variation = np.sin(current_time / 100) * 2.0
        
        # Noise
        noise = np.random.normal(0, self.noise_level)
        
        # Drift (if failing)
        if self.is_failing:
            self.drift_rate += np.random.uniform(-0.02, 0.05)
            self.current_temp += self.drift_rate
        else:
            # Slow return to baseline
            self.current_temp = self.current_temp * 0.95 + (self.base_temp + natural_variation) * 0.05
        
        # Rare spike (0.5% chance)
        if np.random.random() < 0.005:
            noise += np.random.uniform(5, 15) * np.random.choice([-1, 1])
        
        self.current_temp += noise
        
        # Update history (keep last 60 readings)
        self.history.append({
            'time': current_time,
            'value': self.current_temp
        })
        if len(self.history) > 60:
            self.history.pop(0)
        
        self.last_update = current_time
        return self.current_temp


class LiveSimulation:
    """Primary simulation - represents actual plant operation"""
    def __init__(self):
        self.sensors = [SensorState(i, base_temp=180.0 + np.random.uniform(-2, 2)) for i in range(5)]
        self.start_time = time.time()
        self.simulation_time = 0
        self.plant_state_estimate = 180.0
        self.disagreement_level = 0.0
        self.system_decision = "NORMAL"
        self.operator_override = None
        self.lock = threading.Lock()
        
        # Historical baseline (365 days, hourly readings)
        self.generate_historical_baseline()
        
    def generate_historical_baseline(self):
        """Generate 365 days of synthetic historical data"""
        hours = 365 * 24
        self.historical_baseline = []
        
        for h in range(hours):
            # Seasonal variation
            seasonal = 5.0 * np.sin(2 * np.pi * h / (365 * 24))
            # Daily variation
            daily = 3.0 * np.sin(2 * np.pi * h / 24)
            # Base temperature
            base = 180.0 + seasonal + daily + np.random.normal(0, 1)
            
            self.historical_baseline.append({
                'timestamp': h,
                'temperature': base
            })
    
    def update(self):
        """Update simulation state - called every simulated second"""
        with self.lock:
            self.simulation_time = time.time() - self.start_time
            
            # Update all sensors
            readings = []
            for sensor in self.sensors:
                value = sensor.update(self.simulation_time)
                if value is not None:
                    readings.append(value)
            
            # Calculate plant state estimate
            if len(readings) >= 3:
                # Use weighted average based on trust scores
                trusted_readings = []
                weights = []
                for i, sensor in enumerate(self.sensors):
                    if i < len(readings) and sensor.trust_score > 0.3:
                        trusted_readings.append(readings[i] if i < len(readings) else None)
                        weights.append(sensor.trust_score)
                
                if trusted_readings and weights:
                    valid_readings = [r for r in trusted_readings if r is not None]
                    if valid_readings:
                        self.plant_state_estimate = np.average(valid_readings, weights=weights[:len(valid_readings)])
            
            # Calculate disagreement
            if len(readings) >= 2:
                self.disagreement_level = np.std(readings)
            else:
                self.disagreement_level = 0.0
            
            # Update trust scores
            self.update_trust_scores(readings)
            
            # Make system decision
            self.make_decision()
    
    def update_trust_scores(self, readings):
        """Update trust scores based on sensor behavior"""
        if len(readings) < 2:
            return
        
        median_reading = np.median(readings)
        
        for i, sensor in enumerate(self.sensors):
            if i >= len(readings):
                # Missing data - decay trust
                sensor.trust_score *= 0.95
                sensor.status = "Unstable"
                continue
            
            # Calculate deviation from consensus
            deviation = abs(readings[i] - median_reading)
            
            # Update trust score
            if deviation < 2.0:
                # Good agreement - increase trust
                sensor.trust_score = min(1.0, sensor.trust_score + 0.01)
                sensor.status = "Healthy"
            elif deviation < 5.0:
                # Moderate disagreement - slow decay
                sensor.trust_score *= 0.99
                sensor.status = "Healthy"
            else:
                # High disagreement - fast decay
                sensor.trust_score *= 0.90
                sensor.status = "Unstable"
            
            # Check if sensor should be ignored
            if sensor.trust_score < 0.3:
                sensor.status = "Ignored"
    
    def make_decision(self):
        """Make system decision based on current state"""
        if self.operator_override:
            self.system_decision = self.operator_override
            return
        
        # Check for high disagreement with high trust sensors
        high_trust_sensors = [s for s in self.sensors if s.trust_score > 0.7]
        
        if len(high_trust_sensors) >= 3 and self.disagreement_level < 3.0:
            # Good consensus
            if self.plant_state_estimate > 200.0:
                self.system_decision = "ALERT OPERATOR"
            else:
                self.system_decision = "NORMAL"
        elif self.disagreement_level > 10.0:
            # High disagreement - likely sensor failure
            low_trust_sensors = [s for s in self.sensors if s.trust_score < 0.3]
            if len(low_trust_sensors) == 1:
                self.system_decision = "IGNORE SENSOR"
            else:
                self.system_decision = "ALERT OPERATOR"
        else:
            self.system_decision = "NORMAL"
    
    def get_state(self):
        """Get current simulation state"""
        with self.lock:
            return {
                'simulation_time': self.simulation_time,
                'sensors': [
                    {
                        'id': s.id,
                        'temperature': s.current_temp,
                        'trust_score': s.trust_score,
                        'status': s.status,
                        'maintenance_state': s.maintenance_state,
                        'history': s.history[-30:]  # Last 30 seconds
                    }
                    for s in self.sensors
                ],
                'plant_state_estimate': self.plant_state_estimate,
                'disagreement_level': self.disagreement_level,
                'system_decision': self.system_decision
            }


class ScenarioSimulation:
    """Isolated teaching scenarios - never uses live data"""
    def __init__(self):
        self.scenarios = {
            'normal': self.create_normal_scenario(),
            'sensor_failure': self.create_sensor_failure_scenario(),
            'real_incident': self.create_real_incident_scenario()
        }
        self.current_scenario = 'normal'
        self.scenario_time = 0
        self.lock = threading.Lock()
    
    def create_normal_scenario(self):
        """Normal operation - all sensors agree"""
        return {
            'duration': 60,
            'sensors': [
                {'base': 180.0, 'noise': 0.5, 'drift': 0.0, 'spike_time': None}
                for _ in range(5)
            ]
        }
    
    def create_sensor_failure_scenario(self):
        """One sensor drifts/spikes"""
        sensors = [
            {'base': 180.0, 'noise': 0.5, 'drift': 0.0, 'spike_time': None}
            for _ in range(5)
        ]
        # Sensor 2 fails
        sensors[2] = {'base': 180.0, 'noise': 0.5, 'drift': 0.3, 'spike_time': 20}
        return {
            'duration': 60,
            'sensors': sensors
        }
    
    def create_real_incident_scenario(self):
        """Real incident - all sensors rise together"""
        return {
            'duration': 60,
            'sensors': [
                {'base': 180.0, 'noise': 0.5, 'drift': 0.0, 'spike_time': None, 'incident_start': 20, 'rise_rate': 0.5}
                for _ in range(5)
            ]
        }
    
    def update(self, scenario_name):
        """Update scenario simulation"""
        with self.lock:
            self.current_scenario = scenario_name
            self.scenario_time += 1
            
            scenario = self.scenarios[scenario_name]
            if self.scenario_time >= scenario['duration']:
                self.scenario_time = 0  # Loop scenario
    
    def get_state(self, scenario_name):
        """Get current scenario state"""
        with self.lock:
            scenario = self.scenarios[scenario_name]
            sensor_data = []
            
            for i, sensor_config in enumerate(scenario['sensors']):
                # Base temperature
                temp = sensor_config['base']
                
                # Add noise
                temp += np.random.normal(0, sensor_config['noise'])
                
                # Add drift
                if self.scenario_time > 10:
                    temp += sensor_config['drift'] * (self.scenario_time - 10)
                
                # Add spike
                if sensor_config['spike_time'] and abs(self.scenario_time - sensor_config['spike_time']) < 3:
                    temp += 20.0
                
                # Real incident - all rise together
                if 'incident_start' in sensor_config and self.scenario_time > sensor_config['incident_start']:
                    temp += sensor_config['rise_rate'] * (self.scenario_time - sensor_config['incident_start'])
                
                # Calculate trust score based on deviation
                if len(sensor_data) > 0:
                    median = np.median([s['temperature'] for s in sensor_data])
                    deviation = abs(temp - median)
                    trust = max(0.1, 1.0 - deviation / 20.0)
                else:
                    trust = 1.0
                
                sensor_data.append({
                    'id': i,
                    'temperature': temp,
                    'trust_score': trust
                })
            
            # Recalculate trust scores with all data
            temps = [s['temperature'] for s in sensor_data]
            median_temp = np.median(temps)
            
            for sensor in sensor_data:
                deviation = abs(sensor['temperature'] - median_temp)
                if deviation < 2.0:
                    sensor['trust_score'] = min(1.0, sensor['trust_score'] + 0.05)
                elif deviation > 10.0:
                    sensor['trust_score'] = max(0.1, sensor['trust_score'] * 0.8)
            
            return {
                'scenario_time': self.scenario_time,
                'scenario_name': scenario_name,
                'sensors': sensor_data,
                'disagreement': np.std(temps)
            }


# Global simulation instances
live_sim = LiveSimulation()
scenario_sim = ScenarioSimulation()

# Simulation update thread
def simulation_loop():
    """Main simulation loop - updates every second"""
    while True:
        live_sim.update()
        time.sleep(1.0)

# Start simulation thread
sim_thread = threading.Thread(target=simulation_loop, daemon=True)
sim_thread.start()


# ============================================================================
# API ROUTES
# ============================================================================

@app.route('/live/stream')
def live_stream():
    """SSE stream for live simulation data"""
    def generate():
        while True:
            state = live_sim.get_state()
            yield f"data: {json.dumps(state)}\n\n"
            time.sleep(1.0)
    
    return Response(generate(), mimetype='text/event-stream')


@app.route('/live/state')
def live_state():
    """Get current live simulation state (REST fallback)"""
    return jsonify(live_sim.get_state())


@app.route('/live/override', methods=['POST'])
def live_override():
    """Set operator override"""
    data = request.json
    live_sim.operator_override = data.get('decision')
    return jsonify({'success': True})


@app.route('/scenario/stream/<scenario_name>')
def scenario_stream(scenario_name):
    """SSE stream for scenario simulation"""
    def generate():
        while True:
            scenario_sim.update(scenario_name)
            state = scenario_sim.get_state(scenario_name)
            yield f"data: {json.dumps(state)}\n\n"
            time.sleep(1.0)
    
    return Response(generate(), mimetype='text/event-stream')


@app.route('/scenario/state/<scenario_name>')
def scenario_state(scenario_name):
    """Get current scenario state (REST fallback)"""
    return jsonify(scenario_sim.get_state(scenario_name))


@app.route('/historical/baseline')
def historical_baseline():
    """Get historical baseline data"""
    return jsonify(live_sim.historical_baseline[-168:])  # Last 7 days


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'simulation_time': live_sim.simulation_time,
        'timestamp': datetime.now().isoformat()
    })


if __name__ == '__main__':
    print("=" * 60)
    print("Chemical Plant Digital Twin - Backend Server")
    print("=" * 60)
    print("Starting simulations...")
    print("Live simulation: Running")
    print("Scenario simulation: Ready")
    print("Server starting on http://localhost:5000")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
