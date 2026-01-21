import { Router } from "express";
import {
  adminLoginUser,
  adminRegisterUser,
  adminLogoutUser
} from "../../controllers/admin/user.controller.js";
import { refreshAccessToken } from "../../controllers/admin/user.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";


const router = new Router();

router.route("/register").post(adminRegisterUser);

router.route("/login").post(adminLoginUser);

router.route("/logout").post(verifyJWT, adminLogoutUser);

router.route("/refresh-token").post(refreshAccessToken);


export default router;
