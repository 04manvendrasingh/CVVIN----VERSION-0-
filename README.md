# CVVIN — AI-Powered Mock Interview Platform

Monorepo delivering the requested MVP.

## Structure
- apps/web — React + Vite SPA (React Router)
- apps/api — FastAPI backend (mocked, in-memory)

## Run
- Web: cd apps/web && npm install && npm run dev
- API: cd apps/api && pip install -r requirements.txt && uvicorn app.main:app --reload

## Env
- apps/web/.env.example provides VITE_API_BASE (default http://localhost:8000)

## Routes (Web)
- /auth — Tabs [Log in] [Sign up], email/password + mock Google
- /profile/setup — skippable onboarding
- /profile — editable profile
- /dashboard — stats, quick actions, flagship CTA “Begin Full Mock”
- /analyze — Resume↔JD analysis controls
- /tech — Technical round (MCQ + Coding runner + proctor hooks)
- /hr — HR round (question prompts + transcript + proctor hooks)
- /feedback — Summary + proctor flags
- /mock/full — wizard explainer

## API (FastAPI)
See apps/api/app/main.py for endpoint contracts:
- GET /v1/health
- POST /v1/auth/exchange
- POST /v1/profile?user_id=
- POST /v1/resumes
- POST /v1/jds
- POST /v1/match
- POST /v1/questions/generate
- POST /v1/sessions
- POST /v1/mcq/next
- POST /v1/mcq/submit
- POST /v1/code/run
- POST /v1/hr/ask
- POST /v1/hr/ingest
- POST /v1/proctor/events
- GET  /v1/proctor/flags
- POST /v1/feedback/finalize

## Notes
- All state is in-memory/localStorage for MVP.
- The UI uses Poppins font and the exact palette: Background #E7ECEF, Primary #274C77, Secondary #6096BA, Accent #A3CEF1, Muted #8B8C89.
- Extend endpoints or replace with real services later as needed.
