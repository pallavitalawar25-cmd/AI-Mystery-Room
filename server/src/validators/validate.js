import { createMysteryGenerationSchema } from '../schemas/caseSchemas.js';

/** Parse input with a Zod schema or throw a small, safe validation error. */
export function validateData(schema, input, label = 'Input') {
  const result = schema.safeParse(input);
  if (result.success) {
    return result.data;
  }

  const error = new Error(`${label} is invalid.`);
  error.name = 'ValidationError';
  error.status = 400;
  error.code = 'INVALID_INPUT';
  error.issues = result.error.issues;
  throw error;
}

/** Validate Gemini's structured response against the difficulty rules. */
export function validateGeneratedMystery(mystery, difficulty) {
  return validateData(
    createMysteryGenerationSchema(difficulty),
    mystery,
    'Generated mystery',
  );
}
