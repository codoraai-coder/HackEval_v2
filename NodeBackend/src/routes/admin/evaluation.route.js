import { Router } from "express";
import {
  getJudges,
  getTeamsForAssignment,
  assignJudgeToTeam,
  unassignJudgeFromTeam,
  getJudgeStatistics,
  getAllEvaluations,
  getAllTeamsWithEvaluations
} from "../../controllers/judge/evaluation.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes

router.use(verifyJWT);

// Routes
router.route("/").get(getJudges);
router.route("/teams").get(getTeamsForAssignment);
router.route("/assign").post(assignJudgeToTeam);
router.route("/unassign/:teamId").patch(unassignJudgeFromTeam);
router.route("/statistics").get(getJudgeStatistics);

router.route("/all-evaluations").get(getAllEvaluations); // Changed from "/all"
router.route("/all-teams").get(getAllTeamsWithEvaluations); // Changed from "/teams"

export default router;