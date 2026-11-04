import React, { useEffect, useState } from 'react'
import { API_URL } from '../config'
import './SensorHealthPage.css'

interface ScenarioSensor {
  id: number
  temperature: number
  trust_score: number
}

interface ScenarioState {
  scenario_time: number
  scenario_name: string
  sensors: ScenarioSensor[]
  disagreement: number
}

type ScenarioType = 'normal' | 'sensor_failure' | 'real_incident'

const SensorHealthPage: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('normal')
  const [scenarioState, setScenarioState] = useState<ScenarioState | null>(null)

  useEffect(() => {
    const eventSource = new EventSource(
      `${API_URL}/scenario/stream/${selectedScenario}`
    )

    eventSource.onmessage = (event) => {
      const data: ScenarioState = JSON.parse(event.data)
      setScenarioState(data)
    }

    eventSource.onerror = () => {
      console.error('SSE connection error')
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [selectedScenario])

  const scenarios = [
    {
      id: 'normal' as ScenarioType,
      name: 'Normal Operation',
      icon: '✅',
      description: 'All sensors closely aligned, high trust stability',
      color: '#4CAF50',
    },
    {
      id: 'sensor_failure' as ScenarioType,
      name: 'Sensor Drift/Spike',
      icon: '⚠️',
      description: 'One sensor deviates, trust score decays, sensor isolated',
      color: '#FF9800',
    },
    {
      id: 'real_incident' as ScenarioType,
      name: 'Real Incident',
      icon: '🔥',
      description: 'All sensors rise together, low disagreement, trust remains high',
      color: '#F44336',
    },
  ]

  const getSystemReasoning = () => {
    if (!scenarioState) return ''

    if (selectedScenario === 'normal') {
      return 'All sensors agree within acceptable range. High trust maintained. No action required.'
    } else if (selectedScenario === 'sensor_failure') {
      const failingSensor = scenarioState.sensors.reduce((min, sensor) =>
        sensor.trust_score < min.trust_score ? sensor : min
      )
      return `Sensor ${failingSensor.id + 1} shows abnormal deviation. Trust score declining. System isolating unreliable sensor.`
    } else {
      return 'All sensors show coordinated rise. Low disagreement indicates real incident. Trust maintained. ALERT TRIGGERED.'
    }
  }

  const getSystemDecision = () => {
    if (!scenarioState) return 'ANALYZING'

    if (selectedScenario === 'normal') {
      return 'NORMAL'
    } else if (selectedScenario === 'sensor_failure') {
      const lowestTrust = Math.min(...scenarioState.sensors.map((s) => s.trust_score))
      return lowestTrust < 0.3 ? 'IGNORE SENSOR' : 'MONITORING'
    } else {
      return scenarioState.scenario_time > 25 ? 'ALERT OPERATOR' : 'MONITORING'
    }
  }

  if (!scenarioState) {
    return (
      <div className="sensor-health-page loading">
        <div className="loading-spinner"></div>
        <p>Loading scenario...</p>
      </div>
    )
  }

  return (
    <div className="sensor-health-page">
      <div className="page-header">
        <h1 className="page-title">Sensor Health Scenarios</h1>
        <p className="page-subtitle">
          Teaching mode • Understanding sensor trust evolution
        </p>
      </div>

      <div className="scenario-selector">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            className={`scenario-btn ${selectedScenario === scenario.id ? 'active' : ''}`}
            onClick={() => setSelectedScenario(scenario.id)}
            style={{
              borderColor: selectedScenario === scenario.id ? scenario.color : 'transparent',
            }}
          >
            <div className="scenario-icon">{scenario.icon}</div>
            <div className="scenario-info">
              <div className="scenario-name">{scenario.name}</div>
              <div className="scenario-desc">{scenario.description}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="scenario-grid">
        {/* Sensor Readings Visualization */}
        <div className="card scenario-visualization">
          <div className="card-header">
            <h2 className="card-title">Sensor Readings</h2>
            <div className="scenario-timer">
              Time: {scenarioState.scenario_time}s / 60s
            </div>
          </div>

          <div className="sensor-chart">
            <svg width="100%" height="300" className="readings-chart">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={`grid-${i}`}
                  x1="10%"
                  y1={50 + i * 50}
                  x2="90%"
                  y2={50 + i * 50}
                  stroke="#2a3f5f"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
              ))}

              {/* Sensor readings as bars */}
              {scenarioState.sensors.map((sensor, index) => {
                const minTemp = Math.min(...scenarioState.sensors.map((s) => s.temperature))
                const maxTemp = Math.max(...scenarioState.sensors.map((s) => s.temperature))
                const range = maxTemp - minTemp || 1
                const normalizedValue = ((sensor.temperature - minTemp) / range) * 200
                const barHeight = Math.max(normalizedValue, 10)
                const x = 15 + index * 17

                let color = '#4CAF50'
                if (sensor.trust_score < 0.3) {
                  color = '#F44336'
                } else if (sensor.trust_score < 0.7) {
                  color = '#FF9800'
                }

                return (
                  <g key={sensor.id}>
                    <rect
                      x={`${x}%`}
                      y={250 - barHeight}
                      width="12%"
                      height={barHeight}
                      fill={color}
                      opacity={0.8}
                    />
                    <text
                      x={`${x + 6}%`}
                      y="270"
                      textAnchor="middle"
                      fill="#8a9ba8"
                      fontSize="12"
                    >
                      S{sensor.id + 1}
                    </text>
                    <text
                      x={`${x + 6}%`}
                      y={240 - barHeight}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="12"
                      fontWeight="600"
                    >
                      {sensor.temperature.toFixed(1)}°C
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          <div className="disagreement-indicator">
            <span className="indicator-label">Sensor Disagreement:</span>
            <div className="disagreement-bar-container">
              <div
                className="disagreement-bar"
                style={{
                  width: `${Math.min((scenarioState.disagreement / 20) * 100, 100)}%`,
                  backgroundColor:
                    scenarioState.disagreement < 3
                      ? '#4CAF50'
                      : scenarioState.disagreement < 10
                      ? '#FF9800'
                      : '#F44336',
                }}
              ></div>
            </div>
            <span className="indicator-value">{scenarioState.disagreement.toFixed(2)}°C</span>
          </div>
        </div>

        {/* Trust Score Evolution */}
        <div className="card trust-evolution">
          <div className="card-header">
            <h2 className="card-title">Trust Score Evolution</h2>
          </div>

          <div className="trust-list">
            {scenarioState.sensors.map((sensor) => (
              <div key={sensor.id} className="trust-item">
                <div className="trust-item-header">
                  <span className="trust-label">Sensor {sensor.id + 1}</span>
                  <span className="trust-percentage">
                    {(sensor.trust_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="trust-bar-container">
                  <div
                    className="trust-bar"
                    style={{
                      width: `${sensor.trust_score * 100}%`,
                      backgroundColor:
                        sensor.trust_score > 0.7
                          ? '#4CAF50'
                          : sensor.trust_score > 0.3
                          ? '#FF9800'
                          : '#F44336',
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="trust-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#4CAF50' }}></div>
              <span>Trusted (&gt;70%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#FF9800' }}></div>
              <span>Degraded (30-70%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#F44336' }}></div>
              <span>Ignored (&lt;30%)</span>
            </div>
          </div>
        </div>

        {/* System Reasoning */}
        <div className="card system-reasoning">
          <div className="card-header">
            <h2 className="card-title">System Reasoning</h2>
          </div>

          <div className="reasoning-content">
            <div className="reasoning-text">{getSystemReasoning()}</div>

            <div className="decision-box">
              <span className="decision-label">System Decision:</span>
              <span
                className="decision-badge"
                style={{
                  color:
                    getSystemDecision() === 'NORMAL'
                      ? '#4CAF50'
                      : getSystemDecision() === 'ALERT OPERATOR'
                      ? '#F44336'
                      : '#FF9800',
                  borderColor:
                    getSystemDecision() === 'NORMAL'
                      ? '#4CAF50'
                      : getSystemDecision() === 'ALERT OPERATOR'
                      ? '#F44336'
                      : '#FF9800',
                }}
              >
                {getSystemDecision()}
              </span>
            </div>
          </div>
        </div>

        {/* Scenario Explanation */}
        <div className="card scenario-explanation">
          <div className="card-header">
            <h2 className="card-title">What This Demonstrates</h2>
          </div>

          <div className="explanation-content">
            {selectedScenario === 'normal' && (
              <>
                <div className="explanation-point">
                  <span className="point-icon">📈</span>
                  <p>
                    <strong>Baseline Behavior:</strong> When all sensors agree within normal
                    variance, trust scores remain high and stable.
                  </p>
                </div>
                <div className="explanation-point">
                  <span className="point-icon">🎯</span>
                  <p>
                    <strong>Low Disagreement:</strong> Sensor readings cluster tightly,
                    indicating reliable consensus.
                  </p>
                </div>
                <div className="explanation-point">
                  <span className="point-icon">✅</span>
                  <p>
                    <strong>System Confidence:</strong> High trust enables confident plant state
                    estimation without false alerts.
                  </p>
                </div>
              </>
            )}

            {selectedScenario === 'sensor_failure' && (
              <>
                <div className="explanation-point">
                  <span className="point-icon">📉</span>
                  <p>
                    <strong>Drift Detection:</strong> One sensor diverges from consensus. Trust
                    score automatically decays based on deviation magnitude.
                  </p>
                </div>
                <div className="explanation-point">
                  <span className="point-icon">🔍</span>
                  <p>
                    <strong>Isolation Logic:</strong> When trust drops below 30%, the sensor is
                    ignored for decision-making, preventing false alarms.
                  </p>
                </div>
                <div className="explanation-point">
                  <span className="point-icon">🛡️</span>
                  <p>
                    <strong>System Protection:</strong> Remaining high-trust sensors maintain
                    accurate plant state estimation.
                  </p>
                </div>
              </>
            )}

            {selectedScenario === 'real_incident' && (
              <>
                <div className="explanation-point">
                  <span className="point-icon">🔥</span>
                  <p>
                    <strong>Consensus Detection:</strong> All sensors rise together with low
                    disagreement indicates a real process change, not sensor failure.
                  </p>
                </div>
                <div className="explanation-point">
                  <span className="point-icon">🚨</span>
                  <p>
                    <strong>Maintained Trust:</strong> Trust scores remain high because sensors
                    agree on the rising trend, triggering legitimate alert.
                  </p>
                </div>
                <div className="explanation-point">
                  <span className="point-icon">⚡</span>
                  <p>
                    <strong>Critical Distinction:</strong> System distinguishes between sensor
                    malfunction (isolated) and actual incident (consensus).
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SensorHealthPage
