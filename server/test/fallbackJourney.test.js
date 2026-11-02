import 'dotenv/config';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import express from 'express';
import mongoose from 'mongoose';
import Case from '../src/models/Case.js';
import { createCaseHandler } from '../src/controllers/caseController.js';
import caseRoutes from '../src/routes/caseRoutes.js';
import { errorHandler, notFoundHandler } from '../src/middleware/errorMiddleware.js';
import { GeminiProviderUnavailableError } from '../src/services/geminiService.js';
import { generateCaseContent } from '../src/services/caseGenerationService.js';
import { generateTemplateMystery } from '../src/services/templateMysteryService.js';

const temporaryCaseIds = [];
let httpServer;
let baseUrl;

async function send(method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

describe('complete fallback mystery investigation (MongoDB integration)', {
  skip: !process.env.TEST_MONGODB_URI,
}, () => {
  before(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    const app = express();
    app.use(express.json());
    app.post('/api/cases', createCaseHandler((input) => generateCaseContent(input, {
      geminiGenerator: async () => { throw new GeminiProviderUnavailableError(); },
      templateGenerator: generateTemplateMystery,
    })));
    app.use('/api/cases', caseRoutes);
    app.use(notFoundHandler);
    app.use(errorHandler);
    httpServer = await new Promise((resolve) => {
      const server = app.listen(0, '127.0.0.1', () => resolve(server));
    });
    baseUrl = `http://127.0.0.1:${httpServer.address().port}`;
  });

  after(async () => {
    if (temporaryCaseIds.length && mongoose.connection.readyState === 1) {
      await Case.deleteMany({ _id: { $in: temporaryCaseIds } });
    }
    if (httpServer) await new Promise((resolve) => httpServer.close(resolve));
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });

  it('persists a provider-fallback case and completes clues, hint, accusation, and result flow', async () => {
    const input = {
      premise: 'A compass disappeared from a locked museum gallery.',
      difficulty: 'Easy',
    };
    const created = await send('POST', '/api/cases', input);
    assert.equal(created.status, 201);
    assert.equal(created.body.generationSource, 'template');
    temporaryCaseIds.push(created.body.id);
    const id = created.body.id;

    const active = await send('GET', `/api/cases/${id}`);
    assert.equal(active.status, 200);
    assert.equal(active.body.generationSource, 'template');
    assert.equal(active.body.suspects.length, 3);
    assert.equal(active.body.clues.length, 5);
    assert.equal(active.body.hintsRemaining, 2);
    assert.equal('solution' in active.body, false);
    assert.equal('culpritId' in active.body, false);
    assert.equal('score' in active.body, false);
    assert.equal(JSON.stringify(active.body).includes('privateMeaning'), false);

    const firstClue = await send('POST', `/api/cases/${id}/clues/clue_1/discover`, {});
    const duplicateClue = await send('POST', `/api/cases/${id}/clues/clue_1/discover`, {});
    const secondClue = await send('POST', `/api/cases/${id}/clues/clue_2/discover`, {});
    assert.equal(firstClue.body.pointsAwarded, 5);
    assert.equal(duplicateClue.body.pointsAwarded, 0);
    assert.equal(secondClue.body.pointsAwarded, 5);

    const hint = await send('POST', `/api/cases/${id}/hints`, {});
    assert.equal(hint.status, 200);
    assert.equal(hint.body.hintsUsed, 1);
    assert.equal(hint.body.penaltyApplied, 10);

    const accusation = await send('POST', `/api/cases/${id}/accuse`, { suspectId: 'suspect_2' });
    assert.equal(accusation.status, 200);
    assert.equal(accusation.body.verdict, 'correct');
    assert.equal('culprit' in accusation.body, false);
    assert.equal('solution' in accusation.body, false);

    const result = await send('GET', `/api/cases/${id}/result`);
    assert.equal(result.status, 200);
    assert.equal(result.body.verdict, 'correct');
    assert.equal(result.body.culprit.id, 'suspect_2');
    assert.deepEqual(result.body.score, {
      basePoints: 100,
      cluePoints: 10,
      hintPenalty: 10,
      finalScore: 100,
    });
  });
});
