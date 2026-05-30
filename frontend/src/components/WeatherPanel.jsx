import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function WeatherPanel() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    axios.get('/api/weather')
      .then(r => { if (mounted) setWeather(r.data) })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => mounted = false
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Syncing telemetry data...</p>
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border border-red-900/30 bg-red-950/15 rounded-xl p-4 text-center">
        <svg className="w-8 h-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm font-semibold text-red-400">Weather Telemetry Offline</p>
        <p className="text-xs text-red-500 mt-1">Unable to contact meteorological station API.</p>
      </div>
    )
  }

  function getAqiDescription(aqi) {
    if (aqi < 50) return { label: 'Optimal (Good)', color: 'text-green-400 bg-green-500/10 border-green-500/20' }
    if (aqi < 100) return { label: 'Moderate (Fair)', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' }
    if (aqi < 150) return { label: 'Unhealthy (Poor)', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' }
    return { label: 'Hazardous (Severe)', color: 'text-red-400 bg-red-500/10 border-red-500/20' }
  }

  const aqiInfo = getAqiDescription(weather.aqi)

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Live Weather Hub</h2>
          <div className="flex items-center space-x-1 mt-0.5">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-lg font-bold text-slate-200">{weather.city_name}</span>
          </div>
        </div>
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          {weather.temp > 25 ? (
            <svg className="w-8 h-8 text-amber-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 90H3m15.364-6.364l-.707-.707M6.343 17.657l-.707-.707m12.728 0l-.707.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex items-baseline space-x-1.5 py-2">
        <span className="text-4xl font-extrabold tracking-tight text-white">{weather.temp}</span>
        <span className="text-lg font-medium text-slate-400">°C</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-400 block mb-1">Humidity</span>
          <div className="flex items-center space-x-1.5">
            <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
            </svg>
            <span className="text-sm font-bold text-slate-200">{weather.humidity} %</span>
          </div>
        </div>
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-400 block mb-1">Wind Speed</span>
          <div className="flex items-center space-x-1.5">
            <svg className="w-4 h-4 text-teal-400 animate-spin" style={{ animationDuration: '6s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m0 0l-2-1m2 1v2.5M14 4h-4M4 7H3M12 12v3" />
            </svg>
            <span className="text-sm font-bold text-slate-200">{weather.wind} m/s</span>
          </div>
        </div>
      </div>

      <div className={`border rounded-xl p-3.5 flex flex-col space-y-1.5 transition-colors ${aqiInfo.color}`}>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold tracking-wider uppercase opacity-85">Air Quality Index</span>
          <span className="text-sm font-black">{weather.aqi} AQI</span>
        </div>
        <div className="text-xs font-semibold">{aqiInfo.label}</div>
        <div className="w-full bg-slate-900/60 rounded-full h-1.5 mt-1 overflow-hidden">
          <div 
            className="h-full rounded-full bg-current transition-all duration-500" 
            style={{ width: `${Math.min(100, (weather.aqi / 150) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
