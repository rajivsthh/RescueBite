# RescueBite Backend

Minimal TypeScript + Express backend for local development.

Quick start

1. Change to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm run dev
```

The server listens on `PORT` (default `4000`) and exposes:
- `GET /api/health` — health check
- `GET /api/example` — example endpoint

Set environment variables by copying `.env.example` to `.env`.
