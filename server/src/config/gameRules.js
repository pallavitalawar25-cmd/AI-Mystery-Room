export const DIFFICULTY_RULES = Object.freeze({
  Easy: Object.freeze({ suspects: 3, clues: 5, hints: 2, basePoints: 100 }),
  Medium: Object.freeze({ suspects: 4, clues: 7, hints: 3, basePoints: 150 }),
  Hard: Object.freeze({ suspects: 5, clues: 9, hints: 3, basePoints: 200 }),
});

export const DIFFICULTIES = Object.freeze(Object.keys(DIFFICULTY_RULES));
export const POINTS_PER_CLUE = 5;
export const PENALTY_PER_HINT = 10;
