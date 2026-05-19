import { useNavigate } from 'react-router-dom'

const FEATURES = [
  {
    icon: <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    title: 'Instant Results',
    desc: 'Upload or take a photo and get a result in seconds. No waiting rooms, no appointments — just a clear answer right away.',
  },
  {
    icon: <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Secure & Private',
    desc: 'Your photos are sent securely to our backend and never stored. Results are deleted immediately after analysis.',
  },
  {
    icon: <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    title: 'Clinically Trained AI',
    desc: 'Built on a Random Forest model trained on thousands of real dermoscopic images from the HAM10000 dataset.',
  },
]

const STEPS = [
  { num: 1, title: 'Take or Upload a Photo', desc: 'Point your camera at the skin area, or choose a photo from your gallery' },
  { num: 2, title: 'AI Analyses the Image', desc: 'Our AI examines the colour, texture, and shape of the skin area on our secure server' },
  { num: 3, title: 'Get a Clear Answer', desc: 'See what the AI detected, how confident it is, and what you should do next' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="page-wrap fade-up">
      {/* Hero */}
      <div className="hero">
        <div className="hero-icon">
          <svg viewBox="0 0 24 24">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14Z"/>
          </svg>
        </div>
        <h1>AI-Powered Skin Analysis</h1>
        <p>
          Take a photo of a skin concern and get an instant AI-powered assessment —
          no doctor visit needed for a first look. Fast, private, and easy to understand.
        </p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => navigate('/scan')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
              <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
            </svg>
            Start Scanning
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <button className="btn-outline" onClick={() => navigate('/history')}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            View History
          </button>
        </div>
      </div>

      {/* Feature cards */}
      <div className="features-grid">
        {FEATURES.map(({ icon, title, desc }) => (
          <div className="feature-card" key={title}>
            <div className="feature-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="how-section">
        <h2>How It Works</h2>
        <div className="steps-grid">
          {STEPS.map(({ num, title, desc }) => (
            <div className="step" key={num}>
              <div className="step-num">{num}</div>
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="disclaimer-box" style={{ padding: '0 24px' }}>
        <div style={{ maxWidth: 1032, margin: '0 auto', padding: '18px 32px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, textAlign: 'center' }}>
          <span className="label">Medical Disclaimer: </span>
          <span className="body">
            This tool is for screening and educational purposes only. It is <strong>not</strong> a substitute
            for professional medical advice, diagnosis, or treatment. Always consult a qualified dermatologist
            or doctor if you have any concerns about a skin condition.
          </span>
        </div>
      </div>
      <div style={{ height: 48 }} />
    </div>
  )
}
