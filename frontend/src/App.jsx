import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Scan from './pages/Scan'
import Results from './pages/Results'
import History from './pages/History'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/scan"     element={<Scan />} />
          <Route path="/results"  element={<Results />} />
          <Route path="/history"  element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
