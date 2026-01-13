import { Router } from 'express';
import {
  getLeaderboard,
  getLeaderboardByRange,
  createOrUpdateLeaderboardEntry,
  bulkUploadLeaderboard,
  deleteLeaderboardEntry,
  clearLeaderboard
} from '../controllers/admin/leaderboard.controller.js';
import { adminAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Public endpoint - get leaderboard (no auth required for frontend display)
router.get('/ppt', getLeaderboard);

// Get top N entries
router.get('/ppt/top', getLeaderboardByRange);

// Protected endpoints - require admin auth
router.post('/ppt', adminAuthMiddleware, createOrUpdateLeaderboardEntry);
router.post('/ppt/bulk', adminAuthMiddleware, bulkUploadLeaderboard);
router.delete('/ppt/:id', adminAuthMiddleware, deleteLeaderboardEntry);
router.delete('/ppt', adminAuthMiddleware, clearLeaderboard);

export default router;
