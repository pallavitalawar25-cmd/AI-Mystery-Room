import { Router } from 'express';
import {
  createCase,
  accuseCase,
  discoverClue,
  getCaseResult,
  getCaseOptions,
  getActiveCase,
  requestHint,
} from '../controllers/caseController.js';
import { generationRateLimit, hintRateLimit } from '../middleware/generationRateLimit.js';

const router = Router();

router.get('/options', getCaseOptions);
router.post('/', generationRateLimit, createCase);
router.get('/:id', getActiveCase);
router.post('/:id/clues/:clueId/discover', discoverClue);
router.post('/:id/hints', hintRateLimit, requestHint);
router.post('/:id/accuse', accuseCase);
router.get('/:id/result', getCaseResult);

export default router;
