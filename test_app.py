import unittest
from unittest.mock import patch, MagicMock
import json
import time
from datetime import datetime, timezone
import sys
import os

# Append the backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, _weather_cache, _request_counts, DAILY_API_LIMIT, _external_calls

class SmartCityBackendTests(unittest.TestCase):

    def setUp(self):
        # Configure the flask app for testing
        self.app = app.test_client()
        self.app.testing = True
        
        # Reset caches and mock states
        _weather_cache['data'] = None
        _weather_cache['timestamp'] = 0
        _request_counts.clear()
        _external_calls.clear()

    @patch('app._fetch_open_meteo_weather')
    @patch('app._fetch_open_meteo_aqi')
    def test_health_endpoint(self, mock_aqi, mock_weather):
        response = self.app.get('/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {'status': 'ok'})

        response_api = self.app.get('/api/health')
        self.assertEqual(response_api.status_code, 200)
        self.assertEqual(response_api.get_json(), {'status': 'ok'})

    @patch('app._fetch_open_meteo_weather')
    @patch('app._fetch_open_meteo_aqi')
    def test_weather_endpoint_success(self, mock_aqi, mock_weather):
        # Set up mock returns
        mock_weather.return_value = {
            'temp': 20.5,
            'humidity': 60.0,
            'wind': 10.0,
            'wind_speed': 10.0
        }
        mock_aqi.return_value = 45 # Good normalized AQI

        response = self.app.get('/weather')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['temp'], 20.5)
        self.assertEqual(data['humidity'], 60.0)
        self.assertEqual(data['wind_speed'], 10.0)
        self.assertEqual(data['aqi'], 45)
        self.assertEqual(data['city_name'], 'London')

        # Check caching - second call should not call the mock functions again
        mock_weather.reset_mock()
        mock_aqi.reset_mock()
        
        response2 = self.app.get('/weather')
        self.assertEqual(response2.status_code, 200)
        mock_weather.assert_not_called()
        mock_aqi.assert_not_called()

    @patch('app._fetch_open_meteo_weather')
    @patch('app._fetch_open_meteo_aqi')
    def test_weather_endpoint_failure(self, mock_aqi, mock_weather):
        # Mock raises an exception
        mock_weather.side_effect = Exception("API Connection Timeout")
        
        response = self.app.get('/weather')
        self.assertEqual(response.status_code, 502)
        data = response.get_json()
        self.assertEqual(data['error'], 'weather_request_failed')
        self.assertIn('API Connection Timeout', data['detail'])

    @patch('app._fetch_open_meteo_weather')
    @patch('app._fetch_open_meteo_aqi')
    def test_simulate_endpoint_success(self, mock_aqi, mock_weather):
        mock_weather.return_value = {
            'temp': 15.0,
            'humidity': 50.0,
            'wind': 5.0,
            'wind_speed': 5.0
        }
        mock_aqi.return_value = 50

        # Simulate with body values
        payload = {
            'traffic': 40,
            'trees': 70,
            'renewable': 60
        }
        response = self.app.post('/simulate', 
                                 data=json.dumps(payload),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        
        # Validate keys in response
        self.assertIn('pollution', data)
        self.assertIn('sustainability', data)
        self.assertIn('heat_island', data)
        self.assertIn('energy_usage', data)

        # Let's double check formula calculations:
        # aqi = 50
        # pollution = clamp(50*0.4 + 40*0.5 - 70*0.3 - 60*0.2)
        #            = clamp(20 + 20 - 21 - 12) = clamp(7) = 7.0
        # sustainability = clamp(100 - 7*0.5 - 40*0.2 + 70*0.3 + 60*0.3)
        #                = clamp(100 - 3.5 - 8 + 21 + 18) = clamp(127.5) = 100.0
        # heat_island = round(0.05*40 - 0.03*70, 1) = round(2.0 - 2.1, 1) = -0.1
        # energy_usage = clamp(100 - 60*0.8 + 40*0.3) = clamp(100 - 48 + 12) = 64.0
        self.assertEqual(data['pollution'], 7.0)
        self.assertEqual(data['sustainability'], 100.0)
        self.assertEqual(data['heat_island'], -0.1)
        self.assertEqual(data['energy_usage'], 64.0)

    def test_simulate_endpoint_validation(self):
        # Test values out of range (0-100)
        payload = {
            'traffic': 150,
            'trees': 50,
            'renewable': 50
        }
        response = self.app.post('/simulate', 
                                 data=json.dumps(payload),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()['error'], 'Values must be 0-100')

    @patch('app._fetch_open_meteo_weather')
    @patch('app._fetch_open_meteo_aqi')
    def test_preset_endpoint_success(self, mock_aqi, mock_weather):
        mock_weather.return_value = {
            'temp': 15.0,
            'humidity': 50.0,
            'wind': 5.0,
            'wind_speed': 5.0
        }
        mock_aqi.return_value = 50

        response = self.app.get('/presets/eco')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['inputs']['traffic'], 20)
        self.assertEqual(data['inputs']['trees'], 80)
        self.assertEqual(data['inputs']['renewable'], 70)
        self.assertIn('results', data)

    def test_preset_endpoint_not_found(self):
        response = self.app.get('/presets/invalid_preset')
        self.assertEqual(response.status_code, 404)

    @patch('app._fetch_open_meteo_weather')
    @patch('app._fetch_open_meteo_aqi')
    def test_preset_endpoint_failure(self, mock_aqi, mock_weather):
        # Force get_weather to fail, which simulate will call and it will return a 502 error
        mock_weather.side_effect = Exception("Open-Meteo is unreachable")
        
        response = self.app.get('/presets/eco')
        # Should propagate the status code 502 from simulate() failure
        self.assertEqual(response.status_code, 502)
        data = response.get_json()
        self.assertEqual(data['error'], 'weather_unavailable')


    @patch('app._fetch_open_meteo_weather')
    @patch('app._fetch_open_meteo_aqi')
    def test_rate_limiting_enforced(self, mock_aqi, mock_weather):
        mock_weather.return_value = {
            'temp': 15.0,
            'humidity': 50.0,
            'wind': 5.0,
            'wind_speed': 5.0
        }
        mock_aqi.return_value = 50

        # We can temporarily patch/set DAILY_API_LIMIT to a low value, like 3
        with patch('app.DAILY_API_LIMIT', 3):
            # 1st request
            response = self.app.get('/health')
            self.assertEqual(response.status_code, 200)
            # 2nd request
            response = self.app.get('/health')
            self.assertEqual(response.status_code, 200)
            # 3rd request
            response = self.app.get('/health')
            self.assertEqual(response.status_code, 200)
            # 4th request -> Should trigger rate limit
            response = self.app.get('/health')
            self.assertEqual(response.status_code, 429)
            self.assertEqual(response.get_json()['error'], 'rate_limit_exceeded')

    @patch('app._fetch_open_meteo_weather')
    @patch('app._fetch_open_meteo_aqi')
    def test_stale_cache_fallback(self, mock_aqi, mock_weather):
        # 1. Populates the cache successfully first
        mock_weather.return_value = {
            'temp': 22.0,
            'humidity': 55.0,
            'wind': 8.0,
            'wind_speed': 8.0
        }
        mock_aqi.return_value = 60
        response = self.app.get('/weather')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['temp'], 22.0)

        # 2. Force cache expiration (simulate time passing)
        from app import CACHE_TTL
        _weather_cache['timestamp'] = time.time() - CACHE_TTL - 1

        # 3. Mock failure for the subsequent call
        mock_weather.side_effect = Exception("Open-Meteo is down")
        
        # 4. Request weather again -> Should fall back to stale cache data instead of throwing 502
        response2 = self.app.get('/weather')
        self.assertEqual(response2.status_code, 200)
        data = response2.get_json()
        self.assertEqual(data['temp'], 22.0)
        
        # 5. Check that cache timestamp was extended (it should be now - CACHE_TTL + 60, i.e. still within the grace period)
        mock_weather.reset_mock()
        response3 = self.app.get('/weather')
        self.assertEqual(response3.status_code, 200)
        mock_weather.assert_not_called() # Should not call external API again because we extended TTL

    def test_external_api_calls_rate_limiting(self):
        from app import _today_key
        # Simulate that we've already done 10,000 calls today
        day_key = _today_key()
        _external_calls[day_key] = 10000

        # Now get_weather should fail with a ValueError due to rate limit reached
        with patch('app._fetch_open_meteo_weather') as mock_w, patch('app._fetch_open_meteo_aqi') as mock_a:
            mock_w.return_value = {'temp': 20, 'humidity': 50, 'wind': 5, 'wind_speed': 5}
            mock_a.return_value = 50
            
            response = self.app.get('/weather')
            # Since cache is empty and limit is hit, it will throw an exception and return 502
            self.assertEqual(response.status_code, 502)
            data = response.get_json()
            self.assertIn("Daily external API limit of 10,000 calls reached", data['detail'])

    @patch('app._fetch_open_meteo_weather')
    @patch('app._fetch_open_meteo_aqi')
    def test_cache_stampede_concurrency(self, mock_aqi, mock_weather):
        import threading
        
        mock_weather.return_value = {
            'temp': 25.0,
            'humidity': 40.0,
            'wind': 12.0,
            'wind_speed': 12.0
        }
        mock_aqi.return_value = 75

        # We will spin up multiple threads to hit the weather endpoint concurrently
        results = []
        barrier = threading.Barrier(5)

        def make_request():
            barrier.wait() # Synchronize threads starting
            # In testing, app context is thread local, so we run inside a thread local request client
            with app.test_client() as client:
                res = client.get('/weather')
                results.append(res)

        threads = [threading.Thread(target=make_request) for _ in range(5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        # All threads should have succeeded
        for res in results:
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.get_json()['temp'], 25.0)

        # But the external fetch mocks should have only been called once because of locking
        self.assertEqual(mock_weather.call_count, 1)
        self.assertEqual(mock_aqi.call_count, 1)

if __name__ == '__main__':
    unittest.main()
