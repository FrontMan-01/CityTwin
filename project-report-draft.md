# Mini Smart City Digital Twin

## Project Overview and Introduction

**Project Title:** Mini Smart City Digital Twin  
**Team Members:** [Add Team Member 1], [Add Team Member 2]  
**University/Organization:** [Add University or Organization Name]

Urban areas face rising pressure from traffic congestion, air pollution, energy demand, and climate stress. City planning teams often need to make decisions quickly, but available data is usually fragmented across different systems and is hard to visualize in a practical way. Our project, the Mini Smart City Digital Twin, addresses this by creating a compact simulation platform that combines live environmental inputs with controllable urban variables. The goal is to help users understand how policy and infrastructure choices can affect city health and sustainability.

The solution is built as a two-layer system. The backend is developed in Python with Flask and exposes REST APIs for health checks, weather retrieval, simulation, and preset scenarios. The frontend (React-based) consumes these APIs and presents a dashboard with interactive controls, charts, and city state indicators. The current implementation fetches live weather and air quality signals through Open-Meteo endpoints, then runs simulation formulas to estimate pollution, sustainability, heat-island effect, and energy usage.

The project directly supports multiple Sustainable Development Goals (SDGs):
- **SDG 11 (Sustainable Cities and Communities):** by modeling cleaner transport and greener infrastructure choices.
- **SDG 13 (Climate Action):** by helping users evaluate impact of emission-related decisions.
- **SDG 7 (Affordable and Clean Energy):** by incorporating renewable energy influence into energy usage and sustainability scoring.

Overall, this digital twin is designed as an educational and decision-support prototype. It makes abstract urban sustainability trade-offs visible and measurable in real time.

## Problem Statement and Objectives

### Problem Statement

Modern city challenges are interconnected. Increased traffic raises emissions and heat. Reduced green cover worsens air quality and local temperature. Low renewable adoption increases long-term energy and environmental costs. In many contexts, decision makers and students can access raw weather data, but they lack a simple, integrated tool to test “what-if” scenarios and immediately observe outcome trends.

The core problem we address is this: **How can we provide a practical, interactive, and data-backed way to understand the effects of urban planning variables on environmental and sustainability outcomes?**

### Objectives

1. Build a backend API service that can:
   - Return service health status.
   - Provide normalized weather and AQI data in a frontend-friendly JSON format.
   - Compute simulation outputs from user-defined urban factors.
   - Provide predefined preset scenarios for fast comparison.

2. Ensure frontend compatibility by exposing stable endpoints and consistent response keys so charting and dashboard components can consume data without custom workarounds.

3. Include caching and request-limiting safeguards to improve reliability and reduce external API pressure.

4. Keep deployment simple for demonstration use, while maintaining clean code and clear environment-based configuration.

5. Demonstrate a meaningful relationship between user controls (traffic, trees, renewables) and output metrics (pollution, sustainability, heat, energy).

## Proposed Solution

Our proposed solution is a lightweight digital twin platform with clear separation of concerns between data/simulation logic (backend) and visualization/interaction (frontend).

### System Design

- **Backend:** Flask-based API service running on port 5000.
- **Frontend:** React app (through Vite proxy) consuming `/api/*` endpoints.
- **External Data Source:** Open-Meteo weather and air-quality APIs.
- **Configuration:** Environment-driven values (`CITY_NAME`, latitude, longitude, timezone, cache TTL).

### API Endpoints

The backend currently supports:
- `GET /api/health` for service status.
- `GET /api/weather` for weather and AQI summary.
- `POST /api/simulate` for simulation computations.
- `GET /api/presets/<mode>` for preset input-output combinations.

To maintain frontend compatibility, outputs include expected aliases such as `wind` and `wind_speed`, `heat` and `heat_island`, `energy` and `energy_usage`.

### Simulation Logic

The simulation layer uses weighted formulas and value clamping to generate interpretable outputs between 0 and 100 where appropriate. Inputs are constrained to valid ranges to prevent invalid states. This balances simplicity and meaningful behavior:
- Higher traffic tends to increase pollution and energy usage.
- Higher tree cover reduces pollution and heat-island effect.
- Higher renewable adoption improves sustainability and lowers energy pressure.

### Reliability and Security-Oriented Features

- **Caching:** Weather results are cached for a configurable TTL to reduce repeated external calls.
- **Input validation:** Simulation inputs must stay within 0–100.
- **Daily request limiting:** A per-client daily cap is implemented to prevent abuse in demo environments.
- **Error handling:** Upstream failures are translated into controlled API responses so the frontend can handle failures gracefully.

### Innovation and Value

The innovation is not in building a massive urban platform, but in creating a compact, understandable, and extensible model that bridges live environmental context with user-controlled policy variables. This makes the prototype useful for classroom demos, hackathons, and early-stage planning conversations.

## Results and Feasibility

### Current Results

The backend implementation was validated through compilation checks, mocked endpoint tests, and live endpoint checks. The API contract aligns with frontend expectations, and simulation endpoints return structured JSON suitable for cards, charts, and comparative views. The switch to Open-Meteo removed dependency on the previously failing key-based weather provider and stabilized live weather access for the prototype.

The project now demonstrates:
- Live city weather + AQI ingestion.
- Real-time simulation responses to user inputs.
- Preset-based scenario testing (eco, industrial, smart).
- Frontend-compatible response structure for integration.

### Feasibility

The solution is technically feasible for prototype and educational deployment because:
- It uses common and lightweight technologies (Flask, React, REST, JSON).
- It has low infrastructure requirements.
- Configuration is environment-driven and easy to adjust.
- The architecture allows future expansion without major redesign.

### Potential Impact

This project can support awareness and better decision framing around sustainability trade-offs. It enables users to connect policy ideas with measurable outcomes in a visual and interactive way. Even at prototype scale, it can help teams communicate climate and urban planning concepts more effectively.

### Future Improvements

1. Replace in-memory rate limiting with Redis-backed distributed limits for production.
2. Add persistent scenario history and analytics.
3. Introduce multi-city comparison and map-based overlays.
4. Add model calibration using historical city datasets.
5. Harden deployment using production WSGI setup and observability tooling.

### Support and References

No external sponsorship is currently required for the core prototype. Public API references include:
- Open-Meteo Forecast API documentation
- Open-Meteo Air Quality API documentation
- Flask official documentation

This project is practical, extensible, and aligned with SDG-driven smart city objectives, while remaining simple enough to demonstrate clearly within hackathon and academic constraints.
