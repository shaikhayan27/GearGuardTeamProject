# GearGuradTeamProject

<h2>Documentetion (ChatGpt)</h2>
the Proper Human Evaluated one Doc will be Uplodaded soon ----- :>

# GearGuard Project Documentation (Current Progress)

Based on the work completed so far in the project conversation and setup. 

---

# GearGuard

## Project Overview

GearGuard is an Equipment Maintenance Management System designed to help organizations manage:

* Equipment inventory
* Maintenance teams
* Maintenance requests
* Repair workflow tracking
* Preventive maintenance scheduling

The system follows a full-stack architecture using:

### Frontend

* React
* Vite
* React Router
* Axios

### Backend

* Node.js
* Express.js

### Database

* MySQL (Relational Database)

### Planned Deployment

* Frontend → Vercel
* Backend → Railway
* Database → Railway MySQL

---

# Business Requirements

The system manages three main entities:

## 1. Equipment

Stores information about company assets.

Examples:

* CNC Machines
* Generators
* Laptops
* Industrial Equipment

---

## 2. Maintenance Teams

Teams responsible for maintaining equipment.

Examples:

* Mechanics
* Electricians
* IT Support

Each team can have multiple members.

---

## 3. Maintenance Requests

Requests created whenever equipment requires:

* Corrective Maintenance
* Preventive Maintenance

Request stages:

* New
* In Progress
* Repaired
* Scrap

---

# Database Design

## maintenance_team

| Column | Type     |
| ------ | -------- |
| id     | INT (PK) |
| name   | VARCHAR  |

---

## team_member

| Column  | Type     |
| ------- | -------- |
| id      | INT (PK) |
| name    | VARCHAR  |
| team_id | FK       |

Relationship:

```text
One Team
   ↓
Many Members
```

---

## equipment

| Column        | Type     |
| ------------- | -------- |
| id            | INT (PK) |
| name          | VARCHAR  |
| serial_number | VARCHAR  |
| department    | VARCHAR  |
| employee_name | VARCHAR  |
| location      | VARCHAR  |
| purchase_date | DATE     |
| warranty_info | VARCHAR  |
| team_id       | FK       |
| is_scrapped   | BOOLEAN  |

Relationship:

```text
One Team
   ↓
Many Equipment
```

---

## maintenance_request

| Column         | Type      |
| -------------- | --------- |
| id             | INT (PK)  |
| subject        | VARCHAR   |
| type           | ENUM      |
| stage          | ENUM      |
| equipment_id   | FK        |
| team_id        | FK        |
| assigned_to    | FK        |
| scheduled_date | DATE      |
| duration_hours | DECIMAL   |
| created_at     | TIMESTAMP |

Relationship:

```text
Equipment
   ↓
Maintenance Requests
```

---

# System Architecture

```text
React Frontend
      ↓
Axios API Calls
      ↓
Express Server
      ↓
MySQL Database
```

---

# Project Folder Structure

```text
gearguard/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── server/
│   ├── routes/
│   │   ├── teams.js
│   │   ├── equipment.js
│   │   └── requests.js
│   │
│   ├── db.js
│   ├── index.js
│   └── .env
│
└── package.json
```

---

# Backend Progress

## Completed

### MySQL Database

Successfully created:

* maintenance_team
* team_member
* equipment
* maintenance_request

Seed data inserted successfully.

---

### Express Server

Configured:

```javascript
express
cors
dotenv
mysql2
```

Server starts on:

```text
http://localhost:5000
```

Health Check Endpoint:

```text
GET /
```

Response:

```json
{
  "message": "GearGuard API is running"
}
```

---

# API Development Progress

## Teams Routes

Implemented:

### Get All Teams

```http
GET /api/teams
```

---

### Get Team By ID

```http
GET /api/teams/:id
```

Returns:

* Team
* Members

---

### Create Team

```http
POST /api/teams
```

---

### Add Team Member

```http
POST /api/teams/:id/members
```

---

### Delete Team

```http
DELETE /api/teams/:id
```

---

## Equipment Routes

Implemented:

### Get All Equipment

```http
GET /api/equipment
```

Includes team name using SQL JOIN.

---

### Get Single Equipment

```http
GET /api/equipment/:id
```

Includes:

* Equipment details
* Open maintenance request count

---

### Create Equipment

```http
POST /api/equipment
```

---

### Update Equipment

```http
PUT /api/equipment/:id
```

---

### Delete Equipment

```http
DELETE /api/equipment/:id
```

---

## Maintenance Request Routes

Implemented:

### Get All Requests

```http
GET /api/requests
```

---

### Get Requests By Equipment

```http
GET /api/requests/by-equipment/:equipmentId
```

---

### Create Request

```http
POST /api/requests
```

Contains auto-fill business logic.

---

### Update Request Stage

```http
PATCH /api/requests/:id/stage
```

---

### Assign Technician

```http
PATCH /api/requests/:id/assign
```

---

# Business Logic Implemented

## Auto-Fill Team Logic

When a maintenance request is created:

```text
Equipment Selected
        ↓
Find Equipment Team
        ↓
Automatically Assign Team
```

This removes manual team selection.

---

## Scrap Logic

When request stage changes to:

```text
scrap
```

System automatically updates:

```text
equipment.is_scrapped = true
```

This ensures equipment status remains synchronized.

---

# Frontend Progress

## Completed

### React Project Setup

Configured:

* Vite
* React Router
* Axios

---

### Navigation Bar

Pages:

* Equipment
* Teams
* Kanban
* Calendar

---

### API Layer

Centralized API helper:

```text
src/api/index.js
```

Handles all backend communication.

---

### Equipment Page

Implemented:

#### Add Equipment Form

Fields:

* Name
* Serial Number
* Department
* Employee
* Location
* Purchase Date
* Warranty Info
* Team

---

#### Equipment Table

Displays:

* Name
* Serial Number
* Department
* Location
* Team
* Scrap Status

---

#### Delete Functionality

Implemented with confirmation dialog.

---

# Completed Milestones

## Day 1

✅ Database Schema Created

✅ MySQL Connected

✅ Express Server Running

✅ API Endpoints Created

---

## Day 2

✅ React Setup

✅ Routing Setup

✅ Navbar

✅ API Integration

✅ Equipment Module

✅ Equipment CRUD Working

---

# Current Project Status

### Backend

Approximately **60–70% complete**

### Frontend

Approximately **30–40% complete**

---

# Remaining Work

## Day 3

Teams Management Module

* Create Team
* View Teams
* Add Members
* Delete Teams

---

## Day 4

Maintenance Request Module

* Create Request
* Auto-fill Team Logic UI

---

## Day 5

Kanban Board

Columns:

* New
* In Progress
* Repaired
* Scrap

Drag-and-drop functionality.

---

## Day 6

Calendar View

Preventive maintenance scheduling.

---

## Day 7

Deployment

Frontend:

* Vercel

Backend:

* Railway

Database:

* Railway MySQL

Testing and bug fixing.

---

## Current Working Features

✅ MySQL Database

✅ Express API

✅ Equipment CRUD

✅ React Frontend

✅ Team Dropdown Integration

✅ Equipment Table

✅ Auto-fill Request Logic (Backend)

✅ Scrap Logic (Backend)

The project is currently at the end of **Day 2**, with the backend foundation completed and the Equipment module fully functional. 
