import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import routes
import adminRouter from "./routes/admin/user.route.js";
import roundRouter from "./routes/admin/round.route.js";
import judgeRouter from "./routes/judge/user.route.js";
import teamRouter from "./routes/team/user.route.js";
import judgeEvaluation from "./routes/judge/evaluation.route.js";
import adminEvaluation from "./routes/admin/evaluation.route.js";
import teamEvaluation from "./routes/judge/teamEvaluation.route.js";
import mentorRouter from "./routes/admin/mentor.route.js";
import pptSubmissionRouter from "./routes/team/pptSubmission.route.js"; // Add this line

const app = express();

app.use(
  cors(),
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

app.get("/", (req, res) => {
  return res.json({
    "Welcome Message": "Welcome to Hackathon Evaluation Backend",
  });
});

// define routes
app.use("/admin", adminRouter);
app.use("/admin/rounds", roundRouter);
app.use("/judge", judgeRouter);
app.use("/judge/evaluation", judgeEvaluation);
app.use("/admin/evaluation", adminEvaluation);
app.use("/team", teamRouter);
app.use("/judge/team-evaluation", teamEvaluation);
app.use("/mentor", mentorRouter);
app.use("/team/ppt", pptSubmissionRouter); // Add PPT submission routes

// Centralized error handler so frontend always gets JSON
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
});

export { app };
