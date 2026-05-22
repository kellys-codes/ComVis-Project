import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useApp } from '../context/AppContext'

const ANALYSIS_MSGS = [
  'Removing hair artifacts (black-hat morphology)...',
  'Applying CLAHE contrast enhancement...',
  'Performing Otsu lesion segmentation...',
  'Extracting GLCM texture features (24D)...',
  'Computing LBP histogram (26D)...',
  'Applying Gabor filter bank (24D)...',
  'Building HSV colour histogram (32D)...',
  'Computing colour moments (9D)...',
  'Extracting ABCD dermoscopy features (5D)...',
  'Running Random Forest ONNX model...',
  'Generating results...',
]

export default function Scan() {
  const navigate = useNavigate()
  const { addScan } = useApp()

  const [imgData, setImgData] = useState(null)   // base64 preview
  const [imgFile, setImgFile] = useState(null)   // File object for upload
  const [zone, setZone] = useState('empty')       // empty | preview | cam | loading
  const [loadMsg, setLoadMsg] = useState('')
  const [loadSub, setLoadSub] = useState('')
  const [drag, setDrag] = useState(false)
  const [apiStatus, setApiStatus] = useState('loading') // loading | ready | error
  const [camFacing, setCamFacing] = useState('environment')
  const [camStream, setCamStream] = useState(null)

  const fileRef = useRef()
  const videoRef = useRef()
  const msgInterval = useRef()

  // Check backend health on mount
  useEffect(() => {
    axios.get('/api/health')
      .then(() => setApiStatus('ready'))
      .catch(() => setApiStatus('error'))
  }, [])

  useEffect(() => {
    if (camStream && videoRef.current) {
      videoRef.current.srcObject = camStream
    }
  }, [camStream])

  // Cleanup camera on unmount
  useEffect(() => () => stopCamera(), [])

  /* ── File handling ── */
  const loadFile = (file) => {
    setImgFile(file)
    const reader = new FileReader()
    reader.onload = (e) => { setImgData(e.target.result); setZone('preview') }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e) => { if (e.target.files[0]) loadFile(e.target.files[0]) }

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) loadFile(f)
  }

  /* ── Camera ── */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: camFacing }, audio: false })
      setCamStream(stream); setZone('cam')
    } catch (e) { alert('Camera error: ' + e.message) }
  }

  const stopCamera = () => {
    if (camStream) { camStream.getTracks().forEach(t => t.stop()); setCamStream(null) }
  }

  const flipCamera = async () => {
    stopCamera()
    const next = camFacing === 'environment' ? 'user' : 'environment'
    setCamFacing(next)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: next }, audio: false })
      setCamStream(stream)
    } catch (e) { alert('Camera error: ' + e.message) }
  }

  const capturePhoto = () => {
    const v = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth || 640; canvas.height = v.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (camFacing === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1) }
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
      setImgFile(file)
      setImgData(canvas.toDataURL('image/jpeg', 0.92))
      stopCamera(); setZone('preview')
    }, 'image/jpeg', 0.92)
  }

  const cancelCamera = () => { stopCamera(); setZone('empty') }
  const resetScan = () => { stopCamera(); setImgData(null); setImgFile(null); setZone('empty'); if (fileRef.current) fileRef.current.value = '' }

  /* ── Analysis ── */
  const analyzeImage = async () => {
    if (!imgFile) return
    setZone('loading')
    let mi = 0
    msgInterval.current = setInterval(() => {
      setLoadMsg(ANALYSIS_MSGS[mi % ANALYSIS_MSGS.length])
      setLoadSub(`Step ${Math.min(mi + 1, ANALYSIS_MSGS.length)} of ${ANALYSIS_MSGS.length}`)
      mi++
    }, 650)

    try {
      const form = new FormData()
      form.append('file', imgFile)
      const { data } = await axios.post('/api/analyze', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      clearInterval(msgInterval.current)
      addScan({ ...data, imgData, date: new Date() })
      navigate('/results')
    } catch (err) {
      clearInterval(msgInterval.current)
      setZone('preview')
      const msg = err.response?.data?.detail || err.message
      alert('Analysis failed: ' + msg)
    }
  }

  /* ── Render ── */
  const badgeClass = apiStatus === 'ready' ? 'model-badge ready' : apiStatus === 'error' ? 'model-badge error' : 'model-badge loading'
  const badgeText = apiStatus === 'ready' ? 'Random Forest ONNX model ready' : apiStatus === 'error' ? 'Backend offline - run uvicorn main:app' : 'Connecting to backend...'

  return (
    <div className="page-wrap fade-up">
      <div className="scan-wrap">
        <header className="page-head scan-head">
          <div>
            <p className="eyebrow">Image intake</p>
            <h1>Dermoscopic image analysis</h1>
            <p>Upload a clear lesion image or capture one from the active camera.</p>
          </div>
          <span className={badgeClass}>{badgeText}</span>
        </header>

        <input type="file" ref={fileRef} accept="image/*" onChange={handleFileInput} />

        <div className="scan-layout">
          <section className="scan-stage">
            <div
              className={`upload-card${drag ? ' drag' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
            >
              {/* Empty state */}
              {zone === 'empty' && (
                <div className="upload-zone">
                  <div className="upload-circle">
                    <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <h3>Upload or capture image</h3>
                  <p>Drop a JPEG or PNG into the review stage.</p>
                  <div className="upload-btns">
                    <button className="btn-primary" onClick={() => fileRef.current.click()}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Select image
                    </button>
                    <button className="btn-outline" onClick={startCamera}>
                      <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      Take photo
                    </button>
                  </div>
                </div>
              )}

              {/* Camera */}
              {zone === 'cam' && (
                <div className="cam-zone">
                  <video ref={videoRef} autoPlay playsInline muted />
                  <div className="cam-controls">
                    <button className="cam-ctrl-btn" onClick={flipCamera} aria-label="Flip camera">
                      <svg viewBox="0 0 24 24"><path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/><path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5"/><circle cx="12" cy="12" r="3"/><path d="m18 22-3-3 3-3"/><path d="m6 2 3 3-3 3"/></svg>
                    </button>
                    <button className="cam-shutter" onClick={capturePhoto} aria-label="Capture">
                      <div className="cam-shutter-inner" />
                    </button>
                    <button className="cam-ctrl-btn" onClick={cancelCamera} aria-label="Cancel">
                      <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <p className="cam-tip">Tap the circle to capture</p>
                </div>
              )}

              {/* Preview */}
              {zone === 'preview' && (
                <div className="preview-zone">
                  <img src={imgData} alt="Selected skin image" />
                  <div className="preview-btns">
                    <button className="btn-outline" onClick={resetScan}>Upload different image</button>
                    <button className="btn-primary" onClick={analyzeImage} disabled={apiStatus !== 'ready'}>
                      Analyze image
                    </button>
                  </div>
                </div>
              )}

              {/* Loading */}
              {zone === 'loading' && (
                <div className="loading-zone">
                  <div className="spinner" />
                  <p>{loadMsg}</p>
                  <p className="loading-sub">{loadSub}</p>
                </div>
              )}
            </div>

            <div className="privacy-note">
              <span className="label">Privacy Note: </span>
              <span className="body">
                Images are sent securely to the local backend for analysis and are never stored or shared.
              </span>
            </div>
          </section>

          <aside className="scan-guide" aria-label="Image quality guidance">
            <div className="guide-card">
              <p className="eyebrow">Review stage</p>
              <h2>Image quality matters.</h2>
              <p>Use a centered lesion view with even light so segmentation and texture features stay stable.</p>
            </div>
            <ol className="quality-list">
              <li>
                <strong>Frame</strong>
                <span>Keep the lesion visible with a margin around it.</span>
              </li>
              <li>
                <strong>Light</strong>
                <span>Avoid glare, deep shadow, and heavy color casts.</span>
              </li>
              <li>
                <strong>Focus</strong>
                <span>Retake blurred captures before running analysis.</span>
              </li>
            </ol>
          </aside>
        </div>
      </div>
    </div>
  )
}
