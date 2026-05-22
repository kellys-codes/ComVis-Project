import { useNavigate } from 'react-router-dom'
import specimenImage from '../assets/specimen.png'

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
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-model">
            <span />
            <span>Model</span>
            <span>Random Forest</span>
            <span>Online</span>
          </p>
          <h1>
            Clinical-grade <span>dermoscopic</span> analysis, in seconds.
          </h1>
          <p className="hero-lead">
            Upload a dermoscopic image and let DermaAI surface lesion patterns, classify
            probability, and flag features that warrant a dermatologist's review.
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate('/scan')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
              </svg>
              Begin Analysis
              <svg viewBox="0 0 24 24">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </button>
            <button className="btn-outline" onClick={() => navigate('/history')}>
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              View Records
            </button>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="diagnostic-panel">
            <div className="diagnostic-topline">
              <span>Specimen · 0042</span>
              <strong>Ready</strong>
            </div>
            <div className="lesion-frame">
              <img className="specimen-image" src={specimenImage} alt="" />
              <div className="focus-reticle">
                <span />
              </div>
              <div className="scan-sweep" />
            </div>
            <div className="diagnostic-bars">
              <div>
                <span>Common</span>
                <i style={{ width: '76%' }} />
              </div>
              <div>
                <span>Atypical</span>
                <i style={{ width: '19%' }} />
              </div>
              <div>
                <span>Melanoma</span>
                <i style={{ width: '5%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-grid" aria-label="DermaAI features">
        {FEATURES.map(({ icon, title, desc }) => (
          <div className="feature-card" key={title}>
            <div className="feature-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </section>

      <section className="how-section">
        <div className="section-head">
          <p className="eyebrow">Pipeline</p>
          <h2>From capture to review.</h2>
        </div>
        <div className="steps-grid">
          {STEPS.map(({ num, title, desc }) => (
            <div className="step" key={num}>
              <div className="step-num">{num}</div>
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="disclaimer-box">
        <div className="disclaimer-panel">
          <span className="label">Medical Disclaimer: </span>
          <span className="body">
            This tool is for screening and educational purposes only. It is <strong>not</strong> a substitute
            for professional medical advice, diagnosis, or treatment. Always consult a qualified dermatologist
            or doctor if you have any concerns about a skin condition.
          </span>
        </div>
      </section>
    </div>
  )
}
