import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DIFFICULTY_RULES } from '../src/config/gameRules.js';
import { serializeActiveCase } from '../src/services/caseSerializers.js';
import {
  GeminiProviderUnavailableError,
  MysteryGenerationError,
  isGeminiProviderUnavailable,
  validateMysteryFairness,
} from '../src/services/geminiService.js';
import { generateCaseContent } from '../src/services/caseGenerationService.js';
import {
  generateTemplateMystery,
  getTemplateScenarioId,
  PLAYABLE_SCENARIOS,
  validateTemplateMysteryConsistency,
} from '../src/services/templateMysteryService.js';
import { calculateScore } from '../src/services/scoringService.js';
import { validateGeneratedMystery } from '../src/validators/validate.js';

const input = {
  premise: 'A compass disappeared from a locked museum gallery.',
  difficulty: 'Easy',
};

const supportedPremises = [
  'A missing letter from the royal archive',
  'A missing person vanished from a mountain lodge',
  'A passenger disappeared from a train during its journey.',
  'A theatre brooch was stolen before opening night',
  'A museum artifact disappeared during a blackout',
  'A locked-room orchid mystery at a conservatory',
  'Missing evidence from a forensic archive',
  'A missing manuscript page at a printing press',
  'A missing recording reel from a radio station',
  'A rare biological sample vanished from a locked research laboratory.',
  'Unusual premise number 0 about an observatory',
  'Unusual premise number 1 about an observatory',
];

describe('deterministic template mystery generation', () => {
  for (const [difficulty, counts] of Object.entries(DIFFICULTY_RULES)) {
    it(`${difficulty} fallback has the required counts and a consistent solution`, () => {
      const mystery = validateGeneratedMystery(
        generateTemplateMystery({ ...input, difficulty }),
        difficulty,
      );

      assert.equal(mystery.suspects.length, counts.suspects);
      assert.equal(mystery.clues.length, counts.clues);
      assert.equal(mystery.hints.length, counts.hints);
      assert.equal(mystery.solution.culpritId, 'suspect_2');
      const culprit = mystery.suspects.find(({ id }) => id === mystery.solution.culpritId);
      assert.ok(mystery.clues.filter((clue) => clue.privateMeaning.includes(culprit.name)).length >= 2);
      assert.doesNotThrow(() => validateMysteryFairness(mystery));
      assert.ok(mystery.solution.reasoning.includes(mystery.clues[0].title));
      assert.ok(mystery.solution.reasoning.includes(mystery.clues[1].title));
      assert.ok(mystery.story.includes(input.premise));
      for (const hint of mystery.hints) {
        for (const suspect of mystery.suspects) {
          assert.equal(hint.includes(suspect.name), false);
          assert.equal(hint.includes(suspect.id), false);
        }
      }
    });
  }

  it('selects premise-specific authored mysteries deterministically', () => {
    assert.equal(getTemplateScenarioId('A missing letter from the royal archive'), 'missing-letter');
    assert.equal(getTemplateScenarioId(PLAYABLE_SCENARIOS[0].premise), 'royal-letter');
    assert.equal(getTemplateScenarioId('A missing person'), 'missing-person');
    assert.equal(getTemplateScenarioId('A museum artifact was stolen'), 'museum-artifact');
    assert.equal(getTemplateScenarioId('A passenger disappeared from a train during its journey.'), 'missing-train-passenger');
    assert.equal(getTemplateScenarioId('A rare biological sample vanished from a locked research laboratory.'), 'biological-sample-lab');
    assert.equal(getTemplateScenarioId(supportedPremises[10]), 'generic-switchboard');
    assert.equal(getTemplateScenarioId(supportedPremises[11]), 'generic-clocktower');
    const generated = supportedPremises.map((premise) => generateTemplateMystery({ premise, difficulty: 'Hard' }));
    assert.equal(new Set(generated.map((mystery) => mystery.title)).size, supportedPremises.length);
    assert.equal(new Set(generated.map((mystery) => mystery.suspects.map((s) => s.name).join('|'))).size, supportedPremises.length);
    assert.equal(new Set(generated.map((mystery) => mystery.clues.map((c) => c.title).join('|'))).size, supportedPremises.length);
    assert.deepEqual(
      supportedPremises.map((premise) => getTemplateScenarioId(premise)),
      supportedPremises.map((premise) => getTemplateScenarioId(premise)),
    );
  });

  it('keeps every playable catalogue scenario mapped to an authored case at every difficulty', () => {
    for (const scenario of PLAYABLE_SCENARIOS) {
      assert.equal(getTemplateScenarioId(scenario.premise), scenario.templateId, scenario.title);

      for (const [difficulty, counts] of Object.entries(DIFFICULTY_RULES)) {
        const mystery = validateGeneratedMystery(
          generateTemplateMystery({ premise: scenario.premise, difficulty }),
          difficulty,
        );
        assert.equal(mystery.suspects.length, counts.suspects, `${scenario.title}: ${difficulty} suspects`);
        assert.equal(mystery.clues.length, counts.clues, `${scenario.title}: ${difficulty} clues`);
        assert.equal(mystery.hints.length, counts.hints, `${scenario.title}: ${difficulty} hints`);
        assert.equal(mystery.solution.culpritId, 'suspect_2');
        assert.doesNotThrow(() => validateTemplateMysteryConsistency(mystery));
      }
    }
  });

  it('validates every authored scenario at every difficulty', () => {
    for (const premise of supportedPremises) {
      for (const difficulty of Object.keys(DIFFICULTY_RULES)) {
        const mystery = validateGeneratedMystery(generateTemplateMystery({ premise, difficulty }), difficulty);
        assert.doesNotThrow(() => validateTemplateMysteryConsistency(mystery));
        const culprit = mystery.suspects.find(({ id }) => id === mystery.solution.culpritId);
        assert.ok(mystery.solution.explanation.includes(culprit.name.replace(/^Dr\.?\s+/i, '')));
        assert.equal(new Set(mystery.clues.map(({ title }) => title)).size, mystery.clues.length);
        assert.ok(mystery.clues.filter((clue) => clue.privateMeaning.includes(culprit.name)).length >= 2);
        assert.doesNotThrow(() => validateMysteryFairness(mystery));
        assert.ok(mystery.solution.reasoning.includes(mystery.clues[0].title));
        assert.ok(mystery.solution.reasoning.includes(mystery.clues[1].title));
        assert.ok(mystery.story.includes(mystery.title.split(' ')[1]) || mystery.story.includes(premise));
      }
    }
  });

  it('keeps every clue relevant to the incident and every named person established', () => {
    for (const premise of supportedPremises) {
      const mystery = generateTemplateMystery({ premise, difficulty: 'Hard' });
      const suspectNames = mystery.suspects.map(({ name }) => name.replace(/^Dr\.?\s+/i, '').toLowerCase());
      for (const clue of mystery.clues) {
        const meaning = clue.privateMeaning.replace(/^Dr\.?\s+/i, '').toLowerCase();
        assert.ok(suspectNames.some((name) => meaning.includes(name)), `${clue.title} must test a suspect in ${mystery.title}`);
        assert.ok(clue.description.trim().length > 0);
      }
      assert.equal(new Set(mystery.clues.map(({ title }) => title)).size, mystery.clues.length);
      assert.doesNotThrow(() => validateTemplateMysteryConsistency(mystery));
    }
  });

  it('maps the train passenger, royal letter, and biological sample premises to the actual incident', () => {
    const train = generateTemplateMystery({ premise: supportedPremises[2], difficulty: 'Easy' });
    const letter = generateTemplateMystery({ premise: supportedPremises[0], difficulty: 'Easy' });
    const sample = generateTemplateMystery({ premise: supportedPremises[9], difficulty: 'Easy' });
    assert.equal(train.title, 'The Empty Compartment');
    assert.match(train.story, /passenger Ada Lin vanished.*North Line/i);
    assert.equal(letter.title, 'The Salt-Stained Letter');
    assert.match(letter.story, /warning letter vanished.*archive/i);
    assert.equal(sample.title, 'The Empty Cryovial');
    assert.match(sample.story, /biological sample vanished.*research laboratory/i);
    for (const mystery of [train, letter, sample]) {
      assert.equal(mystery.suspects.length, 3);
      assert.equal(mystery.clues.length, 5);
      assert.equal(mystery.hints.length, 2);
    }
  });

  it('keeps the template source public while hiding private case data', () => {
    const privateMystery = generateTemplateMystery({
      premise: 'A passenger disappeared from a train during its journey.',
      difficulty: 'Easy',
    });
    const active = serializeActiveCase({
      ...privateMystery,
      _id: '64b000000000000000000001',
      difficulty: 'Easy',
      generationSource: 'template',
      discoveredClueIds: [],
      hintsUsed: 0,
      status: 'active',
      score: { basePoints: 0, cluePoints: 0, hintPenalty: 0, finalScore: 0 },
    });
    const response = JSON.stringify(active);

    assert.equal(active.generationSource, 'template');
    assert.equal(response.includes('solution'), false);
    assert.equal(response.includes('culpritId'), false);
    assert.equal(response.includes('privateMeaning'), false);
    assert.equal(response.includes('score'), false);
  });

  it('uses existing server scoring rules for a template case', () => {
    assert.deepEqual(
      calculateScore({ difficulty: 'Hard', isCorrect: true, discoveredClueCount: 9, hintsUsed: 3 }),
      { basePoints: 200, cluePoints: 45, hintPenalty: 30, finalScore: 215 },
    );
    assert.deepEqual(
      calculateScore({ difficulty: 'Easy', isCorrect: false, discoveredClueCount: 5, hintsUsed: 2 }),
      { basePoints: 0, cluePoints: 25, hintPenalty: 20, finalScore: 5 },
    );
  });

  it('scores correct and incorrect accusations from backend-controlled difficulty rules', () => {
    assert.equal(calculateScore({ difficulty: 'Easy', isCorrect: true, discoveredClueCount: 2, hintsUsed: 1 }).finalScore, 100);
    assert.equal(calculateScore({ difficulty: 'Medium', isCorrect: false, discoveredClueCount: 3, hintsUsed: 1 }).finalScore, 5);
  });
});

describe('Gemini recovery and fallback selection', () => {
  it('falls back after a transient provider 503 and tags the source', async () => {
    let fallbackCalls = 0;
    const result = await generateCaseContent(input, {
      geminiGenerator: async () => {
        throw new GeminiProviderUnavailableError();
      },
      templateGenerator: (value) => {
        fallbackCalls += 1;
        return generateTemplateMystery(value);
      },
    });

    assert.equal(fallbackCalls, 1);
    assert.equal(result.generationSource, 'template');
    assert.equal(result.mystery.suspects.length, 3);
  });

  it('keeps Gemini primary when it returns a valid case', async () => {
    let fallbackCalls = 0;
    const result = await generateCaseContent(input, {
      geminiGenerator: async (value) => generateTemplateMystery(value),
      templateGenerator: () => {
        fallbackCalls += 1;
        return generateTemplateMystery(input);
      },
    });

    assert.equal(result.generationSource, 'gemini');
    assert.equal(fallbackCalls, 0);
  });

  it('does not fall back for schema or programming errors', async () => {
    let fallbackCalls = 0;
    const templateGenerator = () => {
      fallbackCalls += 1;
      return generateTemplateMystery(input);
    };

    await assert.rejects(
      generateCaseContent(input, {
        geminiGenerator: async () => ({ title: 'invalid schema' }),
        templateGenerator,
      }),
    );
    await assert.rejects(
      generateCaseContent(input, {
        geminiGenerator: async () => { throw new MysteryGenerationError(); },
        templateGenerator,
      }),
    );
    await assert.rejects(
      generateCaseContent(input, {
        geminiGenerator: async () => { throw new TypeError('programming error'); },
        templateGenerator,
      }),
    );
    assert.equal(fallbackCalls, 0);
  });

  it('classifies availability errors without treating validation errors as outages', () => {
    assert.equal(isGeminiProviderUnavailable({ status: 504 }), true);
    assert.equal(isGeminiProviderUnavailable({ status: 503 }), true);
    assert.equal(isGeminiProviderUnavailable({ name: 'RequestTimeoutError' }), true);
    assert.equal(isGeminiProviderUnavailable(Object.assign(new Error(), { status: 400 })), false);
    assert.equal(isGeminiProviderUnavailable(new MysteryGenerationError()), false);
    assert.equal(isGeminiProviderUnavailable(new Error('invalid mystery schema')), false);
    assert.ok(new GeminiProviderUnavailableError() instanceof Error);
  });
});
