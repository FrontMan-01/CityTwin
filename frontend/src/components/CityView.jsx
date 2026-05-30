import React from 'react'

export default function CityView({ pollution = 0, trees = 50, traffic = 50, renewable = 50 }) {
  // Normalize parameters
  const fogOpacity = Math.min(0.65, pollution / 200) // Caps fog opacity so city remains visible
  const treeCount = Math.min(12, Math.floor((trees / 100) * 12)) // Max 12 detailed trees
  const activeTurbines = Math.min(3, Math.floor((renewable / 100) * 3) + 1) // 1 to 3 turbines active

  // Calculate sky gradient based on pollution
  const skyFactor = pollution / 100
  const rSky = Math.round(15 + skyFactor * 80)
  const gSky = Math.round(23 - skyFactor * 10)
  const bSky = Math.round(42 - skyFactor * 25)
  const skyColor = `rgb(${rSky}, ${gSky}, ${bSky})`
  const horizonColor = `rgb(${rSky + 15}, ${gSky + 20}, ${bSky + 10})`

  // Turbine blade animation speed (faster renewable = faster spin)
  const turbineDuration = renewable > 5 ? `${Math.max(0.8, 10 - (renewable / 100) * 9)}s` : '0s'

  // Car animation speed (higher traffic = faster movement or bumper-to-bumper if extreme)
  const carDuration = traffic > 0 ? `${Math.max(3, 12 - (traffic / 100) * 8)}s` : '0s'
  const carCount = Math.min(6, Math.floor((traffic / 100) * 6) + 1)

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Cityscape Digital Twin</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time vector feedback of environmental parameters.</p>
        </div>
        <div className="flex space-x-4 text-[10px] font-bold text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            <span>Forestry: {Math.round(trees)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full"></span>
            <span>Grid Cleanliness: {Math.round(renewable)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
            <span>Smog Index: {Math.round(pollution)}%</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950 shadow-inner">
        <svg 
          viewBox="0 0 760 280" 
          className="w-full h-auto block select-none"
          style={{
            '--turbine-speed': turbineDuration,
            '--car-speed': carDuration
          }}
        >
          <defs>
            {/* Sky Gradient */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={skyColor} />
              <stop offset="100%" stopColor={horizonColor} />
            </linearGradient>

            {/* Glowing Spire Light */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Clouds Overlay */}
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(253, 224, 71, 0.2)" />
              <stop offset="100%" stopColor="rgba(253, 224, 71, 0)" />
            </radialGradient>
          </defs>

          {/* Sky background */}
          <rect x="0" y="0" width="760" height="200" fill="url(#skyGrad)" />
          
          {/* Sun Glow (fades with higher pollution) */}
          <circle cx="650" cy="60" r="100" fill="url(#sunGlow)" opacity={Math.max(0, 1 - pollution / 80)} />
          <circle cx="650" cy="60" r="15" fill="#fde047" opacity={Math.max(0.1, 1 - pollution / 60)} />

          {/* Distant Hills / Background ground */}
          <path d="M 0 200 Q 150 170 320 195 T 640 185 T 760 200 L 760 200 L 0 200 Z" fill="#141c2e" />

          {/* Wind Turbines (Renewable Energy Visualizers) */}
          {[...Array(3)].map((_, i) => {
            const x = 120 + i * 240
            const y = 190 - (i % 2) * 10
            const turbineCx = x
            const turbineCy = y - 60
            const active = i < activeTurbines && renewable > 5

            return (
              <g key={i} className="transition-opacity duration-500" opacity={active ? 1 : 0.25}>
                {/* Tower Support */}
                <path d={`M ${x-3} ${y} L ${x-1} ${y-60} L ${x+1} ${y-60} L ${x+3} ${y} Z`} fill="#475569" />
                <circle cx={x} cy={y-60} r="4" fill="#64748b" />
                
                {/* Rotating Blades */}
                <g 
                  className={active ? "spin-turbine" : ""} 
                  style={{
                    '--turbine-cx': `${turbineCx}px`,
                    '--turbine-cy': `${turbineCy}px`
                  }}
                >
                  <line x1={turbineCx} y1={turbineCy} x2={turbineCx} y2={turbineCy - 28} stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1={turbineCx} y1={turbineCy} x2={turbineCx - 24} y2={turbineCy + 14} stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1={turbineCx} y1={turbineCy} x2={turbineCx + 24} y2={turbineCy + 14} stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              </g>
            )
          })}

          {/* Midground City Skyline (Illuminated Buildings) */}
          <g>
            {/* Building 1 */}
            <rect x="50" y="90" width="55" height="110" fill="#1e293b" stroke="#334155" rx="3" />
            <line x1="77" y1="90" x2="77" y2="70" stroke="#ef4444" strokeWidth="1.5" filter="url(#glow)" className="animate-pulse" />
            {/* Windows for Building 1 */}
            {[...Array(5)].map((_, r) => (
              <g key={r}>
                <rect x="60" y={105 + r * 16} width="12" height="8" fill={pollution > 60 && Math.random() > 0.4 ? "#475569" : "#fef08a"} opacity="0.85" rx="1" />
                <rect x="83" y={105 + r * 16} width="12" height="8" fill={pollution > 60 && Math.random() > 0.4 ? "#475569" : "#fef08a"} opacity="0.85" rx="1" />
              </g>
            ))}

            {/* Building 2 - Tower */}
            <rect x="180" y="60" width="70" height="140" fill="#0f172a" stroke="#1e293b" rx="4" />
            <line x1="215" y1="60" x2="215" y2="35" stroke="#38bdf8" strokeWidth="2" filter="url(#glow)" />
            {/* Grid Windows */}
            {[...Array(6)].map((_, r) => (
              <g key={r}>
                <rect x="192" y={75 + r * 18} width="10" height="10" fill={pollution > 50 && Math.random() > 0.5 ? "#1e293b" : "#67e8f9"} opacity="0.9" rx="1" />
                <rect x="210" y={75 + r * 18} width="10" height="10" fill={pollution > 50 && Math.random() > 0.5 ? "#1e293b" : "#67e8f9"} opacity="0.9" rx="1" />
                <rect x="228" y={75 + r * 18} width="10" height="10" fill={pollution > 50 && Math.random() > 0.5 ? "#1e293b" : "#67e8f9"} opacity="0.9" rx="1" />
              </g>
            ))}

            {/* Building 3 */}
            <rect x="340" y="80" width="60" height="120" fill="#1e293b" stroke="#334155" rx="3" />
            {[...Array(5)].map((_, r) => (
              <g key={r}>
                <rect x="350" y={95 + r * 18} width="15" height="10" fill={pollution > 70 && Math.random() > 0.4 ? "#334155" : "#fbcfe8"} opacity="0.8" rx="1" />
                <rect x="375" y={95 + r * 18} width="15" height="10" fill={pollution > 70 && Math.random() > 0.4 ? "#334155" : "#fef08a"} opacity="0.8" rx="1" />
              </g>
            ))}

            {/* Building 4 - Smart Glass Tower */}
            <rect x="460" y="40" width="75" height="160" fill="#0f172a" stroke="#0ea5e9" strokeWidth="0.5" rx="4" />
            <path d="M 460 40 L 535 200" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.3" />
            <path d="M 535 40 L 460 200" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.3" />
            <circle cx="497.5" cy="40" r="3" fill="#22c55e" filter="url(#glow)" className="animate-ping" style={{ animationDuration: '3s' }} />
            {[...Array(7)].map((_, r) => (
              <g key={r}>
                <rect x="472" y={55 + r * 18} width="12" height="10" fill={pollution > 60 && Math.random() > 0.5 ? "#1e293b" : "#38bdf8"} opacity="0.7" rx="1" />
                <rect x="491" y={55 + r * 18} width="12" height="10" fill={pollution > 60 && Math.random() > 0.5 ? "#1e293b" : "#38bdf8"} opacity="0.7" rx="1" />
                <rect x="510" y={55 + r * 18} width="12" height="10" fill={pollution > 60 && Math.random() > 0.5 ? "#1e293b" : "#38bdf8"} opacity="0.7" rx="1" />
              </g>
            ))}

            {/* Building 5 */}
            <rect x="610" y="100" width="60" height="100" fill="#1e293b" stroke="#334155" rx="3" />
            {[...Array(4)].map((_, r) => (
              <g key={r}>
                <rect x="622" y={115 + r * 18} width="14" height="9" fill={pollution > 70 && Math.random() > 0.3 ? "#475569" : "#fef08a"} opacity="0.85" rx="1" />
                <rect x="644" y={115 + r * 18} width="14" height="9" fill={pollution > 70 && Math.random() > 0.3 ? "#475569" : "#fef08a"} opacity="0.85" rx="1" />
              </g>
            ))}
          </g>

          {/* Grass & Sidewalk (Urban Green Space area) */}
          <rect x="0" y="200" width="760" height="30" fill="#0f1c12" />
          <line x1="0" y1="200" x2="760" y2="200" stroke="#16a34a" strokeWidth="2.5" />

          {/* Forestry / Trees (Dynamically updated via slider) */}
          <g>
            {[...Array(treeCount)].map((_, i) => {
              const xPos = 35 + i * 62 + (i % 3) * 8
              return (
                <g key={i} className="transition-all duration-500">
                  {/* Trunk */}
                  <rect x={xPos - 1.5} y="188" width="3" height="14" fill="#78350f" />
                  {/* Foliage */}
                  <circle cx={xPos} cy="184" r="8" fill="#15803d" />
                  <circle cx={xPos - 4} cy="180" r="6" fill="#16a34a" />
                  <circle cx={xPos + 4} cy="181" r="5" fill="#15803d" />
                </g>
              )
            })}
          </g>

          {/* Road Infrastructure */}
          <rect x="0" y="230" width="760" height="50" fill="#0f172a" />
          
          {/* Curb / Sidewalk edge */}
          <line x1="0" y1="230" x2="760" y2="230" stroke="#475569" strokeWidth="1.5" />
          
          {/* Lanes divider line */}
          <line x1="0" y1="255" x2="760" y2="255" stroke="#e2e8f0" strokeDasharray="12 12" strokeWidth="1.5" opacity="0.3" />

          {/* Animated Vehicles (Dynamically updated via traffic density) */}
          {traffic > 5 && (
            <g>
              {[...Array(carCount)].map((_, i) => {
                // Stagger starting positions and delays
                const delay = `${i * -1.8}s`
                const yPos = i % 2 === 0 ? 236 : 260
                const carColor = i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#0ea5e9' : '#eab308'

                return (
                  <g 
                    key={i} 
                    className="drive-car-anim" 
                    style={{ 
                      '--car-speed': carDuration, 
                      animationDelay: delay 
                    }}
                  >
                    {/* Car Body */}
                    <rect x="-40" y={yPos} width="22" height="10" fill={carColor} rx="2" />
                    {/* Car Roof */}
                    <rect x="-34" y={yPos - 4} width="11" height="5" fill={carColor} rx="1" />
                    {/* Wheels */}
                    <circle cx="-35" cy={yPos + 9} r="2.5" fill="#000" />
                    <circle cx="-23" cy={yPos + 9} r="2.5" fill="#000" />
                    {/* Headlight */}
                    <circle cx="-19.5" cy={yPos + 2.5} r="1" fill="#fef08a" />
                  </g>
                )
              })}
            </g>
          )}

          {/* Smog & Fog overlay (Pollution Visualizer) */}
          <rect 
            x="0" 
            y="0" 
            width="760" 
            height="280" 
            fill="rgba(190, 80, 50, 1)" 
            opacity={fogOpacity} 
            className="transition-opacity duration-500 pointer-events-none" 
          />
        </svg>
      </div>
    </div>
  )
}
