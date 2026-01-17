import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import LivePage from './pages/LivePage'
import SensorHealthPage from './pages/SensorHealthPage'
import DigitalTwinPage from './pages/DigitalTwinPage'
import RealWorldImpactPage from './pages/RealWorldImpactPage'
import './App.css'

const Navigation: React.FC = () => {
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path
  
  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <div className="brand-icon">⚗️</div>
        <div className="brand-text">
          <div className="brand-title">Chemical Plant</div>
          <div className="brand-subtitle">Digital Twin System</div>
        </div>
      </div>
      
      <div className="nav-links">
        <Link to="/" className={isActive('/') ? 'active' : ''}>
          <span className="nav-icon">🎯</span>
          Live Operations
        </Link>
        <Link to="/sensor-health" className={isActive('/sensor-health') ? 'active' : ''}>
          <span className="nav-icon">📊</span>
          Sensor Health
        </Link>
        <Link to="/digital-twin" className={isActive('/digital-twin') ? 'active' : ''}>
          <span className="nav-icon">🔄</span>
          Digital Twin
        </Link>
        <Link to="/impact" className={isActive('/impact') ? 'active' : ''}>
          <span className="nav-icon">💡</span>
          Real-World Impact
        </Link>
      </div>
      
      <div className="nav-status">
        <div className="status-indicator live"></div>
        <span>System Active</span>
      </div>
    </nav>
  )
}

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LivePage />} />
            <Route path="/sensor-health" element={<SensorHealthPage />} />
            <Route path="/digital-twin" element={<DigitalTwinPage />} />
            <Route path="/impact" element={<RealWorldImpactPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
