import { Router } from "express";
import {
  judgeRegister,
  judgeLogin,
  judgeLogout,
  getCurrentJudge
} from "../../controllers/judge/user.controller.js";
import { verifyJWTJudge } from "../../middlewares/judgeAuth.middleware.js";

const router = Router();

router.route("/register").post(judgeRegister);
router.route("/login").post(judgeLogin);
// Secure routes
router.route("/logout").post(verifyJWTJudge, judgeLogout);
router.route("/current").get(verifyJWTJudge, getCurrentJudge);

export default router;