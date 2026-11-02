import 'dotenv/config';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import express from 'express';
import mongoose from 'mongoose';
import Case from '../src/models/Case.js';
import caseRoutes from '../src/routes/caseRoutes.js';
import { errorHandler, notFoundHandler } from '../src/middleware/errorMiddleware.js';
import { serializeCompletedResult } from '../src/services/caseSerializers.js';
import { calculateScore } from '../src/services/scoringService.js';

const requiredCounts = { suspects: 3, clues: 5, hints: 2 };
const temporaryCaseIds = [];
let httpServer;
let baseUrl;

function makeCase(overrides = {}) {
  return {
    title: 'Temporary API test case',
    story: 'A short test story used to verify the case API.',
    premise: 'A gallery key vanished before closing time.',
    difficulty: 'Easy',
    suspects: Array.from({ length: requiredCounts.suspects }, (_, index) => ({
      id: `suspect_${index + 1}`,
      name: `Test Suspect ${index + 1}`,
      description: 'Public suspect details.',
      alibi: 'A test alibi.',
      motive: 'A test motive.',
    })),
    clues: Array.from({ length: requiredCounts.clues }, (_, index) => ({
      id: `clue_${index + 1}`,
      title: `Test clue ${index + 1}`,
      description: 'A clue description safe for the player.',
      privateMeaning: 'Private clue meaning for tests only.',
    })),
    hints: ['Review the timeline.', 'Compare the records.'],
    solution: {
      culpritId: 'suspect_2',
      explanation: 'Private explanation for tests only.',
      reasoning: 'Private reasoning for tests only.',
    },
    ...overrides,
  };
}

async function createTemporaryCase(overrides = {}) {
  const caseDocument = await Case.create(makeCase(overrides));
  temporaryCaseIds.push(caseDocument._id);
  return caseDocument;
}

async function send(method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

describe('case accusation and result API', () => {
  before(async () => {
    if (!process.env.TEST_MONGODB_URI) return;

    await mongoose.connect(process.env.TEST_MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    const app = express();
    app.use(express.json());
    app.use('/api/cases', caseRoutes);
    app.use(notFoundHandler);
    app.use(errorHandler);
    httpServer = await new Promise((resolve) => {
      const server = app.listen(0, () => resolve(server));
    });
    baseUrl = `http://127.0.0.1:${httpServer.address().port}`;
  });

  after(async () => {
    if (temporaryCaseIds.length > 0 && mongoose.connection.readyState === 1) {
      await Case.deleteMany({ _id: { $in: temporaryCaseIds } });
    }
    if (httpServer) await new Promise((resolve) => httpServer.close(resolve));
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });

  it('calculates difficulty scores, unique clue points, hint penalties, and the zero floor', () => {
    assert.deepEqual(
      calculateScore({ difficulty: 'Easy', isCorrect: true, discoveredClueCount: 2, hintsUsed: 1 }),
      { basePoints: 100, cluePoints: 10, hintPenalty: 10, finalScore: 100 },
    );
    assert.deepEqual(
      calculateScore({ difficulty: 'Medium', isCorrect: true, discoveredClueCount: 3, hintsUsed: 2 }),
      { basePoints: 150, cluePoints: 15, hintPenalty: 20, finalScore: 145 },
    );
    assert.deepEqual(
      calculateScore({ difficulty: 'Hard', isCorrect: true, discoveredClueCount: 9, hintsUsed: 3 }),
      { basePoints: 200, cluePoints: 45, hintPenalty: 30, finalScore: 215 },
    );
    assert.deepEqual(
      calculateScore({ difficulty: 'Easy', isCorrect: false, discoveredClueCount: 1, hintsUsed: 2 }),
      { basePoints: 0, cluePoints: 5, hintPenalty: 20, finalScore: 0 },
    );
  });

  it('scores a correct accusation from unique stored clues and successfully provided hints', {
    skip: !process.env.TEST_MONGODB_URI,
  }, async () => {
    const caseDocument = await createTemporaryCase();
    const id = String(caseDocument._id);

    const active = await send('GET', `/api/cases/${id}`);
    assert.equal(active.status, 200);
    assert.equal('solution' in active.body, false);
    assert.equal('score' in active.body, false);
    assert.equal('privateMeaning' in active.body.clues[0], false);

    const preAccusationResult = await send('GET', `/api/cases/${id}/result`);
    assert.equal(preAccusationResult.status, 409);

    const firstDiscovery = await send('POST', `/api/cases/${id}/clues/clue_1/discover`, {});
    const repeatDiscovery = await send('POST', `/api/cases/${id}/clues/clue_1/discover`, {});
    assert.equal(firstDiscovery.status, 200);
    assert.equal(firstDiscovery.body.pointsAwarded, 5);
    assert.equal(repeatDiscovery.status, 200);
    assert.equal(repeatDiscovery.body.pointsAwarded, 0);
    assert.equal(repeatDiscovery.body.progress.discoveredClueCount, 1);

    const firstHint = await send('POST', `/api/cases/${id}/hints`, {});
    const secondHint = await send('POST', `/api/cases/${id}/hints`, {});
    assert.equal(firstHint.status, 200);
    assert.equal(firstHint.body.penaltyApplied, 10);
    assert.equal(secondHint.status, 200);
    assert.equal(secondHint.body.hintsRemaining, 0);
    assert.equal((await send('POST', `/api/cases/${id}/hints`, {})).status, 409);

    const manipulated = await send('POST', `/api/cases/${id}/accuse`, {
      suspectId: 'suspect_2',
      score: { finalScore: 999999 },
    });
    assert.equal(manipulated.status, 400);
    assert.equal((await Case.findById(id).select('status')).status, 'active');

    const accusation = await send('POST', `/api/cases/${id}/accuse`, { suspectId: 'suspect_2' });
    assert.equal(accusation.status, 200);
    assert.equal(accusation.body.verdict, 'correct');
    assert.equal('culprit' in accusation.body, false);
    assert.equal('solution' in accusation.body, false);
    assert.equal((await send('POST', `/api/cases/${id}/accuse`, { suspectId: 'suspect_1' })).status, 409);

    const stored = await Case.findById(id).lean();
    assert.equal(stored.status, 'completed');
    assert.equal(stored.accusation.suspectId, 'suspect_2');
    assert.deepEqual(stored.score, { basePoints: 100, cluePoints: 5, hintPenalty: 20, finalScore: 85 });
    const completedDocument = await Case.findById(id);
    assert.doesNotThrow(() => serializeCompletedResult(completedDocument));

    const result = await send('GET', `/api/cases/${id}/result`);
    assert.equal(result.status, 200);
    assert.equal(result.body.verdict, 'correct');
    assert.equal(result.body.culprit.id, 'suspect_2');
    assert.deepEqual(result.body.score, stored.score);
  });

  it('scores an incorrect accusation with zero base points and returns the stored solution only in results', {
    skip: !process.env.TEST_MONGODB_URI,
  }, async () => {
    const caseDocument = await createTemporaryCase({
      discoveredClueIds: ['clue_1', 'clue_2', 'clue_3'],
      hintsUsed: 2,
    });
    const id = String(caseDocument._id);

    const accusation = await send('POST', `/api/cases/${id}/accuse`, { suspectId: 'suspect_1' });
    assert.equal(accusation.status, 200);
    assert.equal(accusation.body.verdict, 'incorrect');
    assert.equal('culprit' in accusation.body, false);

    const stored = await Case.findById(id).lean();
    assert.equal(stored.accusation.suspectId, 'suspect_1');
    assert.deepEqual(stored.score, { basePoints: 0, cluePoints: 15, hintPenalty: 20, finalScore: 0 });
    const result = await send('GET', `/api/cases/${id}/result`);
    assert.equal(result.status, 200);
    assert.equal(result.body.verdict, 'incorrect');
    assert.equal(result.body.culprit.id, 'suspect_2');
    assert.equal(result.body.explanation, 'Private explanation for tests only.');
  });

  it('rejects malformed, missing, and unknown accusation or result requests', {
    skip: !process.env.TEST_MONGODB_URI,
  }, async () => {
    assert.equal((await send('POST', '/api/cases/bad-id/accuse', { suspectId: 'suspect_1' })).status, 400);
    assert.equal((await send('GET', '/api/cases/bad-id/result')).status, 400);
    assert.equal((await send('POST', '/api/cases/64b000000000000000000001/accuse', { suspectId: 'suspect_1' })).status, 404);
    assert.equal((await send('GET', '/api/cases/64b000000000000000000001/result')).status, 404);
    const caseDocument = await createTemporaryCase();
    assert.equal((await send('POST', `/api/cases/${caseDocument._id}/accuse`, { suspectId: 'missing_suspect' })).status, 404);
    assert.equal((await send('POST', `/api/cases/${caseDocument._id}/accuse`, {})).status, 400);
  });
});
