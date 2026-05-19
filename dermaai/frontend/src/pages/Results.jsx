import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const CLASS_NAMES = ['Common/Benign Nevi', 'Atypical/Other Benign', 'Melanoma']
const CLASS_COLORS = ['#22c55e', '#f59e0b', '#ef4444']

const GATE_CONFIG = {
  healthy: {
    bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', iconStroke: '#22c55e',
    label: 'PASSED', msg: 'No immediate concerns detected. Regular self-monitoring recommended.',
    icon: 'check',
  },
  watch: {
    bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', iconStroke: '#f97316',
    label: 'REVIEW', msg: 'Some atypical features detected. Professional evaluation recommended.',
    icon: 'warn',
  },
  danger: {
    bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', iconStroke: '#ef4444',
    label: 'FAILED', msg: 'Concerning features detected. Please consult a doctor urgently.',
    icon: 'alert',
  },
}

const BORDER_COLORS = { healthy: '#22c55e', watch: '#f59e0b', danger: '#ef4444' }
const ACTION_STYLES = {
  healthy: { bg: '#f0fdf4', color: '#16a34a' },
  watch:   { bg: '#fff7ed', color: '#c2410c' },
  danger:  { bg: '#fef2f2', color: '#b91c1c' },
}

function GateIcon({ type, stroke }) {
  if (type === 'check') return (
    <svg viewBox="0 0 24 24" stroke={stroke}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
  if (type === 'warn') return (
    <svg viewBox="0 0 24 24" stroke={stroke}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" stroke={stroke}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

export default function Results() {
  const navigate = useNavigate()
  const { currentResult, darkMode } = useApp()
  const canvasRef = useRef()

  useEffect(() => {
    if (!currentResult) navigate('/scan')
  }, [currentResult])

  useEffect(() => {
    if (currentResult) drawChart()
  }, [currentResult, darkMode])

  if (!currentResult) return null

  const { probabilities, risk, label, class_name, what, action, imgData, date, elapsed_ms } = currentResult
  const pcts = probabilities.map(p => Math.round(p * 100))
  const gate = GATE_CONFIG[risk] || GATE_CONFIG.healthy
  const actionStyle = ACTION_STYLES[risk] || ACTION_STYLES.healthy

  function drawChart() {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    const dpr = window.devicePixelRatio || 1
    canvas.width = container.offsetWidth * dpr
    canvas.height = container.offsetHeight * dpr
    canvas.style.width = '100%'; canvas.style.height = '100%'
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    const W = container.offsetWidth, H = container.offsetHeight
    const labelW = 180, padR = 50, padT = 16, padB = 32
    const chartW = W - labelW - padR, chartH = H - padT - padB
    const isDark = document.body.classList.contains('dark')
    const gridColor = isDark ? '#334155' : '#e5e7eb'
    const textColor = isDark ? '#94a3b8' : '#6b7280'
    const labelColor = isDark ? '#f1f5f9' : '#111827'
    ctx.clearRect(0, 0, W, H);
    [0, 25, 50, 75, 100].forEach(v => {
      const x = labelW + (v / 100) * chartW
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + chartH)
      ctx.strokeStyle = gridColor; ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = textColor; ctx.font = '12px Inter,sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(v + '%', x, H - 8)
    })
    const barH = Math.min(44, (chartH - 16 * 2) / 3)
    const totalH = barH * 3 + 16 * 2
    const startY = padT + (chartH - totalH) / 2
    CLASS_NAMES.forEach((lbl, i) => {
      const y = startY + i * (barH + 16)
      const bw = (pcts[i] / 100) * chartW
      ctx.fillStyle = textColor; ctx.font = '13px Inter,sans-serif'; ctx.textAlign = 'right'
      ctx.fillText(lbl, labelW - 12, y + barH / 2 + 4)
      ctx.fillStyle = isDark ? '#334155' : '#f3f4f6'
      ctx.beginPath(); ctx.roundRect(labelW, y, chartW, barH, 6); ctx.fill()
      if (bw > 0) {
        ctx.fillStyle = CLASS_COLORS[i]
        ctx.beginPath(); ctx.roundRect(labelW, y, bw, barH, 6); ctx.fill()
      }
      ctx.fillStyle = labelColor; ctx.font = 'bold 13px Inter,sans-serif'; ctx.textAlign = 'left'
      ctx.fillText(pcts[i] + '%', labelW + bw + 8, y + barH / 2 + 4)
    })
  }

  return (
    <div className="page-wrap fade-up">
      <div className="results-wrap">
        <button className="back-btn" onClick={() => navigate('/scan')}>
          <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Scan
        </button>

        <div className="results-header">
          <h1>Analysis Results</h1>
          <p>
            Scan completed on {date ? new Date(date).toLocaleString() : '—'}
            {elapsed_ms && <span> · {elapsed_ms}ms</span>}
          </p>
        </div>

        <div className="results-grid">
          {/* Analyzed image */}
          <div className="results-image-card">
            <h3>Analyzed Image</h3>
            <img src={imgData} alt="Analyzed skin lesion" />
          </div>

          {/* Gate + Quick Stats */}
          <div className="results-right">
            <div className="gate-card" style={{ background: gate.bg, border: `1px solid ${gate.border}` }}>
              <div className="gate-icon-wrap" style={{ borderColor: gate.iconStroke }}>
                <GateIcon type={gate.icon} stroke={gate.iconStroke} />
              </div>
              <div>
                <h3 style={{ color: gate.text }}>Healthy Skin Gate: {gate.label}</h3>
                <p style={{ color: gate.text, opacity: .85 }}>{gate.msg}</p>
              </div>
            </div>

            <div className="quick-stats-card">
              <h3>Quick Stats</h3>
              {CLASS_NAMES.map((name, i) => (
                <div className="stat-row" key={i}>
                  <div className="stat-label">
                    <span>{name}</span>
                    <span>{pcts[i]}%</span>
                  </div>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${pcts[i]}%`, background: CLASS_COLORS[i] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="chart-card">
          <h3>Classification Probability Distribution</h3>
          <div className="chart-container">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Disease detail */}
        <div className="disease-detail-card" style={{ borderLeftColor: BORDER_COLORS[risk] }}>
          <h3>{class_name}</h3>
          <div className="medical">Class {label} · {risk.toUpperCase()}</div>
          <p>{what}</p>
          <div className="action-tag" style={{ background: actionStyle.bg, color: actionStyle.color }}>
            {action}
          </div>
        </div>

        {/* Clinical note */}
        <div className="clinical-note">
          <span className="label">Clinical Note: </span>
          <span className="body">
            This AI-assisted analysis is for screening purposes only. Always consult a qualified
            dermatologist for definitive diagnosis and treatment recommendations.
          </span>
        </div>

        <div className="results-actions">
          <button className="btn-primary" onClick={() => navigate('/scan')}>New Scan</button>
          <button className="btn-outline" onClick={() => navigate('/history')}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            View History
          </button>
        </div>
      </div>
    </div>
  )
}
