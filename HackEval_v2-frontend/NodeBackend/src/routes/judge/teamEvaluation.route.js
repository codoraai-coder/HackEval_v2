import { Router } from "express";
import {
  submitEvaluation,
  saveDraft,
  getEvaluation,
  getJudgeEvaluations
} from "../../controllers/judge/teamEvaluation.controller.js";
import { verifyJWTJudge } from "../../middlewares/judgeAuth.middleware.js";

const router = Router();

// Apply judge authentication middleware to all routes
router.use(verifyJWTJudge);

// Routes
router.route("/submit").post(submitEvaluation);
router.route("/save-draft").post(saveDraft);
router.route("/:teamId").get(getEvaluation);
router.route("/").get(getJudgeEvaluations);

// If you need a specific "current" route, you can add:
// router.route("/current/teams").get(getCurrentTeams); // Example

export default router;