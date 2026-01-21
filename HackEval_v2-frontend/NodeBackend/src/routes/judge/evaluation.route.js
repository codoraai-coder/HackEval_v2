import { Router } from "express";
import {
  getJudges,
  getTeamsForAssignment,
  assignJudgeToTeam,
  unassignJudgeFromTeam,
  getJudgeStatistics
} from "../../controllers/judge/evaluation.controller.js";
import { verifyJWTJudge } from "../../middlewares/judgeAuth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes

router.use(verifyJWTJudge);

// Routes
router.route("/").get(getJudges);
router.route("/teams").get(getTeamsForAssignment);
router.route("/assign").post(assignJudgeToTeam);
router.route("/unassign/:teamId").patch(unassignJudgeFromTeam);
router.route("/statistics").get(getJudgeStatistics);

export default router;