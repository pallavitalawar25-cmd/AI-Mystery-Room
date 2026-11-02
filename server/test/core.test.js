import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import express from 'express';
import Case from '../src/models/Case.js';
import caseRoutes from '../src/routes/caseRoutes.js';
import { errorHandler, notFoundHandler } from '../src/middleware/errorMiddleware.js';
import { DIFFICULTY_RULES } from '../src/config/gameRules.js';
import { parseAndValidate, validateMysteryFairness } from '../src/services/geminiService.js';
import { serializeActiveCase, serializeCompletedResult } from '../src/services/caseSerializers.js';
import { calculateScore } from '../src/services/scoringService.js';
import { createMysteryGenerationSchema, createCaseInputSchema } from '../src/schemas/caseSchemas.js';

const openServers = [];

function mysteryFor(difficulty) {
  const rules = DIFFICULTY_RULES[difficulty];
  const suspects = Array.from({ length: rules.suspects }, (_, index) => ({
    id: `suspect_${index + 1}`,
    name: index === 0 ? 'Al' : `Suspect ${index + 1}`,
    description: 'A person connected to this case.',
    alibi: 'They were elsewhere during part of the evening.',
    motive: 'They had a reason to visit.',
  }));
  const clues = Array.from({ length: rules.clues }, (_, index) => ({
    id: `clue_${index + 1}`,
    title: `Evidence Item ${index + 1}`,
    description: 'A player-visible observation.',
    privateMeaning: index < 2
      ? 'Al left a trace on this evidence.'
      : 'This detail also fits the timeline.',
  }));

  return {
    title: 'The Quiet Observatory',
    story: 'A valuable instrument disappeared from a locked observatory.',
    suspects,
    clues,
    hints: Array.from({ length: rules.hints }, (_, index) => `Compare the ${index + 1} recorded times.`),
    solution: {
      culpritId: 'suspect_1',
      explanation: 'Al took the instrument.',
      reasoning: 'Evidence Item 1 and Evidence Item 2 both place Al at the observatory.',
    },
  };
}

async function request(server, method, path, body) {
  const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
    method,
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      openServers.push(server);
      resolve(server);
    });
  });
}

after(async () => {
  await Promise.all(openServers.map((server) => new Promise((resolve) => server.close(resolve))));
});

describe('difficulty and generated mystery validation', () => {
  for (const [difficulty, rules] of Object.entries(DIFFICULTY_RULES)) {
    it(`${difficulty} requires exactly ${rules.suspects} suspects, ${rules.clues} clues, and ${rules.hints} hints`, () => {
      const mystery = mysteryFor(difficulty);
      assert.equal(createMysteryGenerationSchema(difficulty).safeParse(mystery).success, true);
      assert.doesNotThrow(() => validateMysteryFairness(mystery));
    });
  }

  it('rejects incorrect counts, unknown fields, and unsupported difficulties', () => {
    const easy = mysteryFor('Easy');
    assert.equal(createMysteryGenerationSchema('Easy').safeParse({ ...easy, clues: easy.clues.slice(1) }).success, false);
    assert.equal(createMysteryGenerationSchema('Easy').safeParse({ ...easy, unexpected: true }).success, false);
    assert.throws(() => createMysteryGenerationSchema('Impossible'), RangeError);
  });

  it('does not confuse a short suspect name with part of an ordinary word in meanings or hints', () => {
    const mystery = mysteryFor('Easy');
    mystery.clues[0].privateMeaning = 'This detail also matters.';
    mystery.clues[1].privateMeaning = 'This detail is also relevant.';
    mystery.hints = ['Review all the times before drawing a conclusion.', 'Compare the records carefully.'];
    assert.throws(() => validateMysteryFairness(mystery), /fairness/);

    mystery.clues[0].privateMeaning = 'Al left the mark on this item.';
    mystery.clues[1].privateMeaning = 'The item was handled by suspect_1.';
    assert.doesNotThrow(() => validateMysteryFairness(mystery));
  });

  it('requires two supporting clues and two clue titles in solution reasoning', () => {
    const mystery = mysteryFor('Easy');
    mystery.solution.reasoning = 'Evidence Item 1 settles the timeline.';
    assert.throws(() => validateMysteryFairness(mystery), /fairness/);
  });

  it('parses valid Gemini JSON and rejects malformed or incomplete responses safely', () => {
    const mystery = mysteryFor('Easy');
    assert.deepEqual(parseAndValidate(JSON.stringify(mystery), 'Easy'), mystery);
    assert.throws(() => parseAndValidate('{not json', 'Easy'), (error) => error.validationCategory === 'malformed_json');
    assert.throws(() => parseAndValidate(JSON.stringify({ title: 'Incomplete' }), 'Easy'), (error) => error.validationCategory === 'schema_validation');
    assert.throws(() => parseAndValidate('', 'Easy'), (error) => error.validationCategory === 'empty_response');
  });
});

describe('public and completed case serialization', () => {
  const sourceCase = {
    _id: '64b000000000000000000001',
    title: 'The Quiet Observatory',
    story: 'A case story.',
    premise: 'A valid long enough premise.',
    difficulty: 'Easy',
    suspects: mysteryFor('Easy').suspects,
    clues: mysteryFor('Easy').clues,
    hints: mysteryFor('Easy').hints,
    solution: { culpritId: 'suspect_1', explanation: 'Private answer.', reasoning: 'Private reasoning.' },
    discoveredClueIds: ['clue_1'],
    hintsUsed: 1,
    status: 'active',
    accusation: null,
    score: { basePoints: 0, cluePoints: 0, hintPenalty: 0, finalScore: 0 },
  };

  it('omits solution, culprit, private meanings, and score from active responses', () => {
    const serialized = serializeActiveCase(sourceCase);
    const serializedText = JSON.stringify(serialized);
    for (const secret of ['solution', 'culpritId', 'privateMeaning', 'Private answer', 'Private reasoning', 'score']) {
      assert.equal(serializedText.includes(secret), false);
    }
    assert.equal(serialized.hintsRemaining, 1);
    assert.deepEqual(serialized.discoveredClueIds, ['clue_1']);
  });

  it('only serializes solution details for a completed case', () => {
    assert.throws(() => serializeCompletedResult(sourceCase), /only after/);
    const completed = serializeCompletedResult({
      ...sourceCase,
      status: 'completed',
      accusation: { suspectId: 'suspect_1', isCorrect: true },
      score: { basePoints: 100, cluePoints: 5, hintPenalty: 10, finalScore: 95 },
    });
    assert.equal(completed.culprit.name, 'Al');
    assert.equal(completed.explanation, 'Private answer.');
    assert.equal(completed.score.finalScore, 95);
  });
});

describe('server-side scoring', () => {
  it('uses the base score for each difficulty and the clue/hint formula', () => {
    assert.deepEqual(calculateScore({ difficulty: 'Easy', isCorrect: true, discoveredClueCount: 2, hintsUsed: 1 }),
      { basePoints: 100, cluePoints: 10, hintPenalty: 10, finalScore: 100 });
    assert.deepEqual(calculateScore({ difficulty: 'Medium', isCorrect: true, discoveredClueCount: 7, hintsUsed: 3 }),
      { basePoints: 150, cluePoints: 35, hintPenalty: 30, finalScore: 155 });
    assert.deepEqual(calculateScore({ difficulty: 'Hard', isCorrect: true, discoveredClueCount: 9, hintsUsed: 3 }),
      { basePoints: 200, cluePoints: 45, hintPenalty: 30, finalScore: 215 });
    assert.deepEqual(calculateScore({ difficulty: 'Hard', isCorrect: false, discoveredClueCount: 0, hintsUsed: 3 }),
      { basePoints: 0, cluePoints: 0, hintPenalty: 30, finalScore: 0 });
  });

  it('rejects client-controlled out-of-range progress values', () => {
    assert.throws(() => calculateScore({ difficulty: 'Easy', isCorrect: true, discoveredClueCount: 6, hintsUsed: 0 }), RangeError);
    assert.throws(() => calculateScore({ difficulty: 'Easy', isCorrect: true, discoveredClueCount: 0, hintsUsed: 3 }), RangeError);
  });
});

describe('request validation and safe API errors without MongoDB', () => {
  it('serves playable scenarios and backend difficulty rules without database access', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/cases', caseRoutes);
    app.use(notFoundHandler);
    app.use(errorHandler);
    const server = await listen(app);

    const options = await request(server, 'GET', '/api/cases/options');
    assert.equal(options.status, 200);
    assert.ok(options.body.scenarios.some(({ id }) => id === 'royal-letter'));
    assert.ok(options.body.scenarios.some(({ id }) => id === 'empty-compartment'));
    assert.deepEqual(options.body.difficulties, Object.entries(DIFFICULTY_RULES).map(([name, rules]) => ({
      name,
      ...rules,
    })));
    assert.equal(JSON.stringify(options.body).includes('culprit'), false);
    assert.equal(JSON.stringify(options.body).includes('privateMeaning'), false);
  });

  it('trims valid premises and rejects short input or client score fields', () => {
    assert.equal(createCaseInputSchema.parse({ premise: '  A premise long enough  ', difficulty: 'Easy' }).premise, 'A premise long enough');
    assert.equal(createCaseInputSchema.safeParse({ premise: 'short', difficulty: 'Easy' }).success, false);
    assert.equal(createCaseInputSchema.safeParse({ premise: 'A premise long enough.', difficulty: 'Easy', score: 999 }).success, false);
  });

  it('returns safe 400 errors for malformed create and case requests before database access', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/cases', caseRoutes);
    app.use(notFoundHandler);
    app.use(errorHandler);
    const server = await listen(app);

    const invalidCreate = await request(server, 'POST', '/api/cases', { premise: 'too short', difficulty: 'Easy' });
    assert.equal(invalidCreate.status, 400);
    assert.equal(invalidCreate.body.error.code, 'INVALID_INPUT');

    const invalidId = await request(server, 'GET', '/api/cases/not-a-mongo-id');
    assert.equal(invalidId.status, 400);
    assert.equal(invalidId.body.error.code, 'INVALID_INPUT');
  });

  it('enforces model difficulty counts and referential integrity without a database', async () => {
    const mismatch = new Case({ ...mysteryFor('Easy'), premise: 'A premise long enough', difficulty: 'Easy', clues: mysteryFor('Easy').clues.slice(1) });
    await assert.rejects(mismatch.validate(), /Clue count must match/);

    const invalidCulprit = new Case({ ...mysteryFor('Easy'), premise: 'A premise long enough', difficulty: 'Easy', solution: { culpritId: 'missing', explanation: 'x', reasoning: 'y' } });
    await assert.rejects(invalidCulprit.validate(), /Culprit ID must match/);
  });
});
