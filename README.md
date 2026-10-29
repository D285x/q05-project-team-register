# Project Team Register

React.js frontend, Spring Boot REST backend, H2 file database (no install needed).

## Run the backend (port 8080)
```
cd backend
mvn spring-boot:run
```
Data is stored in `backend/data/`. H2 console: http://localhost:8080/h2-console
(JDBC URL `jdbc:h2:file:./data/project-team-register`, user `sa`, empty password)

## Run the frontend (port 5173)
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## REST API
| Method | URL | Purpose |
|---|---|---|
| GET | /api/team-members | List all |
| GET | /api/team-members/{id} | Get one |
| POST | /api/team-members | Create |
| PUT | /api/team-members/{id} | Update |
| DELETE | /api/team-members/{id} | Delete |

## Deploy on Render
Push this folder to a GitHub repo, then either use the included `render.yaml` (New > Blueprint) or create two services by hand:

1. **Backend**: New > Web Service, Root Directory `backend`, Runtime `Docker`. Render reads the `Dockerfile` and supplies `PORT` automatically.
2. **Frontend**: New > Static Site, Root Directory `frontend`, Build Command `npm install && npm run build`, Publish Directory `dist`. Add the environment variable `VITE_API_URL` set to the backend's URL (for example `https://project-team-register-api.onrender.com`, no trailing slash), then redeploy.

Data: by default the database is H2 on the container's disk, which is wiped on every restart or redeploy on Render's free tier. For persistent data, create a Render PostgreSQL database and set these on the backend service: `DB_URL` (`jdbc:postgresql://HOST/DBNAME`), `DB_USER`, `DB_PASSWORD`. No code change is needed.

Free web services sleep when idle, so the first request can take about a minute.

## Quick start (Windows)
Double-click `run.bat`. It checks Java, Maven and Node, installs the frontend packages, starts the backend, waits until it is ready, then starts the frontend and opens http://localhost:5173.
"# q05-project-team-register" 
