import { Router } from "express";
import {
  getRounds,
  createRound,
  updateRound,
  deleteRound
} from "../../controllers/admin/round.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Routes
router.route("/")
  .get(getRounds)
  .post(createRound);

router.route("/:id")
  .put(updateRound)
  .delete(deleteRound);

export default router;