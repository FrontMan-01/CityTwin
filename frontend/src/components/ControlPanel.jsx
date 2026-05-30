import React, { useRef, useCallback } from 'react'
import axios from 'axios'

export default function ControlPanel({ 
  setSimResult, 
  traffic, setTraffic, 
  trees, setTrees, 
  renewable, setRenewable 
}) {
  const debounceRef = useRef(null)

  const callSimulate = useCallback((t, tr, r) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      axios.post('/api/simulate', { traffic: t, trees: tr, renewable: r })
        .then(res => setSimResult(res.data))
        .catch(() => {})
    }, 300)
  }, [setSimResult])

  const onChange = (setter, val) => {
    setter(val)
    callSimulate(
      setter === setTraffic ? val : traffic,
      setter === setTrees ? val : trees,
      setter === setRenewable ? val : renewable
    )
  }

  const applyPreset = (mode) => {
    axios.get(`/api/presets/${mode}`).then(r => {
      const { inputs, results } = r.data
      setTraffic(inputs.traffic)
      setTrees(inputs.trees)
      setRenewable(inputs.renewable)
      setSimResult(results)
    }).catch(() => {})
  }

  return (
    <div className="flex flex-col space-y-5">
      <div>
        <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Urban Controls</h2>
        <p className="text-xs text-slate-500 mt-0.5">Tweak parameters to alter city ecology.</p>
      </div>

      <div className="space-y-4">
        {/* Traffic Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Traffic Density
            </span>
            <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">{traffic}%</span>
          </div>
          <input 
            id="traffic-slider"
            type="range" 
            min="0" 
            max="100" 
            value={traffic} 
            onChange={e => onChange(setTraffic, Number(e.target.value))} 
            className="accent-rose-500 hover:accent-rose-400"
          />
        </div>

        {/* Trees Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Urban Green Spaces
            </span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">{trees}%</span>
          </div>
          <input 
            id="trees-slider"
            type="range" 
            min="0" 
            max="100" 
            value={trees} 
            onChange={e => onChange(setTrees, Number(e.target.value))} 
            className="accent-emerald-500 hover:accent-emerald-400"
          />
        </div>

        {/* Renewable Energy Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Renewable Energy
            </span>
            <span className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">{renewable}%</span>
          </div>
          <input 
            id="renewable-slider"
            type="range" 
            min="0" 
            max="100" 
            value={renewable} 
            onChange={e => onChange(setRenewable, Number(e.target.value))} 
            className="accent-cyan-500 hover:accent-cyan-400"
          />
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80">
        <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-2">Simulation Presets</span>
        <div className="grid grid-cols-3 gap-2">
          <button 
            id="btn-preset-eco"
            onClick={() => applyPreset('eco')} 
            className="px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/25 active:scale-95 transition-all duration-150"
          >
            Eco City
          </button>
          <button 
            id="btn-preset-industrial"
            onClick={() => applyPreset('industrial')} 
            className="px-3 py-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/25 active:scale-95 transition-all duration-150"
          >
            Industrial
          </button>
          <button 
            id="btn-preset-smart"
            onClick={() => applyPreset('smart')} 
            className="px-3 py-1.5 text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/25 active:scale-95 transition-all duration-150"
          >
            Smart Twin
          </button>
        </div>
      </div>
    </div>
  )
}
