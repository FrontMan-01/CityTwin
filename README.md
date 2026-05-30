# Mini Smart City Digital Twin (CityTwin.OS)

An interactive, data-backed smart city simulation prototype that bridges live environmental context with user-controlled urban planning policy variables. This project evaluates real-world environmental trade-offs in real-time, helping users visualize the impacts of infrastructure decisions.

---

## 👥 Authors & Institution
*   **Developers:** Vishesh Mehta & Shweta Sharma
*   **Organization:** Karnavati University

---

## 🎯 Sustainable Development Goals (SDGs)
This prototype supports the modeling and education of key UN SDGs:
*   **SDG 11 (Sustainable Cities and Communities):** Models how cleaner transport and increased green cover reduce urban pollution and heat-island effects.
*   **SDG 13 (Climate Action):** Evaluates the direct impact of emission-related decisions on live sustainability ratings.
*   **SDG 7 (Affordable and Clean Energy):** Incorporates renewable energy adoption as a core driver for reducing energy demand.

---

## 🛠 Tech Stack & Versions

### Backend
*   **Language:** Python (3.12+ recommended, tested up to Python 3.14)
*   **Framework:** Flask 3.1.3
*   **Libraries:** Flask-CORS 6.0.2, requests 2.34.2, python-dotenv 1.2.2
*   **External Data Integration:** Open-Meteo Forecast and Air Quality APIs (Key-free)

### Frontend
*   **Language/Build System:** Node.js (V18+ recommended) with React, Vite (5.0.0+), PostCSS, TailwindCSS (3.4.0)
*   **Libraries:** Axios (HTTP client), Recharts (data visualization), Tailwind CSS (styling)

---

## ⚙️ Key Technical Features
1.  **Live Weather Telemetry:** Collects actual temperature, humidity, wind speed, and air quality index (AQI) values.
2.  **In-Memory Caching:** Outfitted with safe caching (default: 10 minutes) and threading locks to prevent external API stampedes.
3.  **Daily Rate Limiting:** Safe per-client daily caps on api calls (configured via `DAILY_API_LIMIT`) returning `HTTP 429` errors if exceeded.
4.  **Stale Cache Fallback:** Automatically serves stale data temporarily if external telemetry sources are offline or timeouts occur.
5.  **Weighted Simulation Logic:** Translates traffic, trees, and renewable adoption levels into clamped metrics:
    *   `Pollution`
    *   `Sustainability Score`
    *   `Heat Island Effect`
    *   `Energy Usage`
6.  **Presets Handler:** Offers three comparative defaults out of the box: `eco`, `industrial`, and `smart`.

---

## 🚀 Setup & Local Installation

Follow these steps to run the project locally on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/FrontMan-01/CityTwin.git
cd CityTwin
```

---

### 2. Backend Setup

The backend directory contains the Flask server code (which sits in the root of the project).

#### A. Set up Virtual Environment
```bash
# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

#### B. Install Dependencies
```bash
pip install -r requirements.txt
```

#### C. Configure Environment Variables
Create a file named `.env` in the root folder (where `app.py` is located) and add the following:
```env
CITY_NAME=London
OPENMETEO_LAT=51.5085
OPENMETEO_LON=-0.1257
OPENMETEO_TIMEZONE=Europe/London
OPENMETEO_CACHE_TTL=600
DAILY_API_LIMIT=10000
```
*(You can customize coordinates and timezone values to match your preferred city)*

#### D. Start the Flask Server
```bash
python app.py
```
The server will run locally at `http://localhost:5000`.

---

### 3. Frontend Setup

The React frontend code is located inside the `frontend` subdirectory.

#### A. Navigate to Frontend Directory
```bash
cd frontend
```

#### B. Install Dependencies
```bash
npm install
```

#### C. Run the Development Server
```bash
npm run dev
```
The client app will launch at `http://localhost:3000`. The Vite development configuration contains a proxy mapping `/api/*` requests to the Flask server running on port `5000`.

---

### 🧪 Running Tests
To execute the backend test suite covering caching, concurrency, limits, and math formulas, run:
```bash
python test_app.py
```