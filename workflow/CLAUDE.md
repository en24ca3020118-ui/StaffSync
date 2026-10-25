# CLAUDE.md — Agent Rules for StaffSync

You are building **StaffSync**, a MERN Human Resource Management app. Read in this order: `REQUIREMENTS.md` → `ARCHITECTURE.md` → `PLAN.md`. Then build following `PLAN.md` phase by phase.

## Golden Rules
1. **Keep it simple.** No microservices, no TypeScript, no Docker, no extra libraries beyond the approved list. Plain JavaScript (ES modules).
2. **Follow the spec exactly.** Folder names, route paths, field names and role names in `ARCHITECTURE.md` are the contract. Do not rename them.
3. **Finish one phase fully before the next.** After each phase, run the app/tests and tick the boxes in `PLAN.md`.
4. **Never leave the project broken.** The app must start with `npm run dev` in both `server/` and `client/` at the end of every phase.
5. **No placeholders or TODOs** in final code. Every button on the UI must work.

## Approved Stack (do not add others without need)
- Server: express, mongoose, jsonwebtoken, bcryptjs, cors, dotenv, express-validator, nodemon (dev), jest + supertest + mongodb-memory-server (dev)
- Client: react (Vite), react-router-dom, @reduxjs/toolkit, react-redux, axios, bootstrap, react-bootstrap

## Roles
Exactly three strings, used everywhere: `employee`, `manager`, `hr`.

## Coding Conventions
- Backend: `async/await` with try/catch via a shared `asyncHandler` wrapper. Controllers hold logic, routes only wire middleware → controller.
- Errors: throw/return `{ message }` JSON with correct status (400 validation, 401 no/invalid token, 403 wrong role, 404 not found, 500 server).
- Success responses return JSON data directly (object or array). Lists that paginate return `{ data, page, pages, total }`.
- Never return `password`. Use `select('-password')` and `toJSON` transform.
- Frontend: functional components + hooks only. One file per page in `pages/`, reusable pieces in `components/`. API calls only through `src/api/axios.js` instance (auto-attaches JWT, redirects to /login on 401).
- Use Bootstrap classes for layout/styling. Clean look: navbar + sidebar-free simple layout, cards for dashboards, tables for lists, badges for status, toasts/alerts for feedback.
- Use `React.lazy` + `Suspense` for page-level lazy loading.
- Dates stored as `Date`; attendance date stored as `YYYY-MM-DD` string for easy uniqueness.

## Security Checklist (must all be true)
- Passwords hashed with bcryptjs (10 rounds).
- JWT in `Authorization: Bearer <token>`, expiry 7d, secret from `.env`.
- `protect` middleware on all routes except `/api/auth/register` and `/api/auth/login`.
- `authorize(...roles)` middleware for role-restricted routes.
- Public registration always creates role `employee` (ignore any role sent by client).
- express-validator on register, login, leave apply, announcement create, user create.
- React `ProtectedRoute` checks login + allowed roles.

## Environment
`server/.env` (create from `.env.example`):
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/staffsync
JWT_SECRET=change_this_secret
CLIENT_URL=http://localhost:5173
```
`client/.env`: `VITE_API_URL=http://localhost:5000/api`

## Commands
```
cd server && npm install && npm run seed && npm run dev   # API on :5000
cd server && npm test                                     # backend tests
cd client && npm install && npm run dev                   # UI on :5173
```

## Definition of Done
All items in `REQUIREMENTS.md` "Acceptance Checklist" pass, all `PLAN.md` boxes are ticked, `npm test` passes, and README setup steps work from a clean clone.
