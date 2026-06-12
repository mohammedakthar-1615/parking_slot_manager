# Parking Slot Manager

Simple parking slot reservation and management app (frontend + backend).

## Overview
- Frontend: React + Vite (client/)
- Backend: Node.js + Express (server/)
- DB config: see `server/config/db.js` for database setup

## Requirements
- Node.js (16+)
- npm (or yarn)

## Setup
1. Install frontend deps

```bash
cd client
npm install
```

2. Install backend deps

```bash
cd server
npm install
```

3. Create environment file for the server

Create `server/.env` with the necessary variables (example):

```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Running Locally
- Start backend

```bash
cd server
npm start
```

- Start frontend (dev)

```bash
cd client
npm run dev
```

## Project Structure (key files)
- client/: React app (entry: `client/src/main.jsx`)
- server/: Express API (entry: `server/index.js`)
- server/routes/: API route handlers
- server/config/db.js: database connection

## Notes
- Do not commit secrets — add them to `server/.env` (already ignored by `.gitignore`).

