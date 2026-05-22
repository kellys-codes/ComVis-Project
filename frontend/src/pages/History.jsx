import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const RISK_COLOR = { healthy: 'var(--teal)', watch: '#f59e0b', danger: '#dc2626' }
const RISK_LABEL = { healthy: 'Healthy', watch: 'Review', danger: 'Urgent' }
const CLASS_SHORT = ['Common', 'Atypical', 'Melanoma']
const CLASS_COLORS = ['#1f6196', '#75a9d2', '#f59e0b']

export default function History() {
  const navigate = useNavigate()
  const { scanHistory, deleteScan, setCurrentResult } = useApp()

  const viewScan = (scan) => {
    setCurrentResult(scan)
    navigate('/results')
  }

  return (
    <div className="page-wrap fade-up">
      <div className="history-wrap">
        <header className="page-head history-head">
          <div>
            <p className="eyebrow">Session archive</p>
            <h1>Scan History</h1>
            <p>View and manage your previous skin analysis results</p>
          </div>
          <div className="history-count">
            <strong>{scanHistory.length}</strong>
            <span>saved scans</span>
          </div>
        </header>

        {scanHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h2>No Scans Yet</h2>
            <p>Start your first skin analysis to see results here</p>
            <button className="btn-primary" onClick={() => navigate('/scan')}>
              Start First Scan
            </button>
          </div>
        ) : (
          <>
            <div className="history-grid">
              {scanHistory.map((scan, i) => {
                const pcts = scan.probabilities.map(p => Math.round(p * 100))
                const rc = RISK_COLOR[scan.risk] || 'var(--teal)'
                const rl = RISK_LABEL[scan.risk] || 'Healthy'
                const d = scan.date ? new Date(scan.date) : null

                return (
                  <div className="history-card" key={i}>
                    <div className="history-img-wrap">
                      <img src={scan.imgData} alt={`Scan ${i + 1}`} />
                      <div className="history-badge" style={{ background: rc }}>
                        <svg viewBox="0 0 24 24">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        {rl}
                      </div>
                    </div>
                    <div className="history-card-body">
                      <div className="history-date">
                        <svg viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span className="date">{d?.toLocaleDateString()}</span>
                        <span className="time">{d?.toLocaleTimeString()}</span>
                      </div>
                      {CLASS_SHORT.map((name, ci) => (
                        <div className="history-stat" key={ci}>
                          <div className="history-stat-label">
                            <span>{name}</span>
                            <span>{pcts[ci]}%</span>
                          </div>
                          <div className="history-stat-bar">
                            <i style={{ width: `${pcts[ci]}%`, background: CLASS_COLORS[ci] }} />
                          </div>
                        </div>
                      ))}
                      <div className="history-card-actions">
                        <button className="btn-view" onClick={() => viewScan(scan)}>
                          <svg viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          View
                        </button>
                        <button className="btn-icon" onClick={() => deleteScan(i)} aria-label="Delete">
                          <svg viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="history-footer">
              <p className="history-total">Total scans: {scanHistory.length}</p>
              <button className="btn-primary" onClick={() => navigate('/scan')}>New Scan</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
