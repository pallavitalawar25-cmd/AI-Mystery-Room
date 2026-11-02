import {
  DIFFICULTY_RULES,
  PENALTY_PER_HINT,
  POINTS_PER_CLUE,
} from '../config/gameRules.js';

/** Calculate score from server-owned case progress, never client totals. */
export function calculateScore({ difficulty, isCorrect, discoveredClueCount, hintsUsed }) {
  const rules = DIFFICULTY_RULES[difficulty];
  if (!rules) throw new RangeError('A valid difficulty is required to calculate a score.');
  if (!Number.isInteger(discoveredClueCount) || discoveredClueCount < 0 || discoveredClueCount > rules.clues) {
    throw new RangeError('Discovered clue count is outside the allowed range.');
  }
  if (!Number.isInteger(hintsUsed) || hintsUsed < 0 || hintsUsed > rules.hints) {
    throw new RangeError('Hints used is outside the allowed range.');
  }

  const basePoints = isCorrect ? rules.basePoints : 0;
  const cluePoints = discoveredClueCount * POINTS_PER_CLUE;
  const hintPenalty = hintsUsed * PENALTY_PER_HINT;

  return {
    basePoints,
    cluePoints,
    hintPenalty,
    finalScore: Math.max(0, basePoints + cluePoints - hintPenalty),
  };
}
