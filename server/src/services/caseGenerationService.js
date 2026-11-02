import { validateGeneratedMystery } from '../validators/validate.js';
import {
  GeminiProviderUnavailableError,
  validateMysteryFairness,
  generateMystery,
} from './geminiService.js';
import { generateTemplateMystery } from './templateMysteryService.js';

function validateMystery(mystery, difficulty) {
  const validated = validateGeneratedMystery(mystery, difficulty);
  validateMysteryFairness(validated);
  return validated;
}

/** Keep Gemini primary; use the deterministic template only for provider/network outages. */
export async function generateCaseContent(
  input,
  { geminiGenerator = generateMystery, templateGenerator = generateTemplateMystery } = {},
) {
  let generated;
  try {
    generated = await geminiGenerator(input);
  } catch (error) {
    if (!(error instanceof GeminiProviderUnavailableError)) throw error;
    generated = templateGenerator(input);
    return {
      mystery: validateMystery(generated, input.difficulty),
      generationSource: 'template',
    };
  }

  return {
    mystery: validateMystery(generated, input.difficulty),
    generationSource: 'gemini',
  };
}
