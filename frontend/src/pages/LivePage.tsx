import React, { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './LivePage.css'

interface SensorData {
  id: number
  temperature: number
  trust_score: number
  status: string
  maintenance_state: string
  history: Array<{ time: number; value: number }>
}

interface LiveState {
  simulation_time: number
  sensors: SensorData[]
  plant_state_estimate: number
  disagreement_level: number
  system_decision: string
}

const LivePage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [liveState, setLiveState] = useState<LiveState | null>(null)
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null)
  const [showOverridePanel, setShowOverridePanel] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    sensorMeshes: THREE.Mesh[]
    animationId: number | null
  } | null>(null)

  // Initialize 3D scene
  useEffect(() => {
    if (!canvasRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0e1a)
    scene.fog = new THREE.Fog(0x0a0e1a, 10, 100)

    const camera = new THREE.PerspectiveCamera(
      60,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(15, 10, 15)

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    })
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 5
    controls.maxDistance = 50

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.bottom = -20
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x4a9eff, 1, 50)
    pointLight.position.set(0, 10, 0)
    scene.add(pointLight)

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1f2e,
      roughness: 0.8,
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Grid
    const gridHelper = new THREE.GridHelper(50, 50, 0x2a3f5f, 0x1a2f4f)
    scene.add(gridHelper)

    // Chemical plant equipment
    const sensorMeshes: THREE.Mesh[] = []

    // Main reactor tank
    const tankGeometry = new THREE.CylinderGeometry(3, 3, 8, 32)
    const tankMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a5f8f,
      metalness: 0.7,
      roughness: 0.3,
    })
    const tank = new THREE.Mesh(tankGeometry, tankMaterial)
    tank.position.set(0, 4, 0)
    tank.castShadow = true
    tank.receiveShadow = true
    scene.add(tank)

    // Tank top
    const tankTopGeometry = new THREE.CylinderGeometry(3.2, 3.2, 0.5, 32)
    const tankTop = new THREE.Mesh(tankTopGeometry, tankMaterial)
    tankTop.position.set(0, 8.25, 0)
    scene.add(tankTop)

    // Pipes
    const pipeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 16)
    const pipeMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a7f9f,
      metalness: 0.8,
      roughness: 0.2,
    })

    const pipe1 = new THREE.Mesh(pipeGeometry, pipeMaterial)
    pipe1.position.set(-5, 2.5, 0)
    pipe1.rotation.z = Math.PI / 2
    pipe1.castShadow = true
    scene.add(pipe1)

    const pipe2 = new THREE.Mesh(pipeGeometry, pipeMaterial)
    pipe2.position.set(5, 2.5, 0)
    pipe2.rotation.z = Math.PI / 2
    pipe2.castShadow = true
    scene.add(pipe2)

    // Control boxes (secondary equipment)
    const boxGeometry = new THREE.BoxGeometry(2, 1.5, 1.5)
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a4f7f,
      metalness: 0.5,
      roughness: 0.5,
    })

    const box1 = new THREE.Mesh(boxGeometry, boxMaterial)
    box1.position.set(-8, 0.75, 5)
    box1.castShadow = true
    scene.add(box1)

    const box2 = new THREE.Mesh(boxGeometry, boxMaterial)
    box2.position.set(8, 0.75, 5)
    box2.castShadow = true
    scene.add(box2)

    // ========================================
    // ENHANCED SENSORS - 5 HIGHLY VISIBLE SENSORS
    // ========================================
    const sensorPositions = [
      { x: 0, y: 9.5, z: 0 },      // Tank top center - VISIBLE
      { x: 3.5, y: 5, z: 0 },      // Tank right side - VISIBLE
      { x: -3.5, y: 5, z: 0 },     // Tank left side - VISIBLE
      { x: -7.5, y: 3, z: 0 },     // Left pipe - VISIBLE
      { x: 7.5, y: 3, z: 0 },      // Right pipe - VISIBLE
    ]

    sensorPositions.forEach((pos, index) => {
      const sensorGroup = new THREE.Group()

      // LARGER Sensor base/mount
      const baseGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.3, 16)
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.8,
        roughness: 0.2,
      })
      const base = new THREE.Mesh(baseGeometry, baseMaterial)
      base.castShadow = true
      sensorGroup.add(base)

      // LARGER Sensor body - Main visible component
      const sensorGeometry = new THREE.CylinderGeometry(0.35, 0.35, 1.2, 16)
      const sensorMaterial = new THREE.MeshStandardMaterial({
        color: 0x4CAF50,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x4CAF50,
        emissiveIntensity: 0.5,
      })
      const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial)
      sensor.position.y = 0.75
      sensor.castShadow = true
      sensorGroup.add(sensor)

      // Top cap
      const capGeometry = new THREE.SphereGeometry(0.4, 16, 16)
      const capMaterial = new THREE.MeshStandardMaterial({
        color: 0x4CAF50,
        metalness: 0.6,
        roughness: 0.3,
        emissive: 0x4CAF50,
        emissiveIntensity: 0.4,
      })
      const cap = new THREE.Mesh(capGeometry, capMaterial)
      cap.position.y = 1.4
      cap.castShadow = true
      sensorGroup.add(cap)

      // BRIGHT Indicator light on top
      const lightGeometry = new THREE.SphereGeometry(0.15, 16, 16)
      const lightMaterial = new THREE.MeshBasicMaterial({
        color: 0x4CAF50,
      })
      const light = new THREE.Mesh(lightGeometry, lightMaterial)
      light.position.y = 1.6
      sensorGroup.add(light)

      // STRONG Point light for glow effect - HIGHLY VISIBLE
      const sensorLight = new THREE.PointLight(0x4CAF50, 2, 5)
      sensorLight.position.y = 1.6
      sensorLight.castShadow = true
      sensorGroup.add(sensorLight)

      // Pulsing glow effect (outer sphere)
      const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4CAF50,
        transparent: true,
        opacity: 0.3,
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.position.y = 1.4
      sensorGroup.add(glow)

      // Sensor label (text sprite) - Optional but helpful
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      canvas.width = 256
      canvas.height = 128
      context.fillStyle = '#ffffff'
      context.font = 'Bold 48px Arial'
      context.textAlign = 'center'
      context.fillText(`S${index + 1}`, 128, 80)

      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.scale.set(1, 0.5, 1)
      sprite.position.y = 2.2
      sensorGroup.add(sprite)

      sensorGroup.position.set(pos.x, pos.y, pos.z)
      sensorGroup.userData = { sensorId: index }
      scene.add(sensorGroup)
      sensorMeshes.push(sensor)
    })

    // Raycaster for sensor selection
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onMouseClick = (event: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(sensorMeshes)

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh
        const sensorId = clickedMesh.parent?.userData.sensorId
        if (sensorId !== undefined && liveState) {
          setSelectedSensor(liveState.sensors[sensorId])
        }
      }
    }

    canvasRef.current.addEventListener('click', onMouseClick)

    // Animation loop with pulsing effect
    let pulseTime = 0
    const animate = () => {
      const animationId = requestAnimationFrame(animate)
      sceneRef.current!.animationId = animationId

      pulseTime += 0.05

      // Update sensor colors based on trust scores and add pulsing
      if (liveState) {
        liveState.sensors.forEach((sensor, index) => {
          const sensorMesh = sensorMeshes[index]
          const material = sensorMesh.material as THREE.MeshStandardMaterial
          const sensorGroup = sensorMesh.parent!

          // Set color based on status
          let color = 0x4CAF50
          if (sensor.status === 'Healthy') {
            color = 0x4CAF50
          } else if (sensor.status === 'Unstable') {
            color = 0xFF9800
          } else {
            color = 0xF44336
          }

          material.color.setHex(color)
          material.emissive.setHex(color)
          material.emissiveIntensity = 0.4 + sensor.trust_score * 0.4 + Math.sin(pulseTime + index) * 0.1

          // Update cap color
          const cap = sensorGroup.children.find(
            (child) => child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry
          ) as THREE.Mesh
          if (cap && cap.material instanceof THREE.MeshStandardMaterial) {
            cap.material.color.setHex(color)
            cap.material.emissive.setHex(color)
            cap.material.emissiveIntensity = 0.3 + sensor.trust_score * 0.3
          }

          // Update point lights with pulsing
          const light = sensorGroup.children.find(
            (child) => child instanceof THREE.PointLight
          ) as THREE.PointLight
          if (light) {
            light.color.setHex(color)
            light.intensity = 1.5 + sensor.trust_score * 1.5 + Math.sin(pulseTime + index) * 0.5
          }

          // Update indicator light
          const indicatorLight = sensorGroup.children.find(
            (child) => child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial
          ) as THREE.Mesh
          if (indicatorLight) {
            (indicatorLight.material as THREE.MeshBasicMaterial).color.setHex(color)
          }

          // Update glow sphere with pulsing
          const glowSphere = sensorGroup.children.find(
            (child) => child instanceof THREE.Mesh && 
            child.material instanceof THREE.MeshBasicMaterial &&
            (child.material as THREE.MeshBasicMaterial).transparent
          ) as THREE.Mesh
          if (glowSphere) {
            (glowSphere.material as THREE.MeshBasicMaterial).color.setHex(color);
            (glowSphere.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(pulseTime + index) * 0.15
          }
        })
      }

      controls.update()
      renderer.render(scene, camera)
    }

    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      sensorMeshes,
      animationId: null,
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      canvasRef.current?.removeEventListener('click', onMouseClick)
      if (sceneRef.current?.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId)
      }
      renderer.dispose()
    }
  }, [liveState])

  // Connect to live SSE stream
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5000/live/stream')

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

  const handleOverride = async (decision: string) => {
    try {
      await fetch('http://localhost:5000/live/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, reason: overrideReason }),
      })
      setShowOverridePanel(false)
      setOverrideReason('')
    } catch (error) {
      console.error('Override failed:', error)
    }
  }

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'NORMAL':
        return '#4CAF50'
      case 'IGNORE SENSOR':
        return '#FF9800'
      case 'ALERT OPERATOR':
        return '#F44336'
      default:
        return '#2196F3'
    }
  }

  if (!liveState) {
    return (
      <div className="live-page loading">
        <div className="loading-spinner"></div>
        <p>Connecting to plant systems...</p>
      </div>
    )
  }

  return (
    <div className="live-page">
      <div className="page-header">
        <h1 className="page-title">Live Operations Center</h1>
        <p className="page-subtitle">
          Real-time monitoring • {Math.floor(liveState.simulation_time)}s runtime
        </p>
      </div>

      <div className="live-grid">
        {/* 3D Scene */}
        <div className="scene-container card">
          <div className="card-header">
            <h2 className="card-title">Plant Overview</h2>
            <span className="badge badge-success">Live</span>
          </div>
          <canvas ref={canvasRef} className="scene-canvas"></canvas>
          <div className="scene-instructions">
            🖱️ Click sensors for details • Drag to rotate • Scroll to zoom
          </div>
        </div>

        {/* System Decision Panel */}
        <div className="decision-panel card">
          <div className="card-header">
            <h2 className="card-title">System Decision</h2>
          </div>

          <div className="decision-display" style={{ borderColor: getDecisionColor(liveState.system_decision) }}>
            <div className="decision-status" style={{ color: getDecisionColor(liveState.system_decision) }}>
              {liveState.system_decision}
            </div>
            <div className="decision-details">
              <div className="detail-row">
                <span>Plant State:</span>
                <strong>{liveState.plant_state_estimate.toFixed(1)}°C</strong>
              </div>
              <div className="detail-row">
                <span>Disagreement:</span>
                <strong>{liveState.disagreement_level.toFixed(2)}°C</strong>
              </div>
            </div>
          </div>

          <div className="sensor-trust-list">
            {liveState.sensors.map((sensor) => (
              <div key={sensor.id} className="sensor-trust-item">
                <div className="sensor-info">
                  <span className="sensor-label">Sensor {sensor.id + 1}</span>
                  <span className={`badge badge-${sensor.status === 'Healthy' ? 'success' : sensor.status === 'Unstable' ? 'warning' : 'danger'}`}>
                    {sensor.status}
                  </span>
                </div>
                <div className="trust-bar-container">
                  <div
                    className="trust-bar"
                    style={{
                      width: `${sensor.trust_score * 100}%`,
                      backgroundColor: sensor.trust_score > 0.7 ? '#4CAF50' : sensor.trust_score > 0.3 ? '#FF9800' : '#F44336',
                    }}
                  ></div>
                </div>
                <span className="trust-value">{(sensor.trust_score * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowOverridePanel(!showOverridePanel)}
          >
            Operator Override
          </button>

          {showOverridePanel && (
            <div className="override-panel">
              <input
                type="text"
                placeholder="Override reason (required)"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="override-input"
              />
              <div className="override-buttons">
                <button
                  className="btn btn-success"
                  onClick={() => handleOverride('NORMAL')}
                  disabled={!overrideReason}
                >
                  Force Normal
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleOverride('ALERT OPERATOR')}
                  disabled={!overrideReason}
                >
                  Force Alert
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Sensor Details */}
        {selectedSensor && (
          <div className="sensor-detail-panel card">
            <div className="card-header">
              <h2 className="card-title">Sensor {selectedSensor.id + 1} Details</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedSensor(null)}
              >
                ✕
              </button>
            </div>

            <div className="sensor-detail-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Current Value</span>
                  <span className="detail-value">{selectedSensor.temperature.toFixed(2)}°C</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Trust Score</span>
                  <span className="detail-value">{(selectedSensor.trust_score * 100).toFixed(0)}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`badge badge-${selectedSensor.status === 'Healthy' ? 'success' : selectedSensor.status === 'Unstable' ? 'warning' : 'danger'}`}>
                    {selectedSensor.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Maintenance</span>
                  <span className="detail-value">{selectedSensor.maintenance_state}</span>
                </div>
              </div>

              <div className="mini-chart">
                <div className="chart-title">Last 30 seconds</div>
                <svg width="100%" height="100" className="trend-chart">
                  {selectedSensor.history.length > 1 && (
                    <>
                      {selectedSensor.history.slice(-30).map((point, index, arr) => {
                        if (index === 0) return null
                        const prevPoint = arr[index - 1]
                        const x1 = (index - 1) * (100 / 30)
                        const x2 = index * (100 / 30)
                        const minTemp = Math.min(...arr.map((p) => p.value))
                        const maxTemp = Math.max(...arr.map((p) => p.value))
                        const range = maxTemp - minTemp || 1
                        const y1 = 80 - ((prevPoint.value - minTemp) / range) * 60
                        const y2 = 80 - ((point.value - minTemp) / range) * 60

                        return (
                          <line
                            key={index}
                            x1={`${x1}%`}
                            y1={y1}
                            x2={`${x2}%`}
                            y2={y2}
                            stroke="#4a9eff"
                            strokeWidth="2"
                          />
                        )
                      })}
                    </>
                  )}
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LivePage
