# Mini Smart City Frontend

This is a minimal React + Vite frontend for the Mini Smart City project.

Quick start:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:5000`.

Endpoints used by the app:
- `GET /api/health`
- `GET /api/weather`
- `POST /api/simulate`
- `GET /api/presets/<mode>`
