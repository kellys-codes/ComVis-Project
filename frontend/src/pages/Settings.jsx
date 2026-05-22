import { useApp } from '../context/AppContext'

export default function Settings() {
  const { darkMode, toggleDark, scanHistory, clearHistory } = useApp()

  return (
    <div className="page-wrap fade-up">
      <div className="settings-wrap">
        <header className="page-head settings-head">
          <div>
            <p className="eyebrow">Workspace controls</p>
            <h1>Settings</h1>
            <p>Customize your DermaAI experience</p>
          </div>
        </header>

        {/* Appearance */}
        <div className="settings-card">
          <h2>Appearance</h2>
          <div className="settings-row">
            <div className="settings-row-text">
              <h3>Theme</h3>
              <p>Switch between light and dark mode</p>
            </div>
            <button className="btn-primary" onClick={toggleDark}>
              {darkMode
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-card">
          <h2>Data Management</h2>
          <div className="settings-row">
            <div className="settings-row-text">
              <h3>Scan History</h3>
              <p>You have {scanHistory.length} saved scan{scanHistory.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              className="btn-danger"
              onClick={clearHistory}
              disabled={scanHistory.length === 0}
              style={{ opacity: scanHistory.length === 0 ? .5 : 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Clear All
            </button>
          </div>
        </div>

        {/* About */}
        <div className="settings-card">
          <div className="settings-about-title">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            About DermaAI
          </div>
          <p className="settings-about-item">Version: 1.0.0</p>
          <p className="settings-about-item">AI Model: Random Forest (ONNX) — HAM10000 trained</p>
          <p className="settings-about-item">Features: 120D (GLCM + LBP + Gabor + Colour + ABCD)</p>
          <p className="settings-about-item">Last Updated: May 2026</p>
          <p className="settings-about-item">Stack: Vite + React · FastAPI · onnxruntime</p>
          <div className="settings-divider" />
          <p className="settings-about-desc">
            DermaAI uses a Random Forest classifier trained on thousands of dermoscopic images from
            the HAM10000 dataset to provide preliminary skin lesion analysis. This tool is for
            educational and screening purposes only.
          </p>
        </div>

        {/* Privacy */}
        <div className="settings-privacy">
          <span className="label">Privacy: </span>
          <span className="body">
            Images are sent to the local backend only and are never stored or transmitted externally.
            Scan history is kept in memory and cleared on page refresh.
          </span>
        </div>
      </div>
    </div>
  )
}
