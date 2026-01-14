import { Router } from 'express';
import {
  getActiveRound,
  setActiveRound,
  getAllRoundStates,
  deleteRoundState
} from '../controllers/admin/roundState.controller.js';
import { adminAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Get active round (public endpoint for frontend polling)
router.get('/active', getActiveRound);

// Set active round (admin only)
router.post('/active', adminAuthMiddleware, setActiveRound);

// Get all round states (admin only)
router.get('/', adminAuthMiddleware, getAllRoundStates);

// Delete round state (admin only)
router.delete('/:id', adminAuthMiddleware, deleteRoundState);

export default router;
