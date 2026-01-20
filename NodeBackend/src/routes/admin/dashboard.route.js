import { Router } from "express";
import {
    getDashboardStats,
    getRecentActivities,
    getFinalSubmissions,
} from "../../controllers/admin/dashboard.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// Dashboard routes
router.route("/stats").get(verifyJWT, getDashboardStats);
router.route("/activities").get(verifyJWT, getRecentActivities);
router.route("/final-submissions").get(verifyJWT, getFinalSubmissions);

export default router;
