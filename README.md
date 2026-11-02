# AI Mystery Room

AI Mystery Room is a browser-based detective game. Choose an authored mystery scenario or write a custom premise, select a difficulty, investigate a Gemini-generated case, discover clues, request limited hints, then make one final accusation. The backend stores each case in MongoDB and keeps the culprit and solution private until the accusation is submitted.

## Features

- Gemini-generated, structured mysteries at three difficulty levels.
- A Mystery Selection Hub with supported authored scenarios, Surprise Me, and the original custom-premise flow.
- Easy: 3 suspects, 5 clues, 2 hints, 100 correct-accusation base points.
- Medium: 4 suspects, 7 clues, 3 hints, 150 base points.
- Hard: 5 suspects, 9 clues, 3 hints, 200 base points.
- Persistent case and investigation progress in MongoDB Atlas.
- Clue discovery is idempotent; each unique clue earns 5 points once.
- A successfully provided hint costs 10 points; the server enforces the limit.
- One final accusation. The backend calculates the score and only then reveals the culprit, explanation, and result.
- Responsive React interface with loading, error, and empty states.

## Technology and architecture

```text
Browser (React + Vite + Tailwind + React Router)
       | Axios requests to VITE_API_BASE_URL
       v
Express API (validation, Gemini generation, public/private serializers, scoring)
       | Mongoose                         | @google/genai
       v                                  v
MongoDB Atlas                         Gemini API
```

The browser only receives public case data while play is active. Express validates input and Gemini output with Zod, stores the complete case, and uses explicit serializers to keep the solution private until the result endpoint. Scores are calculated from saved server-side progress, never from browser-submitted totals.

The repository has two independent npm projects. `client/` is the Vite single-page app. `server/` is the Express API. Each has its own `package.json` and lockfile. The root `render.yaml` describes a Render web service; `client/vercel.json` enables direct navigation to React Router routes on Vercel.

## Requirements

- Node.js 24.x (the Render configuration pins 24.22.1) and npm.
- A MongoDB Atlas database and database user.
- A Gemini API key.

## Run locally (Windows PowerShell)

Open two PowerShell terminals in the project root. Create the local environment files from the safe templates, then edit them in VS Code. Do not paste the real values into source code or commit the files.

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

In `server/.env`, set `MONGODB_URI` and `GEMINI_API_KEY`. Keep the local `CLIENT_URL` as `http://localhost:5173` and `PORT` as `5000`. The MongoDB connection string should target your app database (for example, `ai_mystery_room`). In `client/.env`, keep `VITE_API_BASE_URL=http://localhost:5000/api`.

Install dependencies and start the backend in the first terminal:

```powershell
cd server
npm.cmd ci
npm.cmd start
```

Start the frontend in a second terminal:

```powershell
cd client
npm.cmd ci
npm.cmd run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). Check backend readiness at `http://localhost:5000/api/health`; a ready response is `{ "status": "ok" }`. The health endpoint reports unavailable while MongoDB is disconnected.

To make a production build locally:

```powershell
cd client
npm.cmd run build
```

## Environment variables

| Variable | Where | Required | Purpose / production value |
|---|---|---:|---|
| `PORT` | Backend | No | Local port; Render supplies its own port. The server defaults to 5000 locally. |
| `NODE_ENV` | Backend | Recommended | Set to `production` on Render. |
| `MONGODB_URI` | Backend only | Yes | Atlas connection string for the app database. Treat as a password. |
| `GEMINI_API_KEY` | Backend only | Yes | Gemini API credential. Never put it in Vercel or a `VITE_` variable. |
| `CLIENT_URL` | Backend | Yes | Exact frontend origin, e.g. `https://your-app.vercel.app`; no path or trailing slash. Local: `http://localhost:5173`. |
| `VITE_API_BASE_URL` | Frontend build | Yes for deployment | Backend API origin plus `/api`, e.g. `https://your-api.onrender.com/api`. This is public and is embedded at build time. |

The committed `.env.example` files contain placeholders only. For deployment, enter actual credentials in Render's environment-variable dashboard, not in `render.yaml`, GitHub, or Vercel. After changing `VITE_API_BASE_URL` in Vercel, redeploy so Vite rebuilds the client with the new URL.

## API endpoints

Base path: `/api`. Local base URL: `http://localhost:5000/api`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Readiness check; succeeds only while the API and database are ready. |
| `GET` | `/cases/options` | Get the playable authored scenario catalogue and difficulty rules; does not require Gemini or MongoDB. |
| `POST` | `/cases` | Generate and save a case. Body: `{ "premise": "...", "difficulty": "Easy" }`. |
| `GET` | `/cases/:id` | Get public case information and investigation progress. |
| `POST` | `/cases/:id/clues/:clueId/discover` | Discover a clue; repeats do not grant additional points. |
| `POST` | `/cases/:id/hints` | Request the next allowed hint. |
| `POST` | `/cases/:id/accuse` | Final accusation. Body: `{ "suspectId": "suspect_1" }`. Does not return the full solution. |
| `GET` | `/cases/:id/result` | Get verdict, culprit, explanation, and server-calculated score after accusation. |

Active-case responses never include the culprit, solution, or private clue meanings. Never send a client-calculated score. Requests use JSON and validation errors use safe API error responses.

## GitHub: publish the source yourself

The project folder is prepared locally, but has not been connected to GitHub or published. First create an empty repository on GitHub (do not add a README, license, or `.gitignore` there). From PowerShell in this project root, review the files Git will include before committing:

```powershell
git init -b main
git status --short
git check-ignore -v server/.env client/.env server/node_modules client/node_modules client/dist
```

The `git check-ignore` command should identify the local environment files and generated dependency/build directories as ignored. The example files should remain visible to Git. If the status looks safe, make the first commit and push to the new, empty GitHub repository:

```powershell
git add .
git status --short
git commit -m "Prepare AI Mystery Room"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the remote URL with the one GitHub shows for your repository. Never use `git add -f` for `.env` files. If a real credential was ever committed, removing the file in a later commit is not enough: rotate that credential immediately.

## MongoDB Atlas network access

Use a dedicated Atlas database user for this app, with the `readWrite` role limited to the app database. Use a strong, unique password in `MONGODB_URI`.

For the Atlas project's **Network Access** IP access list, allow only the Render service's outbound addresses for the Render region you select. Render shows the service's outbound IP ranges in its dashboard under the service's **Connect** information. Add the listed CIDR ranges to Atlas, and repeat if you change Render regions. For local development, add your current public IP as a `/32` entry if necessary; remove that entry when it is no longer needed. Do not use `0.0.0.0/0` for a deployed database. Keep Atlas credentials and connection strings in Render's backend environment settings.

## Deploy backend to Render

The root `render.yaml` defines the backend service with `server/` as its root, `npm ci` as its build command, `npm start` as its start command, and `/api/health` as its health check. It asks for the three secret/origin values during setup and disables automatic deploys for later commits.

1. Push the reviewed source to GitHub using the instructions above.
2. In Render, create a **Blueprint** from that GitHub repository and review the proposed `ai-mystery-room-api` service. Choose a region near your Atlas database and frontend users. The Blueprint's `free` plan is suitable for a trial; choose a paid plan for a production service that needs reliable availability.
3. When prompted, set `MONGODB_URI` to the Atlas app database URI, `GEMINI_API_KEY` to the server key, and `CLIENT_URL` to the exact Vercel site origin (for example, `https://your-app.vercel.app`). Do not include `/api` in `CLIENT_URL`.
4. Create the service. This is the point where Render starts a deployment. If the health check is unavailable because Atlas has not yet allowed Render's egress, add the Render outbound ranges to Atlas as described above; the server retries the database connection. Once connected, confirm the service is healthy.
5. Copy the service's HTTPS URL, such as `https://your-api.onrender.com`. Test `https://your-api.onrender.com/api/health` and expect `{ "status": "ok" }`.

Render supplies `PORT`; do not hardcode it in the dashboard. Keep `NODE_ENV=production`. Render's free web services can sleep when idle and have other limits; use a suitable paid plan for production availability.

## Deploy frontend to Vercel

1. Import the GitHub repository into Vercel.
2. Set **Root Directory** to `client`. Use Vite; build command `npm run build`; output directory `dist`; install command `npm install` (or the detected npm lockfile install command).
3. Add the production environment variable `VITE_API_BASE_URL` with the Render URL plus `/api`, e.g. `https://your-api.onrender.com/api`.
4. Deploy the frontend and copy its production origin, e.g. `https://your-app.vercel.app`.
5. In Render, set `CLIENT_URL` to that exact origin. If the Vercel domain changes or a custom domain is added, update `CLIENT_URL` to the origin players will use, then redeploy/restart the backend as needed.
6. If you learn the final Render URL after the frontend build, update `VITE_API_BASE_URL` in Vercel and redeploy the frontend.

`client/vercel.json` rewrites page routes to `index.html`, so refreshing `/create` or `/case/...` loads the React application. Do not put `MONGODB_URI` or `GEMINI_API_KEY` in Vercel. Vercel preview deployments use different origins; the backend currently allows the one `CLIENT_URL` origin, so use the production domain for the production app.

## Verify the deployed connection

1. Open the Render `/api/health` URL; it must return HTTP 200 and `{ "status": "ok" }`.
2. Open the Vercel site and check the browser developer console/network panel for successful requests to the Render `/api` origin and no CORS errors.
3. Create a case, discover a clue, request a hint, submit one accusation, and open the result. Confirm the solution appears only on the result screen.
4. Test one additional difficulty and refresh the investigation page to confirm progress persists.

Before a Render/Vercel URL exists, production connectivity cannot be tested. Local frontend/backend connectivity and CORS can be checked at `http://localhost:5173` and `http://localhost:5000/api`.

## Security checklist

- Never commit `.env`, API keys, Atlas passwords, or real deployment values.
- Keep Gemini and MongoDB secrets on the backend only.
- Use HTTPS service URLs and restrict Atlas Network Access to required addresses.
- Keep `CLIENT_URL` set to the intended frontend origin.
- Review `git status` before every commit and rotate any credential that was exposed.
- No account, publish, or deployment action is performed by this setup guide; create hosted services only when you are ready to deploy.
