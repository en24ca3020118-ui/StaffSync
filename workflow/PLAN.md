# PLAN.md — Build Order (tick `[x]` when done)

Build phases in order. After each phase: run it, fix errors, then continue.

## Phase 1 — Server foundation
- [x] `server/` init, install deps, `"type":"module"`, scripts (`dev`, `start`, `seed`, `test`)
- [x] `.env.example`, `config/db.js`, `app.js` (cors, json, `/api/health`), `server.js`
- [x] `asyncHandler`, `generateToken`, error + notFound middleware

## Phase 2 — Models & Auth
- [x] All 7 models with indexes (see ARCHITECTURE)
- [x] Password hashing (pre-save) + `matchPassword` method
- [x] `protect`, `authorize`, `validate` middleware
- [x] `/auth/register`, `/auth/login`, `/auth/me` (register also creates Employee doc with auto `employeeId`)
- [x] `seed.js`: 1 HR, 2 managers, 5 employees (assigned to managers), few leaves/attendance/announcements/trainings. All passwords `Password@123`

## Phase 3 — Core APIs
- [x] Users/Employee management (hr CRUD, managers list, team, profile, performance)
- [x] Attendance (check-in/out, my, today, team, all)
- [x] Leaves (apply with overlap check, my, team, all, decision + notification)
- [x] Announcements CRUD + notifications to all active users
- [x] Trainings CRUD + enroll + notifications
- [x] Notifications list / read-all
- [x] Reports summary + `/dashboard`
- [x] Pagination helper used on list endpoints

## Phase 4 — Backend tests (jest + supertest + mongodb-memory-server)
- [x] Auth: register, login success/fail, protected route without token → 401, role violation → 403
- [x] Attendance: double check-in rejected, check-out flow
- [x] Leaves: apply, invalid dates, manager approve own team only, cannot re-decide
- [x] Employees: hr create/update/delete; employee forbidden
- [ ] `npm test` passes (runs once MongoDB is connected)

## Phase 5 — Client foundation
- [x] Vite React app, install deps, import `bootstrap/dist/css/bootstrap.min.css`
- [x] Redux store + `authSlice` (login, register, logout, persist)
- [x] `axios.js`, `ProtectedRoute`, `AppNavbar` (role-based links, notification bell with unread count, logout)
- [x] `App.jsx` with lazy routes + `Suspense` fallback `Loader`
- [x] Shared components: `StatCard`, `StatusBadge`, `Pager`, `Loader`, `ConfirmModal`

## Phase 6 — Client pages
- [x] Home (hero + feature cards + login/register buttons), Login, Register, NotFound
- [x] EmployeeDashboard, ManagerDashboard, HRDashboard (StatCards + lists)
- [x] Profile (view/edit)
- [x] Attendance (check-in/out buttons, history table; manager/hr date filter views)
- [x] Leaves (employee: apply form + history; manager: team requests with approve/reject modal; hr: all requests)
- [x] Announcements (list; hr: add/edit/delete)
- [x] Training (employee: list + enroll; manager: CRUD + assign participants)
- [x] Team (manager: members, performance rating modal)
- [x] Employees (hr: table, search, filter, add/edit modal, delete confirm)
- [x] Reports (hr: summary cards + progress-bar breakdowns)

## Phase 7 — Polish & verify
- [x] Responsive check (mobile navbar collapse, tables in `.table-responsive`)
- [x] Loading / empty / error states everywhere
- [ ] Walk through every item in REQUIREMENTS "Acceptance Checklist" (after DB start)
- [x] Write final `README.md` (setup, env, seed credentials, scripts, features)
- [x] Remove unused code and console logs
