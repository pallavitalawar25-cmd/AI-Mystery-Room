# AI Mystery Room — Project Specification

**Project type:** AI-powered interactive mystery investigation game  
**Status:** Initial implementation specification  
**Deadline:** 2 November 2026, 11:59 PM  
**Frontend:** React, Vite, Tailwind CSS, React Router, Axios  
**Backend:** Node.js, Express  
**Database:** MongoDB Atlas, Mongoose  
**AI:** Gemini API through the official `@google/genai` SDK

---

## 1. Project Overview

AI Mystery Room is a web application where a player creates or selects a mystery premise, investigates a case, reviews suspects and clues, requests hints, accuses one suspect, and receives a verdict with a score and explanation. Gemini helps generate structured mystery content. The server validates the generated content, stores the case, protects the solution, and calculates the score.

### Problem statement
Many mystery games offer fixed stories and limited replayability. AI Mystery Room aims to provide replayable mysteries based on player-provided premises and difficulty levels while keeping the investigation fair, logically consistent, and engaging.

### Target users
- People who enjoy detective stories, puzzles, and mystery games.
- Students and casual users looking for a short interactive reasoning challenge.

### Main user experience
1. The player opens the home page.
2. The player enters a premise and chooses Easy, Medium, or Hard.
3. The server asks Gemini to generate a structured mystery.
4. The server validates the mystery and saves it in MongoDB.
5. The player investigates suspects and discovers clues.
6. The player may request limited hints.
7. The player accuses one suspect.
8. The server calculates the score and returns the verdict, culprit, and explanation.
9. The player may start a new case.

---

## 2. Scope

### Required features
- Responsive home page and navigation.
- Mystery premise input and difficulty selection.
- Gemini-generated case title, story, suspects, clues, hints, and solution.
- Server-side validation of AI output.
- Persistent case storage in MongoDB.
- Suspect and clue investigation interface.
- Clue discovery tracking.
- Limited hints with score penalties.
- One final accusation per case.
- Backend-only scoring.
- Result page with verdict, culprit, explanation, and score.
- Loading, empty, validation, and error states.
- Restart/new-mystery flow.
- Public GitHub repository with README and setup instructions.
- Deployed frontend and backend.
- Short demo video.

### Optional enhancements — only after required features work
- Case history.
- Animations and sound effects.
- Daily mystery.
- Shareable result card.
- Timer or leaderboard.

Do not build optional features until the complete required game flow passes testing.

### Out of scope for the first version
- User accounts, login, and social features.
- Payments.
- Multiplayer gameplay.
- Public user-generated case sharing.

---

## 3. Technology and Repository Structure

Use JavaScript with ES modules unless a dependency requires otherwise.

```text
ai-mystery-room/
├── SPEC.md
├── README.md
├── .gitignore
├── client/
│   ├── .env.example
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
└── server/
    ├── .env.example
    ├── package.json
    └── src/
        ├── config/
        ├── models/
        ├── routes/
        ├── controllers/
        ├── services/
        ├── middleware/
        ├── validators/
        └── server.js
```

Use:
- React + Vite for the client.
- Tailwind CSS for responsive styling.
- React Router for page navigation.
- Axios for client API requests.
- Express for the API.
- Mongoose for MongoDB data modelling.
- `@google/genai` for Gemini requests.
- Zod for validating generated and incoming data.
- dotenv for local environment variables.

Pin compatible package versions through the package manager and commit lockfiles. Never commit `.env` files, API keys, database credentials, or deployment secrets.

---

## 4. UI and Page Specifications

### 4.1 Home (`/`)
Purpose: Introduce the game and encourage the player to begin.

Required elements:
- Project name and short tagline.
- Brief explanation of how to play.
- Primary “Start Investigation” button.
- Difficulty preview.
- Responsive detective/mystery visual theme.

### 4.2 Create Mystery (`/create`)
Required elements:
- Premise text area (trimmed, 10–500 characters).
- Difficulty selector: Easy, Medium, Hard.
- Generate button.
- Example premise text.
- Loading indicator while generating.
- Clear validation messages and retry action for errors.

Do not send an empty or overlong premise to the backend.

### 4.3 Investigation Room (`/case/:id`)
Required elements:
- Case title, narrative, and difficulty.
- Suspect cards with names, descriptions, and alibis.
- Clue cards with title and player-visible description.
- Discover clue action and discovered/undiscovered status.
- Hint button with remaining-hints count.
- Discovered-clue progress.
- Current score estimate or score breakdown, without exposing the solution.
- Accusation action leading to the accusation interface.

Only show clues intended to be visible to the player. Never send the culprit ID, private solution, hidden evidence, or solution explanation in active-case responses.

### 4.4 Accusation (`/case/:id/accuse`)
Required elements:
- List of suspects.
- Exactly one suspect selection.
- Confirmation step before final submission.
- Warning that the accusation is final.
- Disable duplicate submissions while the request is in progress.

The server accepts only a suspect ID belonging to that case. A completed case cannot be accused again.

### 4.5 Results (`/case/:id/result`)
Required elements:
- Correct/incorrect verdict.
- Actual culprit.
- Explanation of the solution and how the evidence supports it.
- Score breakdown: base points, clue points, hint penalties, final score.
- “Play Again” button.

The result endpoint is accessible only after the case has been completed.

### Shared states and accessibility
- Mobile, tablet, and desktop layouts.
- Semantic HTML, visible keyboard focus, labelled controls, and adequate contrast.
- Loading states for generation and API requests.
- Empty states for missing cases or unavailable clues.
- Friendly error messages that do not expose server internals.
- A retry option for recoverable network/AI errors.
- Confirmation before final accusation.
- No UI element should pretend an action succeeded before the server confirms it.

---

## 5. Difficulty Rules

| Difficulty | Suspects | Clues | Hints | Correct-accusation base |
|---|---:|---:|---:|---:|
| Easy | 3 | 5 | 2 | 100 |
| Medium | 4 | 7 | 3 | 150 |
| Hard | 5 | 9 | 3 | 200 |

Additional scoring:
- Each uniquely discovered clue: +5 points.
- Each hint requested successfully: −10 points.
- Incorrect accusation: 0 base points.
- Final score cannot be less than 0.

Formula:

`finalScore = max(0, (correct ? basePoints : 0) + discoveredClueCount * 5 - hintsUsed * 10)`

The backend must calculate the score from stored case state. Ignore any score, clue count, hint count, culprit, or correctness value supplied by the client.

A clue counts once even if a request is repeated. A hint penalty is applied only when a new hint is successfully returned. Hint requests stop when the allowed number has been used. An accusation is final and can happen only once.

---

## 6. Gemini Generation Contract

### Input to Gemini
The server sends:
- Player premise.
- Difficulty.
- Required suspect, clue, and hint counts.
- Instructions for a fair, solvable mystery.
- A requirement for structured JSON output.

### Expected internal JSON shape

```json
{
  "title": "The Clockmaker's Last Hour",
  "story": "A concise case introduction...",
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Example Name",
      "description": "A short public description",
      "alibi": "A claim that can be checked",
      "motive": "A public motive or possible reason"
    }
  ],
  "clues": [
    {
      "id": "clue_1",
      "title": "The Stopped Clock",
      "description": "The player-visible clue",
      "privateMeaning": "How this clue relates to the solution"
    }
  ],
  "hints": [
    "A gentle nudge that does not name the culprit",
    "A more specific nudge based on the evidence"
  ],
  "solution": {
    "culpritId": "suspect_2",
    "explanation": "Why the culprit is responsible",
    "reasoning": "How the clues rule in or rule out suspects"
  }
}
```

This is an internal generation format. Do not return it directly to the client. The backend separates public data from private solution fields before responding.

### Validation requirements
- Parse JSON; do not trust free-form model text.
- Validate with a Zod schema.
- Require the exact number of suspects, clues, and hints for the chosen difficulty.
- Require unique, non-empty IDs and names.
- Require `solution.culpritId` to match an existing suspect ID.
- Require all referenced IDs to exist.
- Reject missing fields, unexpected types, duplicate IDs, and malformed output.
- Limit text lengths to sensible values.
- Retry generation at most once for invalid output; then return a safe error.
- Never save an invalid case.
- Do not expose raw provider errors, prompts, API keys, or hidden solution fields to the browser.

### Mystery fairness
The solution must be fixed before gameplay begins. Clues must collectively support one defensible culprit and the explanation must refer to the generated evidence. Suspect alibis, motives, timeline, and clues must not contradict the intended solution. Hints should guide reasoning without directly revealing the culprit. If the content fails validation, regenerate or fail safely rather than saving a broken case.

AI-generated mysteries can still contain narrative flaws despite structural validation; test representative cases and improve the generation prompt when needed.

---

## 7. Database Model

Use MongoDB Atlas and Mongoose. Store one document per case. The initial version does not require user accounts.

### Case document (conceptual schema)

```text
Case
├── title: String, required
├── story: String, required
├── premise: String, required
├── difficulty: enum(Easy, Medium, Hard)
├── suspects: Array
│   ├── id, name, description, alibi, motive
├── clues: Array
│   ├── id, title, description, privateMeaning
├── hints: Array of strings
├── solution
│   ├── culpritId
│   ├── explanation
│   └── reasoning
├── discoveredClueIds: Array of strings
├── hintsUsed: Number, default 0
├── status: enum(active, completed), default active
├── accusation
│   ├── suspectId
│   ├── isCorrect
│   └── submittedAt
├── score
│   ├── basePoints
│   ├── cluePoints
│   ├── hintPenalty
│   └── finalScore
├── createdAt
└── updatedAt
```

Use Mongoose timestamps. Add sensible length limits and enums. Use a MongoDB index on `createdAt` to support maintenance. Consider an expiry policy for old anonymous cases after the core flow works.

### Data exposure rule
Database documents contain private fields, but API responses must use explicit public-response serializers. Never return a raw Mongoose document. Active-case serializers must exclude `solution`, `privateMeaning`, correctness, and any hidden answer fields. Only the completed result endpoint may return the solution and score breakdown.

---

## 8. API Contract

Base URL: `http://localhost:5000` in local development. Production client requests use a configured API base URL.

### `GET /api/health`
Purpose: Verify that the API is running.
- Success: `{ "status": "ok" }`
- Must not reveal secrets or infrastructure details.

### `POST /api/cases`
Purpose: Generate and save a case.
- Request: `{ "premise": "A museum diamond disappeared during a storm.", "difficulty": "Easy" }`
- Success: `201 Created`, returning a public case representation and case ID.
- Errors: `400` invalid input, `502` AI generation/validation failure, `500` unexpected server error.
- Must never return the solution or private clue meanings.

### `GET /api/cases/:id`
Purpose: Retrieve an active case and current player progress.
- Success: `200 OK` with public case data, discovered clue IDs, hints used/remaining, and status.
- Errors: `400` malformed ID, `404` unknown case.
- Must not return hidden solution data. A completed case should be directed to the result flow without leaking solution through this endpoint.

### `POST /api/cases/:id/clues/:clueId/discover`
Purpose: Mark a clue as discovered.
- Success: `200 OK` with public clue information and updated progress.
- Repeated discovery is idempotent and grants no duplicate points.
- Errors: `400` malformed input, `404` unknown case/clue, `409` case already completed.

### `POST /api/cases/:id/hints`
Purpose: Return the next available hint.
- Request body may be empty.
- Success: `200 OK` with the hint and remaining-hints count.
- Each successful new hint applies one −10 point penalty.
- Errors: `404` unknown case, `409` completed case or no hints remaining.

### `POST /api/cases/:id/accuse`
Purpose: Submit the final accusation.
- Request: `{ "suspectId": "suspect_2" }`
- Success: `200 OK` with verdict and result identifier/status, but do not reveal the actual culprit or full solution in this response. The client then requests the result endpoint.
- Errors: `400` invalid suspect ID, `404` unknown case/suspect, `409` already completed case.
- The server compares the accusation with the stored solution and calculates the score.

### `GET /api/cases/:id/result`
Purpose: Retrieve the completed result.
- Success: `200 OK` with verdict, culprit, explanation, score breakdown, and final score.
- Errors: `404` unknown case, `409` case not completed.
- Must only reveal the solution after the final accusation.

### General API behavior
- Use consistent JSON errors, for example `{ "error": { "code": "INVALID_INPUT", "message": "Please check your input." } }`.
- Validate route parameters and request bodies.
- Use appropriate HTTP status codes.
- Add request-size limits and basic rate limiting, especially for AI generation and hint endpoints.
- Avoid logging secrets, full credentials, or unnecessary private data.
- Handle database disconnection and AI timeouts gracefully.
- Do not allow client-supplied fields to overwrite stored case state.

---

## 9. Security Requirements

1. Store `GEMINI_API_KEY` and `MONGODB_URI` only in the backend environment.
2. Never prefix server secrets with `VITE_`.
3. Keep `.env` files out of Git; commit `.env.example` with placeholder values only.
4. Configure CORS to allow the intended frontend origin only.
5. Validate and limit all user input.
6. Treat Gemini output as untrusted input and validate it before storage.
7. Keep culprit, solution explanation, private clue meanings, and correctness server-side until accusation is complete.
8. Never trust client-supplied score, clue totals, hint totals, verdict, or culprit.
9. Prevent duplicate clue points, excess hints, and repeated accusations.
10. Use safe error messages; do not send stack traces or credentials to the client.
11. Use HTTPS for deployed services.
12. Use anonymous random case IDs and avoid collecting personal information in the initial version.

Because the first version has no login, a case ID is effectively a bearer identifier. Do not describe it as private authentication. Add basic abuse protection and rate limits. Do not put secrets in URLs.

---

## 10. Environment Configuration

### Backend `server/.env.example`

```dotenv
PORT=5000
MONGODB_URI=mongodb_connection_string_here
GEMINI_API_KEY=replace_with_your_gemini_api_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create a real `server/.env` locally and never commit it.

### Frontend `client/.env.example`

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

Only the public API base URL belongs in the frontend environment. Never place the Gemini key or MongoDB URI in the client.

### MongoDB Atlas setup notes
1. Create an Atlas account and a project.
2. Create a free-tier cluster if available for the account/region.
3. Create a database user with a strong password; do not reuse the Atlas website login password.
4. Configure network access for development. Prefer the current IP address; avoid broad `0.0.0.0/0` access unless temporarily necessary and understood.
5. Copy the Node.js connection string, replace the password placeholder, and store it in `server/.env`.
6. Test the connection from the backend.
7. For deployment, configure the hosting provider's environment variables and Atlas network access securely.

Never share the real `.env` file or paste its secret values into chat, screenshots, or GitHub.

---

## 11. Error Handling and Reliability

- Invalid premise or difficulty: show field-level feedback.
- Gemini quota, timeout, or unavailable service: show a friendly retry message; do not create a partial case.
- Invalid Gemini JSON: retry once, then return a safe error.
- MongoDB unavailable: health/API requests report service failure without exposing credentials.
- Missing case or clue: show a not-found state.
- Repeated clue discovery: return existing progress without awarding extra points.
- No hints remaining: explain that the player has used all hints.
- Duplicate accusation: reject with conflict.
- Network failure: retain the current screen where possible and offer retry.
- Page refresh: reload current case and progress from the server.
- Unknown route: show a useful not-found page.

---

## 12. Testing Plan

### Functional tests
- Generate a case for each difficulty and verify counts.
- Reject empty, too-short, and too-long premises.
- Reject invalid difficulty values.
- Confirm case persists after page refresh.
- Discover the same clue twice and confirm points count once.
- Request all allowed hints and confirm the next request is rejected.
- Submit a valid accusation and confirm the case is completed.
- Attempt a second accusation and confirm it is rejected.
- Confirm score formula for correct and incorrect accusations.
- Confirm minimum score is zero.
- Confirm results are unavailable before accusation.

### Security tests
- Inspect active-case API responses for `solution`, `culpritId`, `privateMeaning`, and hidden correctness fields.
- Verify result endpoint returns `409` before accusation.
- Send a suspect ID not belonging to the case.
- Try to submit score or hint counters from the client and verify they are ignored.
- Check `.gitignore` and Git status to ensure `.env` files are not tracked.
- Confirm frontend build output contains no Gemini key or database URI.

### Deployment tests
- Open the deployed site in a fresh browser session.
- Generate an Easy case, discover clues, request a hint, accuse a suspect, and read the result.
- Test at least one other difficulty.
- Confirm frontend and backend URLs, CORS, environment variables, and database access work in production.
- Record the completed live flow for the demo video.

---

## 13. Deployment Plan

- MongoDB: MongoDB Atlas.
- Backend: a Node.js-capable hosting service such as Render.
- Frontend: Vercel or another static frontend host.

Configure production environment variables:
- Backend: `MONGODB_URI`, `GEMINI_API_KEY`, `CLIENT_URL`, `NODE_ENV`, and any required `PORT`.
- Frontend: `VITE_API_BASE_URL` set to the deployed backend API base URL.

Use the host-assigned port where required. Configure CORS for the deployed frontend domain. Redeploy after changing build-time frontend variables. Verify the whole flow using the public website rather than relying only on local testing.

---

## 14. Acceptance Criteria

The project is complete when:
- [ ] All three difficulty levels generate cases with the required counts.
- [ ] Gemini output is structurally validated before storage.
- [ ] MongoDB stores cases and player progress.
- [ ] Players can inspect suspects, discover clues, and request hints.
- [ ] Clue points and hint penalties are applied correctly.
- [ ] Players can submit one final accusation.
- [ ] The server computes the final score.
- [ ] Active API responses do not expose the culprit or solution.
- [ ] The result shows the correct verdict, culprit, explanation, and score.
- [ ] Errors and loading states are handled clearly.
- [ ] The app works on desktop and mobile layouts.
- [ ] A public GitHub repository contains the source and a useful README.
- [ ] The deployed website completes a full game.
- [ ] A short demo video shows the working application.
- [ ] The project submission form is completed before the deadline.

---

## 15. Submission Checklist

Required submission details:
- Project name: **AI Mystery Room**
- Short project description (2–3 sentences).
- Public GitHub repository URL.
- Live deployed application URL.
- Short demo video, as required by the submission form.
- Optional comments about features and limitations.

The README must include an overview, screenshots if available, features, technology stack, local setup, environment variable names, run commands, and deployment links. Never include real API keys or database credentials.

**Implementation rule:** Build incrementally. First establish the repository and specification, then create the frontend/backend skeleton, configure MongoDB, implement and test the API, integrate Gemini, build the UI, verify security, deploy, and prepare the submission.
