import React from 'react'
import { LineChart, Line, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, Tooltip, CartesianGrid, YAxis } from 'recharts'

export default function Charts({ history, score }) {
  // If we have history, use it. To render a line we need at least two points, 
  // so if there is only 1 point, we duplicate it temporarily so it draws a flat line.
  const lineData = history.length 
    ? (history.length === 1 ? [history[0], { ...history[0], index: 2 }] : history) 
    : [{ index: 1, pollution: 0 }, { index: 2, pollution: 0 }]

  const roundedScore = Math.round(score)
  
  function getScoreColor(s) {
    if (s >= 70) return '#10b981' // Emerald
    if (s >= 40) return '#f59e0b' // Amber
    return '#ef4444' // Red
  }

  const gaugeData = [{ 
    name: 'Score', 
    value: roundedScore, 
    fill: getScoreColor(roundedScore) 
  }]

  return (
    <div className="flex flex-col space-y-4 h-full justify-between">
      <div>
        <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Analytics & Sustainability</h2>
        <p className="text-xs text-slate-500 mt-0.5">Real-time indicators and score logs.</p>
      </div>

      {/* Line Chart for Pollution History */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Pollution Timeline</span>
        <div style={{ width: '100%', height: 110 }} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line 
                type="monotone" 
                dataKey="pollution" 
                stroke="#f43f5e" 
                strokeWidth={2}
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radial Bar Chart for Sustainability Index */}
      <div className="flex items-center space-x-6 bg-slate-950/20 border border-slate-900 rounded-xl p-3.5">
        <div className="relative flex items-center justify-center w-[120px] h-[120px]">
          <RadialBarChart 
            width={120} 
            height={120} 
            innerRadius="70%" 
            outerRadius="100%" 
            data={gaugeData} 
            startAngle={90} 
            endAngle={-270}
            cx="50%"
            cy="50%"
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" background={{ fill: '#1e293b' }} />
          </RadialBarChart>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl font-black text-white leading-none">{roundedScore}%</span>
            <span className="text-[8px] font-bold tracking-wider text-slate-500 uppercase mt-1">Eco Score</span>
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">Sustainability Eco-Score</span>
          <p className="text-xs font-semibold text-slate-300">
            {roundedScore >= 70 ? 'Optimal Efficiency' : roundedScore >= 40 ? 'Moderate Impact' : 'Critical Warning'}
          </p>
          <p className="text-[11px] text-slate-500 leading-normal">
            Calculated from clean grid mix, forestry levels, and low traffic rates.
          </p>
        </div>
      </div>
    </div>
  )
}
