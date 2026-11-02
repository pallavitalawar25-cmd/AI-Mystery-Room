import { z } from 'zod';
import { DIFFICULTIES, DIFFICULTY_RULES } from '../config/gameRules.js';

const shortText = (maximum) => z.string().trim().min(1).max(maximum);
const internalId = z.string().trim().min(1).max(80);

const suspectSchema = z
  .object({
    id: internalId,
    name: shortText(100),
    description: shortText(1000),
    alibi: shortText(1000),
    motive: shortText(1000),
  })
  .strict();

const clueSchema = z
  .object({
    id: internalId,
    title: shortText(120),
    description: shortText(1500),
    privateMeaning: shortText(1500),
  })
  .strict();

const generationStructureSchema = z
  .object({
    title: shortText(160),
    story: shortText(5000),
    suspects: z.array(suspectSchema),
    clues: z.array(clueSchema),
    hints: z.array(shortText(500)),
    solution: z
      .object({
        culpritId: internalId,
        explanation: shortText(3000),
        reasoning: shortText(5000),
      })
      .strict(),
  })
  .strict();

/** Build the strict Gemini output schema for the selected difficulty. */
export function createMysteryGenerationSchema(difficulty) {
  const rules = DIFFICULTY_RULES[difficulty];
  if (!rules) {
    throw new RangeError('A valid mystery difficulty is required.');
  }

  return generationStructureSchema.superRefine((mystery, context) => {
    for (const field of ['suspects', 'clues', 'hints']) {
      if (mystery[field].length !== rules[field]) {
        context.addIssue({
          code: 'custom',
          path: [field],
          message: `${difficulty} mysteries require exactly ${rules[field]} ${field}.`,
        });
      }
    }

    const suspectIds = new Set();
    const suspectNames = new Set();
    mystery.suspects.forEach((suspect, index) => {
      const normalizedName = suspect.name.toLocaleLowerCase();
      if (suspectIds.has(suspect.id)) {
        context.addIssue({ code: 'custom', path: ['suspects', index, 'id'], message: 'Suspect IDs must be unique.' });
      }
      if (suspectNames.has(normalizedName)) {
        context.addIssue({ code: 'custom', path: ['suspects', index, 'name'], message: 'Suspect names must be unique.' });
      }
      suspectIds.add(suspect.id);
      suspectNames.add(normalizedName);
    });

    const clueIds = new Set();
    mystery.clues.forEach((clue, index) => {
      if (clueIds.has(clue.id)) {
        context.addIssue({ code: 'custom', path: ['clues', index, 'id'], message: 'Clue IDs must be unique.' });
      }
      clueIds.add(clue.id);
    });

    if (!suspectIds.has(mystery.solution.culpritId)) {
      context.addIssue({
        code: 'custom',
        path: ['solution', 'culpritId'],
        message: 'The culprit ID must match one of the generated suspects.',
      });
    }
  });
}

export const difficultySchema = z.enum(DIFFICULTIES);

export const createCaseInputSchema = z
  .object({
    premise: z.string().trim().min(10, 'Premise must be at least 10 characters.').max(500),
    difficulty: difficultySchema,
  })
  .strict();

export const accusationInputSchema = z
  .object({ suspectId: internalId })
  .strict();

// Hint requests accept no client-controlled progress or scoring fields.
export const hintInputSchema = z.object({}).strict();

export const caseIdParamSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Case ID must be a valid MongoDB ID.');
export const clueIdParamSchema = internalId;
