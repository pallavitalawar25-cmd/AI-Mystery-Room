# 🕵️ AI Mystery Room

### Every clue tells a story. Every suspect hides a secret. Can you uncover the truth?

AI Mystery Room is an interactive AI-powered detective game where players step into the role of an investigator, explore mysterious cases, examine evidence, question suspects, and make the final accusation.

Choose from ready-to-play mystery scenarios or create your own premise. Investigate carefully, use limited hints, and discover who is really behind the mystery.

---

## ✨ Features

### 🎭 Mystery Selection Hub
- Explore a collection of playable mystery scenarios.
- Choose a mystery that interests you.
- Use **Surprise Me** to discover a random case.
- Create your own mystery using a custom premise.

### 🧩 Three Difficulty Levels

| Difficulty | Suspects | Clues | Hints | Base Score |
|---|---:|---:|---:|---:|
| Easy | 3 | 5 | 2 | 100 |
| Medium | 4 | 7 | 3 | 150 |
| Hard | 5 | 9 | 3 | 200 |

### 🔎 Interactive Investigation
- Examine clues and investigate evidence.
- Explore suspect profiles and their alibis.
- Request limited hints when you get stuck.
- Make one final accusation.
- Discover the culprit and read the case explanation.

### 🏆 Scoring System
- Earn **5 points** for every unique clue discovered.
- Lose **10 points** for every successfully provided hint.
- Correct accusation earns the difficulty-based base score.
- Incorrect accusation results in zero base points.
- Final score is calculated and validated by the backend.

### 🤖 AI-Powered Mystery Generation
- Uses Google's Gemini API to generate structured mysteries.
- Includes a template-based fallback when the AI service is temporarily unavailable.
- Validates generated mystery data before saving it.

### 🔐 Secure Case Management
- Cases and investigation progress are stored in MongoDB.
- The culprit and solution remain hidden during active investigation.
- Private clue meanings are not exposed to the frontend.
- Scores are calculated on the backend, not trusted from the browser.

---

## 🎮 How to Play

1. Open AI Mystery Room.
2. Choose a mystery scenario or enter your own premise.
3. Select Easy, Medium, or Hard.
4. Start investigating the generated case.
5. Discover clues and examine suspects.
6. Use hints strategically.
7. Submit your final accusation.
8. Reveal the truth and check your score.

**Think carefully before accusing. One final decision determines your result!**

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Routing | React Router |
| API communication | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| AI integration | Google Gemini API |
| Validation | Zod |
| Deployment | Vercel, Render |

---

## 🏗️ Architecture

```text
                 PLAYER
                    |
                    v
          REACT + VITE FRONTEND
                    |
               Axios API
                    |
                    v
             EXPRESS BACKEND
              /           \
             v             v
       MongoDB Atlas    Gemini API
             |             |
             v             v
       Saved Cases     AI Mystery
       & Progress      Generation
                            |
                            v
                    Template Fallback
```

The frontend communicates with the Express API. The backend validates requests, generates and stores cases, manages investigation progress, and calculates scores.

The complete mystery solution stays on the server until the player submits an accusation.

---

## 📁 Project Structure

```text
AI-Mystery-Room/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── vercel.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── server.js
│   ├── test/
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── README.md
├── SPEC.md
└── render.yaml
```

---

## ⚙️ Run Locally

### Prerequisites

- Node.js 24.x
- npm
- MongoDB Atlas account
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/pallavitalawar25-cmd/AI-Mystery-Room.git
cd AI-Mystery-Room
```

### 2. Configure environment variables

Create the backend environment file:

```powershell
Copy-Item server\.env.example server\.env
```

Create the frontend environment file:

```powershell
Copy-Item client\.env.example client\.env
```

Configure `server/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

Configure `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Replace the placeholder values with your own credentials.

**Never commit `.env` files or expose API keys publicly.**

### 3. Start the backend

Open a terminal:

```powershell
cd server
npm.cmd ci
npm.cmd start
```

The backend runs at:

```text
http://localhost:5000
```

### 4. Start the frontend

Open a second terminal:

```powershell
cd client
npm.cmd ci
npm.cmd run dev
```

Open:

```text
http://localhost:5173
```

### 5. Check backend health

Visit:

```text
http://localhost:5000/api/health
```

A successful response:

```json
{
  "status": "ok"
}
```

---

## 🔌 API Endpoints

Base URL: `/api`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Backend and database readiness |
| GET | `/cases/options` | Playable mystery catalogue and difficulty rules |
| POST | `/cases` | Generate and save a mystery |
| GET | `/cases/:id` | Retrieve active case information |
| POST | `/cases/:id/clues/:clueId/discover` | Discover a clue |
| POST | `/cases/:id/hints` | Request a hint |
| POST | `/cases/:id/accuse` | Submit final accusation |
| GET | `/cases/:id/result` | Retrieve final result and score |

---

## 🧪 Testing

Backend tests:

```powershell
cd server
npm.cmd test
```

Frontend production build:

```powershell
cd client
npm.cmd run build
```

Frontend lint:

```powershell
npm.cmd run lint
```

The implemented Mystery Selection Hub was verified with the backend test suite and frontend production build.

---

## ☁️ Deployment

The project is designed for deployment using:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

### Backend — Render

1. Connect the GitHub repository to Render.
2. Configure the backend service using the root `render.yaml` Blueprint.
3. Set the required environment variables:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
   - `CLIENT_URL`
4. Set `NODE_ENV=production`.
5. Configure MongoDB Atlas network access for the Render service.
6. Deploy and verify `/api/health`.

### Frontend — Vercel

1. Import the GitHub repository into Vercel.
2. Set the root directory to `client`.
3. Use Vite as the framework.
4. Set the environment variable:

```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

5. Deploy the frontend.
6. Update the Render `CLIENT_URL` to your exact Vercel frontend origin.

Keep MongoDB and Gemini credentials on the backend only.

---

## 🔒 Security Notes

- The culprit and solution are hidden during active investigation.
- Private clue meanings are never sent in active-case responses.
- Backend validation protects incoming requests and generated case data.
- Scoring is calculated on the server.
- MongoDB credentials and Gemini API keys must remain private.
- Database network access should be restricted to required addresses.

---

## 🚀 Future Improvements

- More authored mystery scenarios.
- Additional investigation environments.
- Richer suspect interactions.
- Improved mystery generation and narrative variety.
- Enhanced investigation statistics and player profiles.

---

## 👩‍💻 Developed By

**Pallavi Talawar**

B.E. Computer Science and Engineering — Cyber Security

GitHub: [@pallavitalawar25-cmd](https://github.com/pallavitalawar25-cmd)

LinkedIn: [Pallavi Talawar](https://www.linkedin.com/in/pallavi-talwar09/)

---

### 🕵️ Ready to investigate?

**Enter the Mystery Room. Follow the evidence. Find the truth.**
