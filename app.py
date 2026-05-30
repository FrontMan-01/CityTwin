from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import os
import time
import threading
from collections import defaultdict
from datetime import datetime, timezone

load_dotenv()

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])

CITY    = os.getenv('CITY_NAME', 'London')
OPENMETEO_LAT = float(os.getenv('OPENMETEO_LAT', '51.5085'))
OPENMETEO_LON = float(os.getenv('OPENMETEO_LON', '-0.1257'))
OPENMETEO_TIMEZONE = os.getenv('OPENMETEO_TIMEZONE', 'Europe/London')

_weather_cache = { 'data': None, 'timestamp': 0 }
CACHE_TTL = int(os.getenv('OPENMETEO_CACHE_TTL', '600'))  # 10 minutes
DAILY_API_LIMIT = int(os.getenv('DAILY_API_LIMIT', '10000'))
_request_counts = defaultdict(int)
_external_calls = defaultdict(int)
_weather_lock = threading.Lock()


def _client_key():
    forwarded_for = request.headers.get('X-Forwarded-For', '')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip() or request.remote_addr or 'unknown'
    return request.remote_addr or 'unknown'


def _today_key():
    return datetime.now(timezone.utc).strftime('%Y-%m-%d')


def _check_and_increment_external_call():
    day_key = _today_key()
    if _external_calls[day_key] + 2 > 10000:
        raise ValueError("Daily external API limit of 10,000 calls reached")
    _external_calls[day_key] += 2


@app.before_request
def enforce_daily_limit():
    client = _client_key()
    day_key = _today_key()
    bucket = f'{day_key}:{client}'
    _request_counts[bucket] += 1
    if _request_counts[bucket] > DAILY_API_LIMIT:
        return jsonify({'error': 'rate_limit_exceeded', 'detail': 'Daily API limit reached'}), 429


def _fetch_open_meteo_weather(lat, lon):
    weather_url = 'https://api.open-meteo.com/v1/forecast'
    response = requests.get(
        weather_url,
        params={
            'latitude': lat,
            'longitude': lon,
            'current': 'temperature_2m,wind_speed_10m,relative_humidity_2m',
            'timezone': OPENMETEO_TIMEZONE,
        },
        timeout=10,
    )
    response.raise_for_status()
    payload = response.json()
    current = payload.get('current') or {}
    temperature = current.get('temperature_2m')
    wind_speed = current.get('wind_speed_10m')
    humidity = current.get('relative_humidity_2m')
    if temperature is None or wind_speed is None or humidity is None:
        raise ValueError('Missing weather fields from Open-Meteo')
    return {
        'temp': float(temperature),
        'humidity': float(humidity),
        'wind': float(wind_speed),
        'wind_speed': float(wind_speed),
    }


def _fetch_open_meteo_aqi(lat, lon):
    air_quality_url = 'https://air-quality-api.open-meteo.com/v1/air-quality'
    response = requests.get(
        air_quality_url,
        params={
            'latitude': lat,
            'longitude': lon,
            'current': 'us_aqi',
            'timezone': OPENMETEO_TIMEZONE,
        },
        timeout=10,
    )
    response.raise_for_status()
    payload = response.json()
    current = payload.get('current') or {}
    us_aqi = current.get('us_aqi')
    if us_aqi is None:
        raise ValueError('Missing AQI field from Open-Meteo')
    # Normalize 0-500 AQI into the 30-150 range used by the frontend formulas.
    normalized = round(max(30.0, min(150.0, (float(us_aqi) / 500.0) * 120.0 + 30.0)))
    return int(normalized)

@app.route('/health')
@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/weather')
@app.route('/api/weather')
def get_weather():
    now = time.time()
    if _weather_cache['data'] and (now - _weather_cache['timestamp']) < CACHE_TTL:
        return jsonify(_weather_cache['data'])

    with _weather_lock:
        # Check cache again inside the lock
        now = time.time()
        if _weather_cache['data'] and (now - _weather_cache['timestamp']) < CACHE_TTL:
            return jsonify(_weather_cache['data'])

        try:
            _check_and_increment_external_call()
            lat, lon, resolved_city = OPENMETEO_LAT, OPENMETEO_LON, CITY
            weather = _fetch_open_meteo_weather(lat, lon)
            aqi = _fetch_open_meteo_aqi(lat, lon)
            
            result = {
                'temp':       weather['temp'],
                'humidity':   weather['humidity'],
                'wind':       weather['wind'],
                'wind_speed': weather['wind_speed'],
                'aqi':        aqi,
                'city_name':  resolved_city,
            }
            _weather_cache['data']      = result
            _weather_cache['timestamp'] = now
            return jsonify(result)
        except Exception as e:
            if _weather_cache['data']:
                # Stale-while-revalidate fallback: extend cache duration by 60 seconds
                # to prevent hammering the external API on subsequent requests
                _weather_cache['timestamp'] = now - CACHE_TTL + 60
                return jsonify(_weather_cache['data'])
            return jsonify({'error': 'weather_request_failed', 'detail': str(e)}), 502

@app.route('/simulate', methods=['POST'])
@app.route('/api/simulate', methods=['POST'])
def simulate():
    body       = request.get_json() or {}
    traffic    = float(body.get('traffic',   50))
    trees      = float(body.get('trees',     50))
    renewable  = float(body.get('renewable', 50))
    if not all(0 <= v <= 100 for v in [traffic, trees, renewable]):
        return jsonify({'error': 'Values must be 0-100'}), 400
    gw = get_weather()
    # get_weather may return (Response, status) or a Response — handle both
    if isinstance(gw, tuple):
        resp_obj = gw[0]
        weather = resp_obj.get_json()
    else:
        weather = gw.get_json()
    if isinstance(weather, dict) and weather.get('error'):
        return jsonify({'error': 'weather_unavailable', 'detail': weather}), 502
    aqi        = weather['aqi']
    def clamp(v): return max(0.0, min(100.0, v))
    pollution      = clamp(aqi*0.4 + traffic*0.5 - trees*0.3 - renewable*0.2)
    sustainability = clamp(100 - pollution*0.5 - traffic*0.2 + trees*0.3 + renewable*0.3)
    heat_island    = round(0.05*traffic - 0.03*trees, 1)
    energy_usage   = clamp(100 - renewable*0.8 + traffic*0.3)
    return jsonify({
        'pollution':      round(pollution, 1),
        'sustainability': round(sustainability, 1),
        'heat_island':    heat_island,
        'heat':           heat_island,
        'energy_usage':   round(energy_usage, 1),
        'energy':         round(energy_usage, 1),
    })

PRESETS = {
    'eco':        {'traffic': 20,  'trees': 80, 'renewable': 70},
    'industrial': {'traffic': 90,  'trees': 10, 'renewable':  5},
    'smart':      {'traffic': 50,  'trees': 60, 'renewable': 60},
}

@app.route('/presets/<mode>')
@app.route('/api/presets/<mode>')
def preset(mode):
    if mode not in PRESETS:
        return jsonify({'error': 'Unknown preset'}), 404
    params = PRESETS[mode]
    import json
    from flask import Request
    with app.test_request_context(
        '/simulate', method='POST',
        data=json.dumps(params),
        content_type='application/json'
    ):
        sim_res = simulate()
        if isinstance(sim_res, tuple):
            status_code = sim_res[1]
            if status_code >= 400:
                return sim_res
            sim = sim_res[0].get_json()
        else:
            sim = sim_res.get_json()
    return jsonify({'inputs': params, 'results': sim})


if __name__ == '__main__':
    app.run(debug=True, port=5000)