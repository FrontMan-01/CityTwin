import React, { useState, useEffect } from 'react'
import axios from 'axios'
import WeatherPanel from './components/WeatherPanel'
import ControlPanel from './components/ControlPanel'
import Charts from './components/Charts'
import CityView from './components/CityView'

export default function App() {
  const [simResult, setSimResult] = useState(null)
  const [history, setHistory] = useState([])
  const [traffic, setTraffic] = useState(50)
  const [trees, setTrees] = useState(50)
  const [renewable, setRenewable] = useState(50)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  function pushHistory(pollution) {
    setHistory(h => [...h.slice(-19), { index: h.length + 1, pollution }])
  }

  // Fetch initial simulation settings on startup
  useEffect(() => {
    axios.post('/api/simulate', { traffic: 50, trees: 50, renewable: 50 })
      .then(res => {
        setSimResult(res.data)
        setHistory([{ index: 1, pollution: res.data.pollution }])
      })
      .catch(() => {
        // Safe fallback in case backend is offline
        setHistory([{ index: 1, pollution: 35 }])
      })
  }, [])


  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 p-6 flex flex-col space-y-6">
      
      {/* Header Panel */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border border-slate-800/80 bg-slate-950/40 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></span>
            <span className="text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase">Core Simulator Active</span>
          </div>
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
            CityTwin<span className="text-indigo-400 font-medium">.OS</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-6 mt-4 md:mt-0 text-xs">
          <div className="flex flex-col text-right">
            <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Local Time</span>
            <span className="font-mono text-slate-300 font-bold text-sm mt-0.5">{currentTime || '00:00:00'}</span>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="flex flex-col text-right">
            <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">System State</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Operational
            </span>
          </div>
        </div>
      </header>

      {/* Main Control Center Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Widget: Weather Hub */}
        <section className="glass-card flex flex-col justify-between">
          <WeatherPanel />
        </section>

        {/* Middle Widget: Sliders & Adjustments */}
        <section className="glass-card">
          <ControlPanel 
            traffic={traffic} setTraffic={setTraffic}
            trees={trees} setTrees={setTrees}
            renewable={renewable} setRenewable={setRenewable}
            setSimResult={(res) => { 
              setSimResult(res)
              pushHistory(res.pollution) 
            }} 
          />
        </section>

        {/* Right Widget: Charts & Index Gauge */}
        <section className="glass-card">
          <Charts 
            history={history} 
            score={simResult ? simResult.sustainability : 100} 
          />
        </section>
      </main>

      {/* Bottom Visualization: Cityscape Vector Simulation */}
      <section className="glass-card">
        <CityView 
          pollution={simResult ? simResult.pollution : 0} 
          trees={trees} 
          traffic={traffic} 
          renewable={renewable}
        />
      </section>

      {/* Footer copyright */}
      <footer className="text-center py-2 text-[10px] text-slate-600 font-semibold tracking-wider uppercase">
        © 2026 CityTwin Engineering Core. All rights reserved.
      </footer>
    </div>
  )
}
