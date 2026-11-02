import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { connectToDatabase } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import caseRoutes from './routes/caseRoutes.js';

const requiredEnvironmentVariables = ['MONGODB_URI', 'CLIENT_URL', 'GEMINI_API_KEY'];
const missingVariables = requiredEnvironmentVariables.filter(
  (name) => !process.env[name]?.trim(),
);

if (missingVariables.length > 0) {
  console.error(
    `Missing required environment variable(s): ${missingVariables.join(', ')}. ` +
      'Add them to server/.env before starting the backend.',
  );
  process.exit(1);
}

const port = Number(process.env.PORT || 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT must be a whole number between 1 and 65535.');
  process.exit(1);
}

const app = express();
const DATABASE_RETRY_DELAY_MS = 5000;

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_request, response) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  response
    .status(databaseConnected ? 200 : 503)
    .json({ status: databaseConnected ? 'ok' : 'unavailable' });
});

app.use('/api/cases', caseRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

async function connectUntilAvailable() {
  while (mongoose.connection.readyState !== 1) {
    try {
      await connectToDatabase(process.env.MONGODB_URI);
    } catch {
      // Drivers can include connection details in their errors, so keep this log generic.
      console.error(
        'Could not connect to MongoDB. Database-backed features are unavailable; retrying shortly.',
      );
      await new Promise((resolve) => setTimeout(resolve, DATABASE_RETRY_DELAY_MS));
    }
  }
}

app.listen(port, () => {
  console.log(`Backend server is listening on port ${port}.`);
});

void connectUntilAvailable();
