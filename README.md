# GearGuradTeamProject

<h3> Folder Structure </h3>

gearguard/
├── client/          ← React (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Equipment.jsx
│   │   │   ├── Teams.jsx
│   │   │   ├── Kanban.jsx
│   │   │   └── Calendar.jsx
│   │   ├── components/
│   │   └── api/     ← all fetch() calls live here
├── server/          ← Node + Express
│   ├── routes/
│   │   ├── equipment.js
│   │   ├── teams.js
│   │   └── requests.js
│   ├── db.js        ← MySQL connection
│   └── index.js     ← entry point
├── .env
└── package.json

<h3> Updated Folder Structure of Client (FrontEnd) </h3>

client/--
        |
        ↓
src/
├── api/
│   └── index.js
├── pages/
│   ├── Equipment.jsx
│   ├── Teams.jsx
│   ├── Kanban.jsx
│   └── Calendar.jsx
├── components/
│   └── Navbar.jsx
├── App.jsx
└── main.jsx
