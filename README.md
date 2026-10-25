# Modern HR — Enterprise Workforce Management System

A full-stack MERN (MongoDB, Express, React, Node.js) web application designed for comprehensive human resource operations, attendance governance, leave lifecycle administration, and performance reviews.

> 📖 **Comprehensive Documentation**: For full system architecture diagrams, database schema designs, sequence flowcharts, API endpoints, and teacher presentation/viva Q&A, please see **[PROJECT_OVERVIEW.md](file:///c:/Users/Gulab%20Jangid/Desktop/Modern%20Hr/PROJECT_OVERVIEW.md)**.

---

## Organizational Architecture & Roles

### 1. Employee
* **Authentication**: Secure JWT sessions with protected route guards.
* **Profile**: View organizational metadata and update personal contact info and next-of-kin records.
* **Attendance**: One-click check-in and check-out timestamp logs with full historical audit.
* **Leave Management**: Apply for Casual, Sick, or Annual Vacation leave with overlap validation.
* **Corporate Circulars**: Read official announcements and policy updates.
* **Skill Development**: Enroll in technical workshops and professional cohorts.
* **Notifications**: Central alert bell with unread counters for approvals, circulars, and course invites.

### 2. Department Manager
* **Team Governance**: Supervise direct reports, employee IDs, job titles, and contact lines.
* **Performance Evaluations**: Submit formal 1.0–5.0 scale ratings and qualitative review notes.
* **Attendance Verification**: Inspect and filter daily team attendance by calendar date.
* **Leave Decisions**: Adjudicate subordinate leave requests with approvals/rejections and remarks.
* **Training Cohorts**: Create and manage technical training programs with automated participant notifications.

### 3. HR Directorate
* **Staff Directory**: Lifecycle management (create, update, deactivate, delete), department assignments, and supervisor mappings.
* **Company Attendance**: Organization-wide turnout tracking with date filters and pagination.
* **Leave Registry**: Administrative authority to decide any staff or manager leave request.
* **Circular Broadcasts**: Publish company-wide announcements delivered to all active staff.
* **Analytics & Reports**: Visual workforce distributions (headcount by department, leave status, monthly turnover).

---

## Technical Stack

* **Backend**: Node.js, Express.js (ES Modules), Mongoose, MongoDB Atlas, JWT, bcryptjs, express-validator.
* **Frontend**: React 18, Vite, Redux Toolkit, React Router v6, Axios with JWT interceptors, Bootstrap 5 & React-Bootstrap.
* **Design**: Modern Eye-Comforting Zinc/Slate theme with smooth page transitions and clean typography.

---

## Corporate Accounts (Password for all accounts: `Password@123`)

| Role | Name | Department | Email Address |
| :--- | :--- | :--- | :--- |
| **HR Director** | Priya Sharma | Human Resources | `hr@modernhr.com` |
| **Engineering VP** | Vikram Malhotra | Engineering | `manager1@modernhr.com` |
| **Sales Head** | Ananya Deshmukh | Sales & Growth | `manager2@modernhr.com` |
| **Senior Engineer** | Rohan Verma | Engineering | `emp1@modernhr.com` |
| **QA Lead** | Neha Gupta | Engineering | `emp2@modernhr.com` |
| **Cloud Architect** | Arjun Mehta | Engineering | `emp3@modernhr.com` |
| **Account Executive** | Kavita Reddy | Sales & Growth | `emp4@modernhr.com` |
| **Business Analyst** | Aditya Rao | Sales & Growth | `emp5@modernhr.com` |

---

## Running the Application

### 1. API Server (`server/`)
```bash
cd server
npm install
npm run seed     # Seeds real corporate profiles and records on Atlas
npm run dev      # Starts API server on http://localhost:5000
```

### 2. Client Application (`client/`)
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```
