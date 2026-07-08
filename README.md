# RADIX Talent Match

Production-ready modular hiring platform with a React frontend and FastAPI backend.

## Tech Stack
- Frontend: React (Vite), React Router, Axios, Tailwind CSS, Framer Motion, React Icons
- Backend: FastAPI, modular Python architecture, local JSON storage

## Repository Structure

- `/frontend` — UI app with stable routing, layout, and module pages
- `/backend` — modular backend with isolated module folders
- `/docs` — architecture notes

## Modules

Implemented:
- ✅ Profile Builder (full frontend + backend + JSON persistence)

Placeholders (HTTP 501):
- JD Analytics
- Resume Parser
- Talent Check
- Skill Matching

## Frontend setup
```bash
cd frontend
npm install
npm run dev
```

## Backend setup
```bash
cd backend
pip install -r ../requirements.txt
uvicorn app.main:app --reload
```

## Profile Builder Features
- Candidate details management
- Dynamic add/remove fields
- Editable skill chips
- Resume and photo drag-and-drop upload
- Autosave
- Save/Load/Update/Delete profile
- Profile preview
- Resume parser integration with graceful fallback when unavailable

## Team Integration Rules
Developers should only modify:
- `backend/app/modules/jd_analytics/`
- `backend/app/modules/resume_parser/`
- `backend/app/modules/profile_builder/`
- `backend/app/modules/talent_check/`
- `backend/app/modules/skill_matching/`

Core app structure, routing, layouts, and navigation are stable and should remain unchanged.
