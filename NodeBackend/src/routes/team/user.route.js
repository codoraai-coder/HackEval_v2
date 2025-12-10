import { Router } from "express";
import {
  teamRegister,
  teamLogin,
  getCurrentTeam
} from "../../controllers/team/user.controller.js";
import { verifyTeamJWT } from "../../middlewares/team.Auth.middleware.js";
// import pptSubmissionRouter from "./pptSubmission.route.js";

const router = Router();

// Public routes
router.post("/team_register", teamRegister);
router.post("/team_login", teamLogin);

// Protected route
router.get("/team", verifyTeamJWT, getCurrentTeam);

// router.use("/ppt", pptSubmissionRouter);

export default router;