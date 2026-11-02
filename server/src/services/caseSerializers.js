import { DIFFICULTY_RULES } from '../config/gameRules.js';

function asPlainObject(caseDocument) {
  return typeof caseDocument.toObject === 'function'
    ? caseDocument.toObject()
    : caseDocument;
}

/** Only returns fields that are safe to expose while a case is active. */
export function serializeActiveCase(caseDocument) {
  const caseData = asPlainObject(caseDocument);
  const hintsAllowed = DIFFICULTY_RULES[caseData.difficulty]?.hints ?? 0;

  return {
    id: String(caseData._id ?? caseData.id),
    title: caseData.title,
    story: caseData.story,
    difficulty: caseData.difficulty,
    generationSource: caseData.generationSource || 'gemini',
    suspects: caseData.suspects.map(({ id, name, description, alibi, motive }) => ({
      id,
      name,
      description,
      alibi,
      motive,
    })),
    clues: caseData.clues.map(({ id, title, description }) => ({ id, title, description })),
    discoveredClueIds: [...(caseData.discoveredClueIds ?? [])],
    hintsUsed: caseData.hintsUsed ?? 0,
    hintsRemaining: Math.max(0, hintsAllowed - (caseData.hintsUsed ?? 0)),
    status: caseData.status,
  };
}

/** Call only after status is completed; returns the answer and server-stored score. */
export function serializeCompletedResult(caseDocument) {
  const caseData = asPlainObject(caseDocument);
  if (caseData.status !== 'completed' || !caseData.accusation) {
    throw new Error('A case result is available only after a final accusation.');
  }

  const culprit = caseData.suspects.find(
    (suspect) => suspect.id === caseData.solution.culpritId,
  );

  return {
    id: String(caseData._id ?? caseData.id),
    status: caseData.status,
    verdict: caseData.accusation.isCorrect ? 'correct' : 'incorrect',
    culprit: culprit
      ? { id: culprit.id, name: culprit.name }
      : { id: caseData.solution.culpritId },
    explanation: caseData.solution.explanation,
    reasoning: caseData.solution.reasoning,
    score: {
      basePoints: caseData.score.basePoints,
      cluePoints: caseData.score.cluePoints,
      hintPenalty: caseData.score.hintPenalty,
      finalScore: caseData.score.finalScore,
    },
  };
}
