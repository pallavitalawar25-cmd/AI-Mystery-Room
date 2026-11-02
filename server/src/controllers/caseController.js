import mongoose from 'mongoose';
import Case from '../models/Case.js';
import { DIFFICULTY_RULES, PENALTY_PER_HINT, POINTS_PER_CLUE } from '../config/gameRules.js';
import {
  caseIdParamSchema,
  clueIdParamSchema,
  accusationInputSchema,
  createCaseInputSchema,
  hintInputSchema,
} from '../schemas/caseSchemas.js';
import {
  serializeActiveCase,
  serializeCompletedResult,
} from '../services/caseSerializers.js';
import { generateCaseContent } from '../services/caseGenerationService.js';
import { PLAYABLE_SCENARIOS } from '../services/templateMysteryService.js';
import { calculateScore } from '../services/scoringService.js';
import { validateData } from '../validators/validate.js';

function createApiError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  if (status >= 500) error.safeMessage = message;
  return error;
}

function requireDatabaseConnection() {
  if (mongoose.connection.readyState !== 1) {
    throw createApiError(
      503,
      'DATABASE_UNAVAILABLE',
      'The database is temporarily unavailable. Please try again.',
    );
  }
}

export function getCaseOptions(_request, response) {
  response.status(200).json({
    scenarios: PLAYABLE_SCENARIOS,
    difficulties: Object.entries(DIFFICULTY_RULES).map(([name, rules]) => ({
      name,
      ...rules,
    })),
  });
}

async function findActiveCaseOrThrow(caseId) {
  const caseDocument = await Case.findById(caseId);
  if (!caseDocument) {
    throw createApiError(404, 'CASE_NOT_FOUND', 'The requested case was not found.');
  }
  if (caseDocument.status !== 'active') {
    throw createApiError(
      409,
      'CASE_COMPLETED',
      'This case is complete. Continue to the result page.',
    );
  }
  return caseDocument;
}

export function createCaseHandler(generateContent = generateCaseContent) {
  return async function createCase(request, response) {
    const input = validateData(createCaseInputSchema, request.body, 'Request');

    requireDatabaseConnection();

    const { mystery, generationSource } = await generateContent(input);
    const savedCase = await Case.create({
      ...mystery,
      premise: input.premise,
      difficulty: input.difficulty,
      generationSource,
    });

    response.status(201).json(serializeActiveCase(savedCase));
  };
}

export const createCase = createCaseHandler();

export async function getActiveCase(request, response) {
  const caseId = validateData(caseIdParamSchema, request.params.id, 'Case ID');
  requireDatabaseConnection();

  const caseDocument = await findActiveCaseOrThrow(caseId);
  response.status(200).json(serializeActiveCase(caseDocument));
}

export async function discoverClue(request, response) {
  const caseId = validateData(caseIdParamSchema, request.params.id, 'Case ID');
  const clueId = validateData(clueIdParamSchema, request.params.clueId, 'Clue ID');
  requireDatabaseConnection();

  const currentCase = await findActiveCaseOrThrow(caseId);
  const clue = currentCase.clues.find((item) => item.id === clueId);
  if (!clue) {
    throw createApiError(404, 'CLUE_NOT_FOUND', 'The requested clue was not found.');
  }

  // The filter and update are atomic: concurrent/repeated requests can award this clue once.
  const updatedCase = await Case.findOneAndUpdate(
    {
      _id: caseId,
      status: 'active',
      'clues.id': clueId,
      discoveredClueIds: { $ne: clueId },
    },
    { $addToSet: { discoveredClueIds: clueId } },
    { returnDocument: 'after', runValidators: true },
  );

  if (!updatedCase) {
    const latestCase = await findActiveCaseOrThrow(caseId);
    const stillExists = latestCase.clues.some((item) => item.id === clueId);
    if (!stillExists) {
      throw createApiError(404, 'CLUE_NOT_FOUND', 'The requested clue was not found.');
    }

    response.status(200).json({
      clue: { id: clue.id, title: clue.title, description: clue.description },
      progress: {
        discoveredClueIds: [...latestCase.discoveredClueIds],
        discoveredClueCount: latestCase.discoveredClueIds.length,
        totalClues: latestCase.clues.length,
      },
      pointsAwarded: 0,
    });
    return;
  }

  response.status(200).json({
    clue: { id: clue.id, title: clue.title, description: clue.description },
    progress: {
      discoveredClueIds: [...updatedCase.discoveredClueIds],
      discoveredClueCount: updatedCase.discoveredClueIds.length,
      totalClues: updatedCase.clues.length,
    },
    pointsAwarded: POINTS_PER_CLUE,
  });
}

export async function requestHint(request, response) {
  const caseId = validateData(caseIdParamSchema, request.params.id, 'Case ID');
  // Accept an empty body, but reject client-supplied progress or score values.
  validateData(hintInputSchema, request.body ?? {}, 'Request');
  requireDatabaseConnection();

  const currentCase = await findActiveCaseOrThrow(caseId);
  const hintLimit = DIFFICULTY_RULES[currentCase.difficulty].hints;
  if (currentCase.hintsUsed >= hintLimit) {
    throw createApiError(409, 'NO_HINTS_REMAINING', 'No hints remain for this case.');
  }
  if (typeof currentCase.hints[currentCase.hintsUsed] !== 'string') {
    throw createApiError(503, 'HINT_UNAVAILABLE', 'The hint could not be provided. Please try again.');
  }

  // Conditional increment makes the hint limit safe if requests arrive concurrently.
  const updatedCase = await Case.findOneAndUpdate(
    { _id: caseId, status: 'active', hintsUsed: { $lt: hintLimit } },
    { $inc: { hintsUsed: 1 } },
    { returnDocument: 'after', runValidators: true },
  );

  if (!updatedCase) {
    const latestCase = await findActiveCaseOrThrow(caseId);
    if (latestCase.hintsUsed >= hintLimit) {
      throw createApiError(409, 'NO_HINTS_REMAINING', 'No hints remain for this case.');
    }
    throw createApiError(503, 'PROGRESS_UPDATE_FAILED', 'The hint could not be provided. Please try again.');
  }

  const hint = updatedCase.hints[updatedCase.hintsUsed - 1];
  if (!hint) {
    throw createApiError(500, 'HINT_UNAVAILABLE', 'The hint could not be provided. Please try again.');
  }

  response.status(200).json({
    hint,
    hintsUsed: updatedCase.hintsUsed,
    hintsRemaining: hintLimit - updatedCase.hintsUsed,
    penaltyApplied: PENALTY_PER_HINT,
  });
}

export async function accuseCase(request, response) {
  const caseId = validateData(caseIdParamSchema, request.params.id, 'Case ID');
  const { suspectId } = validateData(
    accusationInputSchema,
    request.body,
    'Accusation',
  );
  requireDatabaseConnection();

  // Retry if clue or hint progress changes while we calculate the final score.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const caseDocument = await Case.findById(caseId);
    if (!caseDocument) {
      throw createApiError(404, 'CASE_NOT_FOUND', 'The requested case was not found.');
    }
    if (caseDocument.status !== 'active') {
      throw createApiError(409, 'CASE_ALREADY_COMPLETED', 'This case has already been completed.');
    }

    const suspectExists = caseDocument.suspects.some((suspect) => suspect.id === suspectId);
    if (!suspectExists) {
      throw createApiError(404, 'SUSPECT_NOT_FOUND', 'The selected suspect was not found in this case.');
    }

    const isCorrect = suspectId === caseDocument.solution.culpritId;
    const score = calculateScore({
      difficulty: caseDocument.difficulty,
      isCorrect,
      discoveredClueCount: caseDocument.discoveredClueIds.length,
      hintsUsed: caseDocument.hintsUsed,
    });

    // Progress values in the filter prevent a concurrent clue or hint update
    // from being omitted from the final score. Status prevents duplicate accusations.
    const completedCase = await Case.findOneAndUpdate(
      {
        _id: caseId,
        status: 'active',
        hintsUsed: caseDocument.hintsUsed,
        discoveredClueIds: caseDocument.discoveredClueIds,
      },
      {
        $set: {
          status: 'completed',
          accusation: { suspectId, isCorrect, submittedAt: new Date() },
          score,
        },
      },
      { returnDocument: 'after', runValidators: true },
    );

    if (completedCase) {
      response.status(200).json({
        caseId: String(completedCase._id),
        status: 'completed',
        verdict: isCorrect ? 'correct' : 'incorrect',
      });
      return;
    }
  }

  throw createApiError(
    409,
    'CASE_PROGRESS_CHANGED',
    'Case progress changed during submission. Please try your accusation again.',
  );
}

export async function getCaseResult(request, response) {
  const caseId = validateData(caseIdParamSchema, request.params.id, 'Case ID');
  requireDatabaseConnection();

  const caseDocument = await Case.findById(caseId);
  if (!caseDocument) {
    throw createApiError(404, 'CASE_NOT_FOUND', 'The requested case was not found.');
  }
  if (caseDocument.status !== 'completed' || !caseDocument.accusation) {
    throw createApiError(409, 'CASE_NOT_COMPLETED', 'Submit your final accusation before viewing results.');
  }

  response.status(200).json(serializeCompletedResult(caseDocument));
}
