import React, { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { API_URL } from '../config'
import './DigitalTwinPage.css'

interface LiveState {
  simulation_time: number
  sensors: Array<{
    id: number
    temperature: number
    trust_score: number
    status: string
  }>
  plant_state_estimate: number
  disagreement_level: number
  system_decision: string
}

const DigitalTwinPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [liveState, setLiveState] = useState<LiveState | null>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    animationId: number | null
  } | null>(null)

  // Initialize pipeline visualization
  useEffect(() => {
    if (!canvasRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0e1a)

    const camera = new THREE.PerspectiveCamera(
      60,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 5, 15)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    })
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    scene.add(directionalLight)

    // Pipeline stages
    const stagePositions = [
      { x: -8, y: 0, z: 0, label: 'Physical Plant' },
      { x: -4, y: 0, z: 0, label: 'Raw Signals' },
      { x: 0, y: 0, z: 0, label: 'Trust Evaluation' },
      { x: 4, y: 0, z: 0, label: 'Digital Twin' },
      { x: 8, y: 0, z: 0, label: 'Decision' },
    ]

    stagePositions.forEach((pos, index) => {
      // Stage box
      const geometry = new THREE.BoxGeometry(2.5, 2, 1)
      const material = new THREE.MeshStandardMaterial({
        color: 0x2a5f8f,
        metalness: 0.5,
        roughness: 0.5,
        emissive: 0x1a4f7f,
        emissiveIntensity: 0.2,
      })
      const box = new THREE.Mesh(geometry, material)
      box.position.set(pos.x, pos.y, pos.z)
      scene.add(box)

      // Connection arrow (if not last)
      if (index < stagePositions.length - 1) {
        const arrowGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8)
        const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x4a9eff })
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)
        arrow.rotation.z = Math.PI / 2
        arrow.position.set(pos.x + 1.75, pos.y, pos.z)
        scene.add(arrow)

        // Arrow head
        const coneGeometry = new THREE.ConeGeometry(0.15, 0.3, 8)
        const cone = new THREE.Mesh(coneGeometry, arrowMaterial)
        cone.rotation.z = -Math.PI / 2
        cone.position.set(pos.x + 2.4, pos.y, pos.z)
        scene.add(cone)
      }

      // Animated particles flowing through pipeline
      if (index < stagePositions.length - 1) {
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8)
        const particleMaterial = new THREE.MeshBasicMaterial({
          color: 0x4a9eff,
        })
        const particle = new THREE.Mesh(particleGeometry, particleMaterial)
        particle.position.set(pos.x + 1.25, pos.y, pos.z)
        particle.userData = { startX: pos.x + 1.25, endX: pos.x + 2.25, speed: 0.02 }
        scene.add(particle)
      }
    })

    const animate = () => {
      const animationId = requestAnimationFrame(animate)
      sceneRef.current!.animationId = animationId

      // Animate particles
      scene.children.forEach((child) => {
        if (child.userData.startX !== undefined) {
          child.position.x += child.userData.speed
          if (child.position.x > child.userData.endX) {
            child.position.x = child.userData.startX
          }
        }
      })

      renderer.render(scene, camera)
    }

    sceneRef.current = { scene, camera, renderer, animationId: null }
    animate()

    const handleResize = () => {
      if (!canvasRef.current) return
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (sceneRef.current?.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId)
      }
      renderer.dispose()
    }
  }, [])

  // Connect to live stream
  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/live/stream`)

    eventSource.onmessage = (event) => {
      const data: LiveState = JSON.parse(event.data)
      setLiveState(data)
    }

    eventSource.onerror = () => {
      console.error('SSE connection error')
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  if (!liveState) {
    return (
      <div className="digital-twin-page loading">
        <div className="loading-spinner"></div>
        <p>Connecting to digital twin...</p>
      </div>
    )
  }

  const trustedSensors = liveState.sensors.filter((s) => s.trust_score > 0.3)
  const ignoredSensors = liveState.sensors.filter((s) => s.trust_score <= 0.3)

  return (
    <div className="digital-twin-page">
      <div className="page-header">
        <h1 className="page-title">Digital Twin Pipeline</h1>
        <p className="page-subtitle">
          Visualizing the transformation from physical sensors to system decisions
        </p>
      </div>

      {/* Pipeline Visualization */}
      <div className="card pipeline-card">
        <canvas ref={canvasRef} className="pipeline-canvas"></canvas>
        <div className="pipeline-labels">
          <div className="pipeline-label">Physical Plant</div>
          <div className="pipeline-label">Raw Signals</div>
          <div className="pipeline-label">Trust Evaluation</div>
          <div className="pipeline-label">Digital Twin</div>
          <div className="pipeline-label">Decision</div>
        </div>
      </div>

      {/* Pipeline Stages Explanation */}
      <div className="pipeline-grid">
        {/* Stage 1: Physical Plant */}
        <div className="card stage-card">
          <div className="stage-header">
            <span className="stage-number">1</span>
            <h3 className="stage-title">Physical Plant</h3>
          </div>
          <div className="stage-content">
            <div className="stage-visual">
              <div className="plant-icon">⚗️</div>
              <div className="sensor-dots">
                {liveState.sensors.map((sensor) => (
                  <div key={sensor.id} className="sensor-dot" title={`Sensor ${sensor.id + 1}`}></div>
                ))}
              </div>
            </div>
            <p className="stage-description">
              Real chemical plant with {liveState.sensors.length} temperature sensors monitoring
              different equipment locations.
            </p>
          </div>
        </div>

        {/* Stage 2: Raw Sensor Signals */}
        <div className="card stage-card">
          <div className="stage-header">
            <span className="stage-number">2</span>
            <h3 className="stage-title">Raw Sensor Signals</h3>
          </div>
          <div className="stage-content">
            <div className="signal-list">
              {liveState.sensors.map((sensor) => (
                <div key={sensor.id} className="signal-item">
                  <span className="signal-label">S{sensor.id + 1}</span>
                  <span className="signal-value">{sensor.temperature.toFixed(1)}°C</span>
                  <div className="signal-bar">
                    <div
                      className="signal-fill"
                      style={{
                        width: `${((sensor.temperature - 170) / 30) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="stage-description">
              Unfiltered readings with noise, drift, spikes, and occasional dropouts.
            </p>
          </div>
        </div>

        {/* Stage 3: Trust Evaluation */}
        <div className="card stage-card stage-highlight">
          <div className="stage-header">
            <span className="stage-number">3</span>
            <h3 className="stage-title">Trust Evaluation</h3>
          </div>
          <div className="stage-content">
            <div className="trust-evaluation">
              <div className="evaluation-metric">
                <span className="metric-label">Sensor Agreement</span>
                <div className="metric-bar">
                  <div
                    className="metric-fill"
                    style={{
                      width: `${Math.max(0, 100 - liveState.disagreement_level * 5)}%`,
                      backgroundColor:
                        liveState.disagreement_level < 3
                          ? '#4CAF50'
                          : liveState.disagreement_level < 10
                          ? '#FF9800'
                          : '#F44336',
                    }}
                  ></div>
                </div>
              </div>

              <div className="trust-scores">
                {liveState.sensors.map((sensor) => (
                  <div key={sensor.id} className="trust-score-item">
                    <span>S{sensor.id + 1}</span>
                    <div className="trust-mini-bar">
                      <div
                        className="trust-mini-fill"
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
            </div>
            <p className="stage-description">
              Each sensor continuously evaluated for deviation from consensus. Trust decays with
              disagreement, recovers with agreement.
            </p>
          </div>
        </div>

        {/* Stage 4: Digital Twin State */}
        <div className="card stage-card stage-highlight">
          <div className="stage-header">
            <span className="stage-number">4</span>
            <h3 className="stage-title">Digital Twin State</h3>
          </div>
          <div className="stage-content">
            <div className="twin-state">
              <div className="twin-value">
                <div className="twin-temp">{liveState.plant_state_estimate.toFixed(1)}°C</div>
                <div className="twin-label">Estimated Plant Temperature</div>
              </div>

              <div className="twin-composition">
                <div className="composition-row">
                  <span className="composition-label">Trusted Sensors:</span>
                  <span className="composition-value trusted">{trustedSensors.length}</span>
                </div>
                <div className="composition-row">
                  <span className="composition-label">Ignored Sensors:</span>
                  <span className="composition-value ignored">{ignoredSensors.length}</span>
                </div>
              </div>

              <div className="twin-formula">
                <strong>Weighted Average:</strong>
                <br />
                {trustedSensors.length > 0
                  ? `(${trustedSensors
                      .map((s) => `S${s.id + 1}×${(s.trust_score * 100).toFixed(0)}%`)
                      .join(' + ')}) / ${trustedSensors.reduce((sum, s) => sum + s.trust_score, 0).toFixed(2)}`
                  : 'No trusted sensors'}
              </div>
            </div>
            <p className="stage-description">
              Digital representation of plant state, computed from trusted sensors only. This is
              what the system "believes" is happening.
            </p>
          </div>
        </div>

        {/* Stage 5: System Decision */}
        <div className="card stage-card">
          <div className="stage-header">
            <span className="stage-number">5</span>
            <h3 className="stage-title">System Decision</h3>
          </div>
          <div className="stage-content">
            <div className="decision-display">
              <div
                className="decision-status-large"
                style={{
                  color:
                    liveState.system_decision === 'NORMAL'
                      ? '#4CAF50'
                      : liveState.system_decision === 'ALERT OPERATOR'
                      ? '#F44336'
                      : '#FF9800',
                }}
              >
                {liveState.system_decision}
              </div>

              <div className="decision-logic">
                {liveState.system_decision === 'NORMAL' && (
                  <p>✅ Plant operating normally. Trusted sensors show stable readings.</p>
                )}
                {liveState.system_decision === 'IGNORE SENSOR' && (
                  <p>
                    ⚠️ One sensor showing abnormal behavior. Isolated from decision-making to
                    prevent false alarm.
                  </p>
                )}
                {liveState.system_decision === 'ALERT OPERATOR' && (
                  <p>
                    🚨 High-trust sensors show concerning readings or high disagreement. Human
                    intervention required.
                  </p>
                )}
              </div>
            </div>
            <p className="stage-description">
              Final action based on digital twin state and sensor trust levels. Humans remain in
              control.
            </p>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="card insights-card">
        <div className="card-header">
          <h2 className="card-title">🔑 Key Insights</h2>
        </div>
        <div className="insights-grid">
          <div className="insight-item">
            <div className="insight-icon">🎯</div>
            <h4>The Digital Twin is NOT Raw Data</h4>
            <p>
              It's a belief state constructed from trusted sensors. Unreliable signals are
              automatically excluded.
            </p>
          </div>
          <div className="insight-item">
            <div className="insight-icon">🔄</div>
            <h4>Trust is Dynamic</h4>
            <p>
              Sensors can lose and regain trust based on real-time behavior. The system adapts
              continuously.
            </p>
          </div>
          <div className="insight-item">
            <div className="insight-icon">🛡️</div>
            <h4>Disagreement Protection</h4>
            <p>
              When sensors disagree, the system evaluates whether it's sensor failure (isolate) or
              real incident (alert).
            </p>
          </div>
          <div className="insight-item">
            <div className="insight-icon">👤</div>
            <h4>Human-Centered Design</h4>
            <p>
              The system reduces false alarms but never blocks alerts. Operators retain full
              control with override capability.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DigitalTwinPage
