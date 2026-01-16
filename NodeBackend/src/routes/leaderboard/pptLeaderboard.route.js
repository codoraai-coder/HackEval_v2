import { Router } from "express";
import { getPPTLeaderboard } from "../../controllers/leaderboard/pptLeaderboard.controller.js";

const router = Router();

// Public leaderboard route
router.get("/ppt", getPPTLeaderboard);

export default router;
