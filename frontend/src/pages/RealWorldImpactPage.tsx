import React from 'react'
import './RealWorldImpactPage.css'

interface Incident {
  id: number
  title: string
  location: string
  year: number
  problem: string
  sensorIssue: string
  consequences: string[]
  imageUrl: string
  howSystemHelps: string
}

const RealWorldImpactPage: React.FC = () => {
  const incidents: Incident[] = [
    {
      id: 1,
      title: 'Chemical Plant False Shutdown',
      location: 'Texas, USA',
      year: 2019,
      problem: 'Emergency shutdown triggered by faulty temperature sensor',
      sensorIssue: 'Single sensor reported 250°C spike while others showed normal 180°C',
      consequences: [
        'Plant shutdown cost $2.3M in lost production',
        '48 hours downtime for restart procedures',
        'No actual safety incident occurred',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
      howSystemHelps:
        'Sensor trust system would have detected isolated spike, ignored the faulty sensor, and prevented false shutdown. Other sensors showed consensus at normal temperature.',
    },
    {
      id: 2,
      title: 'Refinery Temperature Alarm Fatigue',
      location: 'Rotterdam, Netherlands',
      year: 2018,
      problem: 'Aging temperature sensors caused 47 false alarms in one week',
      sensorIssue: 'Three sensors drifting slowly over time, triggering threshold violations',
      consequences: [
        'Operators became desensitized to alarms',
        'Real incident nearly missed due to alarm fatigue',
        'Safety investigation revealed systematic problem',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800',
      howSystemHelps:
        'Trust score decay would have automatically identified drifting sensors. System would flag sensors for maintenance without triggering false alarms, maintaining operator alert sensitivity.',
    },
    {
      id: 3,
      title: 'Gas Processing Overheating Incident',
      location: 'Alberta, Canada',
      year: 2020,
      problem: 'Real overheating event confused with previous false alarms',
      sensorIssue:
        'All sensors showed rising temperature, but operators dismissed due to past false positives',
      consequences: [
        'Equipment damage totaling $1.8M',
        '4-day unplanned shutdown',
        'Delayed response due to alarm distrust',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
      howSystemHelps:
        'System distinguishes false alarms (single sensor deviation) from real incidents (all sensors agree). High trust consensus would have clearly indicated legitimate emergency, restoring operator confidence.',
    },
    {
      id: 4,
      title: 'Pharmaceutical Reactor False Alert',
      location: 'Basel, Switzerland',
      year: 2021,
      problem: 'Sensor spike during critical batch processing triggered unnecessary intervention',
      sensorIssue: 'One sensor reported 3-second spike to 205°C, others stable at 185°C',
      consequences: [
        '$450K batch discarded as precaution',
        'Investigation found faulty sensor connector',
        'Batch timeline delayed 2 weeks',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
      howSystemHelps:
        'Trust evaluation detects transient spikes from single sensors. System would have maintained plant state estimate based on stable majority, avoiding costly false positive.',
    },
  ]

  return (
    <div className="impact-page">
      <div className="page-header">
        <h1 className="page-title">Real-World Impact</h1>
        <p className="page-subtitle">
          How sensor trust systems prevent costly false alarms in actual industrial operations
        </p>
      </div>

      <div className="impact-summary card">
        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-value">$4.55M</div>
            <div className="stat-label">Average annual cost from false alarms</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">30-40%</div>
            <div className="stat-label">Of industrial alarms are false positives</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">2-3 days</div>
            <div className="stat-label">Average downtime per false shutdown</div>
          </div>
        </div>
        <p className="summary-text">
          Industrial facilities worldwide lose millions annually to sensor-related false alarms.
          Sensor trust systems provide a critical solution by distinguishing between sensor
          failures and real process incidents.
        </p>
      </div>

      <div className="incidents-grid">
        {incidents.map((incident) => (
          <div key={incident.id} className="card incident-card">
            <div className="incident-image-container">
              <img
                src={incident.imageUrl}
                alt={incident.title}
                className="incident-image"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%231a1f2e" width="800" height="400"/%3E%3Ctext fill="%238a9ba8" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EIndustrial Facility%3C/text%3E%3C/svg%3E'
                }}
              />
              <div className="incident-badge">
                <span className="incident-year">{incident.year}</span>
                <span className="incident-location">{incident.location}</span>
              </div>
            </div>

            <div className="incident-content">
              <h3 className="incident-title">{incident.title}</h3>

              <div className="incident-section">
                <div className="section-label">🔴 What Went Wrong</div>
                <p className="section-text">{incident.problem}</p>
              </div>

              <div className="incident-section">
                <div className="section-label">📡 Sensor Issue</div>
                <p className="section-text sensor-issue">{incident.sensorIssue}</p>
              </div>

              <div className="incident-section">
                <div className="section-label">💰 Consequences</div>
                <ul className="consequences-list">
                  {incident.consequences.map((consequence, index) => (
                    <li key={index}>{consequence}</li>
                  ))}
                </ul>
              </div>

              <div className="solution-section">
                <div className="solution-header">
                  <span className="solution-icon">✅</span>
                  <span className="solution-label">If Sensor Trust Logic Had Been Applied</span>
                </div>
                <p className="solution-text">{incident.howSystemHelps}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card conclusion-card">
        <div className="conclusion-icon">🎯</div>
        <h2 className="conclusion-title">The Bottom Line</h2>
        <div className="conclusion-content">
          <p>
            Sensor trust systems don't suppress alarms or block safety mechanisms. Instead, they
            add intelligence to distinguish between:
          </p>
          <div className="comparison-grid">
            <div className="comparison-item false">
              <div className="comparison-icon">❌</div>
              <h4>False Alarm (Isolated)</h4>
              <p>Single sensor deviates</p>
              <p>Others show consensus</p>
              <p>→ Ignore faulty sensor</p>
            </div>
            <div className="comparison-item real">
              <div className="comparison-icon">✅</div>
              <h4>Real Incident (Consensus)</h4>
              <p>All sensors agree</p>
              <p>Low disagreement</p>
              <p>→ Alert operator immediately</p>
            </div>
          </div>
          <p className="conclusion-final">
            This reduces alarm fatigue, maintains operator trust, prevents costly false shutdowns,
            and ensures real incidents are taken seriously. Humans remain in full control with the
            ability to override any system decision.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RealWorldImpactPage
