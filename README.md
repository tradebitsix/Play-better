# Play Better — Pool Locals (Monorepo)

Backend (Express + Postgres) and Frontend (Vite + React + Tailwind).

## Backend

### Env
Copy `backend/.env.example` to `backend/.env` and set:

- `DATABASE_URL` (Railway Postgres URL)
- `CORS_ORIGINS` (comma-separated; include your Vercel domain + local dev)

### Run locally
```bash
cd backend
npm install
# mac/linux:
export $(cat .env | xargs) 2>/dev/null || true
npm start
```

Health:
- `GET http://localhost:3000/api/health`

## Frontend

### Env
Copy `frontend/.env.example` to `frontend/.env` and set:

- `VITE_API_URL` (example: `http://localhost:3000` or your Railway backend URL)

### Run locally
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints (core)

- `GET /api/health`
- `GET /api/players` / `POST /api/players`
- `GET /api/tournaments` (list)
- `POST /api/tournaments/digital` (requires 8 `playerIds`)
- `POST /api/tournaments/live` (requires 8 `playerIds`, optional `venueName`)
- `GET /api/tournaments/:id`
- `POST /api/tournaments/:id/matches/:matchId/result`
- `POST /api/tournaments/:id/matches/:matchId/table`
- `GET /api/pings/stream?playerId=...` (SSE)
- `POST /api/pings`
- `GET /api/merch`

## Deployment notes

- Railway: set Root Directory to `backend`, Start Command: `npm start`
- Vercel: set Root Directory to `frontend`, build: `npm run build`, output: `dist`
