# GearGuard — Maintenance Management System
### Project Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Motivation & Problem Statement](#2-motivation--problem-statement)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Database Design](#5-database-design)
6. [Backend — REST API](#6-backend--rest-api)
7. [Frontend — React Application](#7-frontend--react-application)
8. [Key Features & Business Logic](#8-key-features--business-logic)
9. [Project Structure](#9-project-structure)
10. [How to Run the Project](#10-how-to-run-the-project)
11. [API Reference](#11-api-reference)
12. [What I Learned](#12-what-i-learned)

---

## 1. Project Overview

**GearGuard** is a full-stack web application for managing equipment maintenance in an organization. It allows teams to track physical assets, raise maintenance requests, assign technicians, monitor repair progress, and flag equipment for scrapping — all through a clean, intuitive interface.

The project was built as a hands-on learning exercise to understand how a real-world REST API is designed, how a relational database models business logic, and how a React frontend communicates with a backend server.

---

## 2. Motivation & Problem Statement

In any organization that operates physical equipment — factories, IT departments, utilities — maintenance tracking is a critical operational need. Without a system in place:

- Equipment history is lost or unrecorded
- Technicians don't know who is responsible for what
- Managers can't track whether repairs are pending, in progress, or completed
- Scrapped equipment continues to appear in active lists

GearGuard solves this by providing a centralized platform where:

- Equipment is registered with full metadata (location, serial number, assigned employee, warranty)
- Maintenance requests are raised against specific equipment
- Requests move through a lifecycle: **New → In Progress → Repaired → Scrap**
- Scrapping a request automatically flags the equipment as scrapped in the database
- Teams and individual technicians are managed and linked to work orders

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React (Vite) | User interface |
| HTTP Client | Axios | API communication |
| Routing | React Router v6 | Page navigation |
| Backend | Node.js + Express | REST API server |
| Database | MySQL | Persistent data storage |
| DB Driver | mysql2 | Node.js ↔ MySQL bridge |
| Environment Config | dotenv | Secure credential management |
| Cross-Origin | CORS | Allow frontend to talk to backend |
| Deployment Target | Railway | Backend hosting |

---

## 4. System Architecture

GearGuard follows a classic **three-tier architecture**:

```
┌─────────────────────────────────────┐
│           FRONTEND (React)          │
│   Equipment / Teams / Kanban pages  │
│         Running on port 5173        │
└──────────────┬──────────────────────┘
               │  HTTP Requests (Axios)
               ▼
┌─────────────────────────────────────┐
│         BACKEND (Express)           │
│   REST API — index.js entry point   │
│   /api/teams  /api/equipment        │
│   /api/requests                     │
│         Running on port 5000        │
└──────────────┬──────────────────────┘
               │  SQL Queries (mysql2)
               ▼
┌─────────────────────────────────────┐
│         DATABASE (MySQL)            │
│   gearguard schema                  │
│   4 tables, foreign key relations   │
└─────────────────────────────────────┘
```

The frontend never touches the database directly. All data flows through the API. This separation means the frontend and backend can be developed, deployed, and scaled independently.

---

## 5. Database Design

The database is named `gearguard` and contains four tables with well-defined relationships.

### Entity Relationship Overview

```
maintenance_team
    │
    ├──< team_member          (one team has many members)
    │         │
    │         └──< maintenance_request (assigned_to)
    │
    ├──< equipment            (one team is responsible for equipment)
    │         │
    │         └──< maintenance_request (equipment_id)
    │
    └──< maintenance_request  (team_id)
```

---

### Table: `maintenance_team`

Stores the maintenance departments/groups in the organization.

| Column | Type | Notes |
|---|---|---|
| id | INT, AUTO_INCREMENT | Primary key |
| name | VARCHAR(100) | e.g. Mechanics, Electricians |

---

### Table: `team_member`

Stores individual technicians. Each belongs to exactly one team.

| Column | Type | Notes |
|---|---|---|
| id | INT, AUTO_INCREMENT | Primary key |
| name | VARCHAR(100) | Technician's name |
| team_id | INT, FK | References maintenance_team(id) |

> **ON DELETE CASCADE** — if a team is deleted, all its members are automatically removed.

---

### Table: `equipment`

The central asset registry. Tracks every physical piece of equipment in the organization.

| Column | Type | Notes |
|---|---|---|
| id | INT, AUTO_INCREMENT | Primary key |
| name | VARCHAR(100) | Equipment name |
| serial_number | VARCHAR(100), UNIQUE | No duplicates allowed |
| department | VARCHAR(100) | Owning department |
| employee_name | VARCHAR(100) | Assigned user |
| location | VARCHAR(100) | Physical location |
| purchase_date | DATE | When it was bought |
| warranty_info | VARCHAR(255) | Warranty expiry text |
| team_id | INT, FK | Responsible maintenance team |
| is_scrapped | BOOLEAN, DEFAULT FALSE | Soft-delete flag |

> **ON DELETE SET NULL** — if the responsible team is deleted, `team_id` becomes NULL. The equipment record is preserved.

> **is_scrapped** is a deliberate design choice — equipment is never hard-deleted. History is preserved.

---

### Table: `maintenance_request`

The core operational table. Represents a job to be done on a piece of equipment.

| Column | Type | Notes |
|---|---|---|
| id | INT, AUTO_INCREMENT | Primary key |
| subject | VARCHAR(255) | Description of the issue |
| type | ENUM | `corrective` or `preventive` |
| stage | ENUM | `new`, `in_progress`, `repaired`, `scrap` |
| equipment_id | INT, FK | Which equipment |
| team_id | INT, FK | Which team handles it |
| assigned_to | INT, FK | Which technician |
| scheduled_date | DATE | When it's planned |
| duration_hours | DECIMAL(5,2) | Estimated/actual hours |
| created_at | TIMESTAMP | Auto-set on creation |

> All three foreign keys use **ON DELETE SET NULL** — requests survive the deletion of related records, preserving audit history.

---

## 6. Backend — REST API

The backend is a Node.js/Express server with three route modules, each handling one resource.

### Entry Point: `index.js`

This file bootstraps the entire server:

- Loads environment variables from `.env`
- Applies CORS middleware (allows the React frontend to communicate)
- Applies `express.json()` (parses incoming request bodies)
- Mounts the three route modules
- Starts listening on the configured port

```
PORT=5000 (local) or assigned by Railway (production)
```

---

### Database Connection: `db.js`

Uses a **connection pool** rather than a single connection. This means up to 10 simultaneous database connections can be maintained and reused, which is essential for handling concurrent HTTP requests efficiently. The pool is exported with `.promise()` so all queries can use `async/await`.

---

### Routes: `teams.js`

| Method | Endpoint | Action |
|---|---|---|
| GET | `/api/teams` | Fetch all teams |
| GET | `/api/teams/:id` | Fetch one team + its members |
| POST | `/api/teams` | Create a new team |
| POST | `/api/teams/:id/members` | Add a member to a team |
| DELETE | `/api/teams/:id` | Delete a team |

---

### Routes: `equipment.js`

| Method | Endpoint | Action |
|---|---|---|
| GET | `/api/equipment` | Fetch all equipment (with team name via JOIN) |
| GET | `/api/equipment/:id` | Fetch one item + open request count |
| POST | `/api/equipment` | Register new equipment |
| PUT | `/api/equipment/:id` | Update equipment details |
| DELETE | `/api/equipment/:id` | Delete equipment |

Notable: the `GET /` query uses a **LEFT JOIN** to pull the team name alongside equipment data in a single query, avoiding a second round-trip.

---

### Routes: `requests.js`

| Method | Endpoint | Action |
|---|---|---|
| GET | `/api/requests` | Fetch all requests (with equipment + team + member names) |
| GET | `/api/requests/by-equipment/:id` | Fetch requests for one equipment |
| POST | `/api/requests` | Create a new request |
| PATCH | `/api/requests/:id/stage` | Update request stage (Kanban) |
| PATCH | `/api/requests/:id/assign` | Assign technician + duration |

---

## 7. Frontend — React Application

The frontend is a single-page application built with React and Vite.

### Pages

| Page | Route | Description |
|---|---|---|
| Equipment | `/` | View, add, and delete equipment |
| Teams | `/teams` | Manage teams and members |
| Kanban | `/kanban` | Drag-and-drop request pipeline |
| Calendar | `/calendar` | Scheduled maintenance view |

### API Layer: `api/index.js`

All HTTP calls are centralized in one file using Axios. A single `axios.create()` instance is configured with the base URL so every function just specifies the path. This means if the backend URL ever changes, it's updated in exactly one place.

### Equipment Page (most complete page)

- On load, fetches all equipment and all teams simultaneously using `Promise.all()` — two API calls in parallel, not sequentially
- Displays equipment in a table with team name, scrap status, and a delete button
- Includes a form to register new equipment, with a dropdown that populates dynamically from the database
- Input validation prevents submission without required fields
- Loading and error states are handled explicitly

---

## 8. Key Features & Business Logic

### Auto-fill Team on Request Creation

When a maintenance request is created for a piece of equipment, the system automatically sets `team_id` from the equipment's own `team_id` — no manual selection needed. This is handled server-side in `requests.js`:

```
If equipment_id is provided and team_id is not →
  look up the equipment's assigned team →
  set it automatically on the request
```

This prevents data entry errors and enforces consistency.

---

### Scrap Cascade Logic

When a maintenance request's stage is moved to `scrap` via the Kanban board, the backend automatically sets `is_scrapped = TRUE` on the associated equipment. This is a two-step operation within a single API call:

```
PATCH /api/requests/:id/stage  { stage: "scrap" }
  → Updates request stage
  → Looks up equipment_id from the request
  → Sets equipment.is_scrapped = TRUE
```

This means the frontend doesn't need to make a separate call to flag the equipment — the business rule lives in the backend.

---

### Parameterized Queries (SQL Injection Prevention)

Every database query uses `?` placeholders rather than string interpolation:

```js
// Safe
db.query('SELECT * FROM equipment WHERE id = ?', [req.params.id]);

// Dangerous — never done in this project
db.query(`SELECT * FROM equipment WHERE id = ${req.params.id}`);
```

This ensures user-supplied input is always treated as data, never as executable SQL.

---

### ON DELETE Behaviour (Data Integrity)

The schema uses two different deletion strategies depending on the relationship:

- `CASCADE` — used for team members. Deleting a team removes its members. This makes sense because a member without a team is meaningless.
- `SET NULL` — used for equipment and requests. Deleting a team doesn't wipe out equipment or request history. Records are preserved with the foreign key set to NULL.

---

## 9. Project Structure

```
GearGuard/
├── client/                        # React frontend
│   └── src/
│       ├── api/
│       │   └── index.js           # All Axios API calls
│       ├── components/
│       │   └── Navbar.jsx         # Navigation bar
│       ├── pages/
│       │   ├── Equipment.jsx      # Equipment management page
│       │   ├── Teams.jsx          # Teams management page
│       │   ├── Kanban.jsx         # Kanban board
│       │   └── Calendar.jsx       # Calendar view
│       ├── App.jsx                # Router setup
│       └── main.jsx               # React entry point
│
└── backend/                       # Node.js/Express API
    ├── routes/
    │   ├── teams.js               # Team endpoints
    │   ├── equipment.js           # Equipment endpoints
    │   └── requests.js            # Request endpoints
    ├── db.js                      # MySQL connection pool
    ├── index.js                   # Server entry point
    └── .env                       # Environment variables (not committed)
```

---

## 10. How to Run the Project

### Prerequisites

- Node.js (v18+)
- MySQL (running locally)
- npm

### Database Setup

```sql
-- Run the schema SQL file in MySQL Workbench or CLI
CREATE DATABASE IF NOT EXISTS gearguard;
USE gearguard;
-- (run the full schema file here)
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gearguard
PORT=5000
```

```bash
node index.js
# Server running on port 5000
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
# App running on http://localhost:5173
```

---

## 11. API Reference

### Base URL
```
http://localhost:5000/api
```

### Teams

```
GET    /teams                     → list all teams
GET    /teams/:id                 → one team + members
POST   /teams          { name }   → create team
POST   /teams/:id/members { name }→ add member
DELETE /teams/:id                 → delete team
```

### Equipment

```
GET    /equipment                          → list all (with team name)
GET    /equipment/:id                      → one item + open request count
POST   /equipment      { name, serial_number, department,
                         employee_name, location, purchase_date,
                         warranty_info, team_id }
PUT    /equipment/:id  { ...same fields + is_scrapped }
DELETE /equipment/:id
```

### Requests

```
GET    /requests                           → all requests (joined with names)
GET    /requests/by-equipment/:id          → requests for one equipment
POST   /requests       { subject, type, equipment_id,
                         team_id, assigned_to, scheduled_date }
PATCH  /requests/:id/stage   { stage }     → move stage (Kanban)
PATCH  /requests/:id/assign  { assigned_to, duration_hours }
```

---

## 12. What I Learned

Building GearGuard provided practical exposure to several concepts that bridge academic study and real-world development:

**Backend & API Design**
- How to structure a REST API with Express and separate route modules
- How connection pooling works and why it matters under concurrent load
- How to use parameterized queries to prevent SQL injection
- How business logic (auto-fill, scrap cascade) lives in the API layer, not the frontend

**Database Design**
- Designing normalized relational tables with foreign keys
- The difference between `ON DELETE CASCADE` and `ON DELETE SET NULL` and when each is appropriate
- Using `ENUM` types for constrained values, and `BOOLEAN` flags for soft deletes
- Writing `LEFT JOIN` queries to combine data from multiple tables efficiently

**Frontend Development**
- Building a React SPA with client-side routing
- Managing component state with `useState` and `useEffect`
- Centralizing API calls in a dedicated module
- Using `Promise.all()` for parallel data fetching
- Handling loading states, error states, and form validation

**Software Engineering Practices**
- Separating concerns across layers (DB, API, UI)
- Using environment variables to keep credentials out of source code
- Understanding the full HTTP request lifecycle from browser to database and back

---

*GearGuard — Built as a learning project by Ayan | GLS University, Gujarat*
*Stack: React · Node.js · Express · MySQL*