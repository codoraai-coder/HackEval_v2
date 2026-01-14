import { Router } from "express";
import {
  submitMLEvaluation,
  getMLEvaluation,
  getAllMLEvaluations
} from "../../controllers/ml/mlEvaluation.controller.js";

const router = Router();


router.route("/submit").post(submitMLEvaluation);
router.route("/:teamId").get(getMLEvaluation);
router.route("/").get(getAllMLEvaluations);

export default router;
