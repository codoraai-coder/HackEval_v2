import { Router } from "express";
import {
  getMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
  toggleAvailability,
  addTeamToMentor,
  removeTeamFromMentor,
  getMentorStatistics
} from "../../controllers/admin/mentor.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Routes
router.route("/")
  .get(getMentors)
  .post(createMentor);

router.route("/statistics")
  .get(getMentorStatistics);

router.route("/:id")
  .get(getMentorById)
  .put(updateMentor)
  .delete(deleteMentor);

router.route("/:id/availability")
  .patch(toggleAvailability);

router.route("/:id/teams")
  .post(addTeamToMentor)
  .delete(removeTeamFromMentor);

export default router;