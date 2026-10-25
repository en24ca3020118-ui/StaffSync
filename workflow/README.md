# StaffSync — Human Resource Management System

MERN app for HR, Managers and Employees: profiles, attendance, leaves, announcements, training, dashboards and reports.

## Tech
Node.js · Express · MongoDB (Mongoose) · JWT · bcryptjs · React (Vite) · Redux Toolkit · React Router · Axios · Bootstrap

## Setup
Prerequisites: Node 18+, MongoDB running locally (or Atlas URI).

```bash
# 1. API
cd server
cp .env.example .env        # edit values if needed
npm install
npm run seed                # demo data
npm run dev                 # http://localhost:5000

# 2. UI (new terminal)
cd client
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm install
npm run dev                 # http://localhost:5173

# 3. Tests
cd server && npm test
```

## Demo Accounts (after seeding, password `Password@123`)
| Role | Email |
|---|---|
| HR | hr@staffsync.com |
| Manager | manager1@staffsync.com |
| Employee | employee1@staffsync.com |

## Docs for the build agent
`CLAUDE.md` (rules) · `REQUIREMENTS.md` (what) · `ARCHITECTURE.md` (how) · `PLAN.md` (order)

## Features
See `REQUIREMENTS.md`. Role-based access: employees manage their own data, managers manage teams, HR manages everything.
