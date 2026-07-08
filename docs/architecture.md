# RADIX Talent Match Architecture

- Frontend routing and shell are fixed and shared.
- Backend app mounts module routers under `/api`.
- Modules are isolated and communicate via REST APIs only.
- Shared model contracts are defined in `backend/app/models`.
- Local JSON persistence is isolated in `backend/app/utils/json_storage.py`.
