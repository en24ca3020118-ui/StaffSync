# ARCHITECTURE.md — StaffSync

## Overview
Two independent apps in one repo: `server/` (REST API, Express + MongoDB) and `client/` (React SPA, Vite). Client talks to server only via JSON over HTTP with a JWT.

```
React (Vite) ──axios + JWT──▶ Express API ──mongoose──▶ MongoDB
 Redux (auth state)            middleware: protect → authorize → validate → controller
```

## Folder Structure
```
staffsync/
├── CLAUDE.md  REQUIREMENTS.md  ARCHITECTURE.md  PLAN.md  README.md
├── server/
│   ├── package.json            ("type":"module"; scripts: dev, start, seed, test)
│   ├── .env.example
│   └── src/
│       ├── server.js           (connect DB, listen)
│       ├── app.js              (express app, cors, routes, error handler; exported for tests)
│       ├── config/db.js
│       ├── models/             User, Employee, Attendance, Leave, Announcement, Training, Notification
│       ├── middleware/         auth.js (protect, authorize), validate.js, error.js
│       ├── utils/              asyncHandler.js, generateToken.js, notify.js
│       ├── controllers/        auth, user, attendance, leave, announcement, training, notification, report
│       ├── routes/             one file per controller
│       ├── seed.js
│       └── tests/              auth, attendance, leave, employee .test.js
└── client/
    ├── package.json  vite.config.js  index.html  .env
    └── src/
        ├── main.jsx            (Provider, BrowserRouter, bootstrap css import)
        ├── App.jsx             (routes, lazy pages)
        ├── api/axios.js
        ├── store/              store.js, authSlice.js
        ├── components/         AppNavbar, ProtectedRoute, StatCard, StatusBadge, Pager, Loader, ConfirmModal
        └── pages/              Home, Login, Register, Profile, Attendance, Leaves, Announcements, Training,
                                Team, Employees, Reports, NotFound,
                                EmployeeDashboard, ManagerDashboard, HRDashboard
```

## Data Models (Mongoose, `timestamps: true`)
Note: the spec lists Users/Employees/Managers. To stay simple, **Managers are Users with role `manager`**, and `Employee` holds the HR profile for every staff member (employees and managers).

**User** — `name, email (unique, lowercase), password (hashed), role (employee|manager|hr, default employee), isActive (default true)`

**Employee** — `user (ref User, unique), employeeId (string, unique, auto "EMP"+number), phone, address, department, designation, joiningDate, manager (ref User, nullable), emergencyContact{name,phone}, performance:[{rating 1-5, note, by (ref User), date}]`
Index: `department`, `manager`.

**Attendance** — `user (ref User), date ("YYYY-MM-DD"), checkIn (Date), checkOut (Date), status (present|half-day, default present)`
Index: unique `{user, date}`; `date`.

**Leave** — `user (ref User), type (casual|sick|annual), startDate, endDate, days (computed), reason, status (pending|approved|rejected, default pending), decidedBy (ref User), comment`
Index: `{user, status}`, `status`.

**Announcement** — `title, message, postedBy (ref User)`  Index: `createdAt -1`.

**Training** — `title, description, startDate, endDate, createdBy (ref User), participants:[ref User]`  Index: `createdBy`.

**Notification** — `user (ref User), message, read (default false)`  Index: `{user, read}`.

## API Contract (prefix `/api`, JSON)
Auth column: **P** = public, **A** = any logged-in, otherwise allowed roles.

| Method & Path | Auth | Purpose |
|---|---|---|
| POST `/auth/register` | P | `{name,email,password}` → creates employee + Employee doc; returns `{token,user}` |
| POST `/auth/login` | P | `{email,password}` → `{token,user}` (user: id,name,email,role) |
| GET `/auth/me` | A | current user + employee profile |
| GET `/users` | hr | list staff `?role=&department=&search=&page=` (joins Employee) |
| POST `/users` | hr | create employee/manager `{name,email,password,role,department,designation,phone,manager}` |
| GET `/users/:id` | hr | one staff |
| PUT `/users/:id` | hr | edit user + employee fields (incl. manager, isActive) |
| DELETE `/users/:id` | hr | delete user + employee profile |
| GET `/users/managers` | hr | list managers (for dropdown) |
| GET `/users/team` | manager | my team members |
| PUT `/users/:id/performance` | manager | add `{rating,note}` (only for own team) |
| GET `/users/profile` / PUT `/users/profile` | A | own profile / update allowed fields: name, phone, address, emergencyContact |
| POST `/attendance/check-in` | A | create today's record |
| PUT `/attendance/check-out` | A | set checkOut on today's record |
| GET `/attendance/my` | A | own history `?page=` |
| GET `/attendance/today` | A | own today's record or null |
| GET `/attendance/team?date=` | manager | team attendance for date |
| GET `/attendance?date=&page=` | hr | all attendance |
| POST `/leaves` | A | apply `{type,startDate,endDate,reason}` |
| GET `/leaves/my` | A | own leaves + `used` per type |
| GET `/leaves/team` | manager | leaves of team (`?status=`) |
| GET `/leaves?status=&page=` | hr | all leaves |
| PUT `/leaves/:id/decision` | manager, hr | `{status:'approved'|'rejected', comment}`; manager limited to team |
| GET `/announcements?page=` | A | list |
| POST/PUT/DELETE `/announcements[/:id]` | hr | CRUD |
| GET `/trainings` | A | hr: all; manager: created by me; employee: where I'm participant or all open ones |
| POST/PUT/DELETE `/trainings[/:id]` | manager | CRUD (owner only); body may include `participants:[userId]` |
| POST `/trainings/:id/enroll` | employee | add self to participants |
| GET `/notifications` | A | own, newest first |
| PUT `/notifications/read-all` | A | mark all read |
| GET `/reports/summary` | hr | `{totalEmployees,totalManagers,byDepartment:[{_id,count}],leavesByStatus:[{_id,count}],presentToday,attendanceThisMonth}` |
| GET `/dashboard` | A | role-specific stats object (see below) |

Dashboard payloads: **employee** `{todayAttendance, leaveUsed:{casual,sick,annual}, pendingLeaves, announcements:[3 latest], trainings:[…]}` · **manager** `{teamSize, presentToday, pendingLeaves, trainings:[…]}` · **hr** same as reports summary + `recentLeaves:[5]`.

## Middleware Order (per route)
`protect` → `authorize(roles)` → `express-validator rules` → `validate` → controller. Global `notFound` + `errorHandler` last.

## Frontend Data Flow
1. `authSlice` holds `{user, token}`, persisted in `localStorage` (`staffsync_auth`).
2. `axios.js` reads token from the store/localStorage and adds the header; on 401 → logout + redirect.
3. `ProtectedRoute roles={[...]}`: not logged in → `/login`; wrong role → own dashboard.
4. After login, redirect by role: `/employee`, `/manager`, `/hr`.
5. Pages fetch with `useEffect` + axios, keep local state (no Redux for page data). Show `Loader` while loading and Bootstrap `Alert` on error.

## Routes (client)
`/` Home · `/login` · `/register` · `/employee` · `/manager` · `/hr` · `/profile` (all) · `/attendance` (employee, manager; hr sees all) · `/leaves` (all; view differs by role) · `/announcements` (all; hr gets post form) · `/training` (employee, manager) · `/team` (manager) · `/employees` (hr) · `/reports` (hr) · `*` 404.
Navbar links change by role.

## Optimization Notes
Indexes as listed; pagination via `page`/`limit` query; lazy routes; `.lean()` on read-only queries; `select` only needed fields.
