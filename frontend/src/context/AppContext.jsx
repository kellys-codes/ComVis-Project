import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false)
  const [scanHistory, setScanHistory] = useState([])
  const [currentResult, setCurrentResult] = useState(null)

  // Apply dark/light class to body
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    document.body.classList.toggle('light', !darkMode)
  }, [darkMode])

  // Init body class
  useEffect(() => { document.body.classList.add('light') }, [])

  const toggleDark = () => setDarkMode(d => !d)

  const addScan = (result) => {
    setScanHistory(h => [result, ...h])
    setCurrentResult(result)
  }

  const deleteScan = (index) => {
    setScanHistory(h => h.filter((_, i) => i !== index))
  }

  const clearHistory = () => setScanHistory([])

  return (
    <AppContext.Provider value={{
      darkMode, toggleDark,
      scanHistory, addScan, deleteScan, clearHistory,
      currentResult, setCurrentResult,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
