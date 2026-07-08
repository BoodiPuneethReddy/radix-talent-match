# RADIX Talent Match

A production-ready modular full-stack project for talent workflows built for parallel team development.

## Tech Stack

### Frontend
- React (Vite)
- React Router
- Axios
- Tailwind CSS
- Framer Motion
- React Icons

### Backend
- FastAPI
- Python
- Modular REST APIs
- Local JSON storage (replaceable later)

## Stable Team Architecture

Teammates should only modify module folders:

- `/backend/app/modules/jd_analytics/`
- `/backend/app/modules/resume_parser/`
- `/backend/app/modules/profile_builder/`
- `/backend/app/modules/talent_check/`
- `/backend/app/modules/skill_matching/`

Shared routing/layout/navigation remain stable.

## Project Structure

```text
frontend/
  src/
    components/
    layouts/
    pages/
      Dashboard/
      JDAnalytics/
      ResumeParser/
      ProfileBuilder/
      TalentCheck/
      SkillMatching/
      Settings/
    services/
    hooks/
    assets/
    App.jsx
    main.jsx
backend/
  app/
    api/
    modules/
      jd_analytics/
      resume_parser/
      profile_builder/
      talent_check/
      skill_matching/
    models/
    utils/
    data/
    main.py
docs/
```

## Modules Status

- Dashboard: implemented
- JD Analytics: placeholder (HTTP 501)
- Resume Parser: placeholder (HTTP 501)
- Profile Builder: fully implemented
- Talent Check: placeholder (HTTP 501)
- Skill Matching: placeholder (HTTP 501)

## Run Locally

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r ../requirements.txt
uvicorn app.main:app --reload
```

## Profile Builder Features

- Candidate profile form with validation
- Dynamic add/remove list fields
- Editable chips for skills and languages
- Resume/photo drag-drop upload UX
- Smart resume analyze fallback behavior
- Autosave to local storage
- Save/load/update/delete via REST APIs
- Profile preview panel

## API Overview

- `GET /health`
- `GET /api/profile-builder/profile`
- `POST /api/profile-builder/profile`
- `PUT /api/profile-builder/profile`
- `DELETE /api/profile-builder/profile`
- `POST /api/resume/analyze` (placeholder returns 501)
- Placeholder endpoints for other modules return 501.
