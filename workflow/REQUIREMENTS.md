# REQUIREMENTS.md — StaffSync

**StaffSync** is a MERN web app that digitizes HR processes for three roles: Employee, Manager, HR.

## Roles & Features

### Employee
- Register / login
- View and edit own profile (name, phone, address, emergency contact, department/designation are read-only)
- Mark attendance (check-in / check-out, once per day)
- Apply for leave; view own leave history and status
- View announcements
- View training programs assigned/enrolled and enroll
- View notifications
- Dashboard: today's attendance status, leave balance summary, latest announcements, my trainings

### Manager
- View team members (employees whose `manager` = this manager)
- View team attendance (by date)
- Review leave requests of team; approve / reject with optional comment
- Create / edit / delete training programs; assign team members
- Monitor employee performance: add a rating (1–5) and note for a team member
- Dashboard: pending leave count, team size, team present today, my training programs

### HR
- Manage employees and managers: create, view, edit, deactivate/delete; assign manager to employee
- Track attendance of everyone (filter by date)
- Manage all leave requests (approve/reject any)
- Post / edit / delete announcements
- Reports & analytics: headcount by department, leaves by status, attendance for today/this month
- Dashboard: totals, charts-as-simple-bars (Bootstrap progress bars, no chart library), recent leaves

## Pages (React)
Home (public landing) · Login · Register · Employee Dashboard · Manager Dashboard · HR Dashboard · Profile · Attendance · Leave Management · Announcements · Training · Team (manager) · Employees (HR) · Reports (HR) · 404

## Business Rules
- One attendance record per user per day (unique index `user + date`). Check-out requires an existing check-in.
- Leave types: `casual`, `sick`, `annual`. Annual balance: 12 days per type per year (informational; show "used" count computed from approved leaves).
- Leave status: `pending` → `approved` | `rejected`. Only pending can be decided. End date must be ≥ start date. No overlapping pending/approved leaves for the same user.
- Managers can only decide leaves of their own team members. HR can decide any (including managers' leaves). Managers' own leaves go to HR.
- Creating an announcement, deciding a leave, or assigning a training creates a `Notification` for affected users.
- Deactivated users (`isActive:false`) cannot log in.

## Non-Functional
- Responsive (mobile → desktop) using Bootstrap grid.
- Pagination (default 10) on employees, attendance, leaves, announcements.
- DB indexes on frequently queried fields (see ARCHITECTURE).
- Lazy-loaded routes.

## Acceptance Checklist
- [ ] Register creates an employee; login returns JWT; wrong password rejected
- [ ] Each role sees only its own dashboard and menu items; direct URL to a forbidden page redirects
- [ ] Employee can check in/out once per day, sees history
- [ ] Employee applies leave; manager of that employee approves/rejects; employee sees status + notification
- [ ] HR creates employee/manager, assigns manager, edits, deactivates
- [ ] HR posts announcement; everyone sees it
- [ ] Manager creates training, assigns members; employee sees it
- [ ] Manager adds performance rating for a team member
- [ ] HR reports page shows correct numbers
- [ ] Backend tests (auth, attendance, leave, employees) pass
- [ ] Seed script creates demo users; README lists their credentials
