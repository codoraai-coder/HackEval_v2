// import { asyncHandler } from "../../utils/asyncHandler.js";
// import { ApiError } from "../../utils/ApiError.js";
// import { ApiResponse } from "../../utils/ApiResponce.js";
// import { Team } from "../../models/team/user.model.js";
// import axios from 'axios';
// import fs from 'fs';
// import path from 'path';

// // Configure Flask API URL
// const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5001';

// const submitPPT = asyncHandler(async (req, res) => {
//   const { teamId } = req.params;

//   if (!req.file) {
//     throw new ApiError(400, "PPT file is required");
//   }

//   // Check if team exists
//   const team = await Team.findById(teamId);
//   if (!team) {
//     throw new ApiError(404, "Team not found");
//   }

//   // Check if team already submitted PPT
//   if (team.pptSubmission && team.pptSubmission.pptFile) {
//     throw new ApiError(400, "Team has already submitted a PPT. Only one submission allowed.");
//   }

//   try {
//     // Prepare file for Flask API
//     const pptFile = {
//       originalName: req.file.originalname,
//       storedName: req.file.filename,
//       filePath: req.file.path,
//       uploadDate: new Date()
//     };

//     // Update team with PPT file info (set status to processing)
//     team.pptSubmission = {
//       pptFile: pptFile,
//       analysisStatus: 'processing'
//     };
//     await team.save();

//     // Send to Flask API for analysis
//     const formData = new FormData();
//     const fileBuffer = fs.readFileSync(req.file.path);
//     const blob = new Blob([fileBuffer], { type: req.file.mimetype });
//     formData.append('file', blob, req.file.originalname);

//     const flaskResponse = await axios.post(`${FLASK_API_URL}/api/analyze`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//       timeout: 300000 // 5 minutes timeout for analysis
//     });

//     // Update team with analysis results
//     team.pptSubmission.analysisResults = flaskResponse.data.result;
//     team.pptSubmission.analysisStatus = 'completed';
//     team.pptSubmission.analysisDate = new Date();

//     await team.save();

//     // Clean up uploaded file after analysis
//     try {
//       fs.unlinkSync(req.file.path);
//     } catch (cleanupError) {
//       console.error('Error cleaning up file:', cleanupError);
//     }

//     return res.status(200).json(
//       new ApiResponse(
//         200,
//         {
//           team: team,
//           analysisId: flaskResponse.data.analysis_id
//         },
//         "PPT submitted and analyzed successfully"
//       )
//     );

//   } catch (error) {
//     // Handle analysis failure
//     team.pptSubmission.analysisStatus = 'failed';
//     team.pptSubmission.analysisError = error.message;
//     await team.save();

//     throw new ApiError(500, `PPT analysis failed: ${error.message}`);
//   }
// });

// const getPPTAnalysis = asyncHandler(async (req, res) => {
//   const { teamId } = req.params;

//   const team = await Team.findById(teamId);
//   if (!team) {
//     throw new ApiError(404, "Team not found");
//   }

//   if (!team.pptSubmission || !team.pptSubmission.pptFile) {
//     throw new ApiError(404, "No PPT submission found for this team");
//   }

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         pptSubmission: team.pptSubmission
//       },
//       "PPT analysis retrieved successfully"
//     )
//   );
// });

// const getTeamPPTByTeamName = asyncHandler(async (req, res) => {
//   const { teamName } = req.params;

//   const team = await Team.findOne({ teamName: teamName });
//   if (!team) {
//     throw new ApiError(404, "Team not found");
//   }

//   if (!team.pptSubmission || !team.pptSubmission.analysisResults) {
//     throw new ApiError(404, "No PPT analysis found for this team");
//   }

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         data: {
//           upload_timestamp: team.pptSubmission.pptFile.uploadDate,
//           total_weighted_score: team.pptSubmission.analysisResults.overall_score,
//           total_raw_score: calculateRawScore(team.pptSubmission.analysisResults.scores),
//           evaluation_scores: team.pptSubmission.analysisResults.scores,
//           summary: team.pptSubmission.analysisResults.summary,
//           feedback_positive: team.pptSubmission.analysisResults.feedback?.strengths?.join('. '),
//           feedback_criticism: team.pptSubmission.analysisResults.feedback?.improvements?.join('. '),
//           feedback_technical: "Technical analysis based on content and structure",
//           feedback_suggestions: team.pptSubmission.analysisResults.feedback?.suggestions?.join('. ')
//         }
//       },
//       "PPT analysis data retrieved successfully"
//     )
//   );
// });

// // Helper function to calculate raw score
// const calculateRawScore = (scores) => {
//   if (!scores) return 0;
//   return Object.values(scores).reduce((sum, score) => sum + score, 0);
// };

// export {
//   submitPPT,
//   getPPTAnalysis,
//   getTeamPPTByTeamName
// };

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { Team } from "../../models/team/user.model.js";
import axios from "axios";
import fs from "fs";
import {
  uploadOnCoudinary,
  deleteFromCloudinary,
} from "../../utils/cloudnary.js";

// External evaluator config
const EXTERNAL_API_URL =
  process.env.PPT_EVAL_URL || "https://pptEvaluation.com/api/submit";
const WEBHOOK_SECRET = process.env.PPT_WEBHOOK_SECRET || "super-secret";
const WEBHOOK_CALLBACK_URL =
  process.env.PPT_WEBHOOK_URL ||
  "https://yourdomain.com/team-ppt/webhook/evaluation-result";

// In-memory job queue
const pendingJobs = new Map(); // key: teamId, value: { cloudinaryPublicId, startedAt }
const dispatchQueue = [];
let activeWorkers = 0;
const MAX_CONCURRENCY = Number(process.env.PPT_QUEUE_CONCURRENCY || 3);

const enqueueJob = (job) => {
  dispatchQueue.push(job);
  setImmediate(processQueue);
};
const processQueue = async () => {
  if (activeWorkers >= MAX_CONCURRENCY) return;
  const job = dispatchQueue.shift();
  if (!job) return;
  activeWorkers++;
  try {
    await job.run();
  } catch (e) {
    console.error("Job run failed:", e.message);
    job.retries = (job.retries || 0) + 1;
    if (job.retries <= 5) {
      const delay = Math.min(60000, 2000 * Math.pow(2, job.retries));
      setTimeout(() => enqueueJob(job), delay);
    } else {
      job.onFail && job.onFail(e);
    }
  } finally {
    activeWorkers--;
    setImmediate(processQueue);
  }
};

// Submit PPT/PDF for evaluation
const submitPPT = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const leaderEmailFromBody = req.body.leaderEmail;

  if (!req.file) throw new ApiError(400, "PPT/PDF file is required");

  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, "Team not found");

  // Upload to Cloudinary
  const cloudRes = await uploadOnCoudinary(req.file.path);
  try {
    fs.unlinkSync(req.file.path);
  } catch {}
  if (!cloudRes) throw new ApiError(500, "Failed to upload file to Cloudinary");

  // Save submission info on team
  const leaderEmail =
    leaderEmailFromBody ||
    team.members?.find((m) => m.isLeader)?.email ||
    team.email;

  team.pptSubmission = {
    pptFile: {
      originalName: req.file.originalname,
      storedName: cloudRes.public_id,
      filePath: cloudRes.secure_url,
      uploadDate: new Date(),
    },
    analysisStatus: "processing",
    analysisError: undefined,
    analysisResults: undefined,
  };
  await team.save();

  // Prepare dispatch job to external API
  const job = {
    teamId: team._id.toString(),
    retries: 0,
    run: async () => {
      const payload = {
        fileUrl: cloudRes.secure_url,
        leaderEmail,
        callbackUrl: WEBHOOK_CALLBACK_URL,
        signature: WEBHOOK_SECRET,
      };
      await axios.post(EXTERNAL_API_URL, payload, { timeout: 30000 });
      pendingJobs.set(team._id.toString(), {
        cloudinaryPublicId: cloudRes.public_id,
        startedAt: Date.now(),
      });
    },
    onFail: async (err) => {
      const t = await Team.findById(team._id);
      if (t) {
        t.pptSubmission.analysisStatus = "failed";
        t.pptSubmission.analysisError = `Submit failed: ${err.message}`;
        await t.save();
      }
    },
  };
  enqueueJob(job);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { team },
        "PPT/PDF uploaded and queued for evaluation",
      ),
    );
});

// Get PPT analysis for a team
const getPPTAnalysis = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, "Team not found");
  if (!team.pptSubmission || !team.pptSubmission.pptFile) {
    throw new ApiError(404, "No PPT submission found for this team");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { pptSubmission: team.pptSubmission },
        "PPT analysis retrieved successfully",
      ),
    );
});

// Judge-friendly view by team name (summary mapping)
const calculateRawScore = (scores) => {
  if (!scores) return 0;
  try {
    return Array.from(Object.values(scores)).reduce(
      (sum, s) => sum + Number(s || 0),
      0,
    );
  } catch {
    return 0;
  }
};
const getTeamPPTByTeamName = asyncHandler(async (req, res) => {
  const { teamName } = req.params;
  const team = await Team.findOne({ teamName });
  if (!team) throw new ApiError(404, "Team not found");
  if (!team.pptSubmission || !team.pptSubmission.analysisResults) {
    throw new ApiError(404, "No PPT analysis found for this team");
  }
  const ar = team.pptSubmission.analysisResults;
  const data = {
    upload_timestamp: team.pptSubmission.pptFile.uploadDate,
    total_weighted_score: ar.overall_score,
    total_raw_score: calculateRawScore(ar.scores),
    evaluation_scores: ar.scores,
    summary: ar.summary,
    feedback_positive: ar.feedback?.strengths?.join(". "),
    feedback_criticism: ar.feedback?.improvements?.join(". "),
    feedback_suggestions: ar.feedback?.suggestions?.join(". "),
  };
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { data },
        "PPT analysis data retrieved successfully",
      ),
    );
});

// Webhook receiver from external API
const receiveEvaluationWebhook = asyncHandler(async (req, res) => {
  const { signature, leaderEmail, analysis } = req.body;

  if (signature !== WEBHOOK_SECRET) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid signature" });
  }
  if (!leaderEmail || !analysis) {
    return res
      .status(400)
      .json({ success: false, message: "Missing leaderEmail or analysis" });
  }

  const team = await Team.findOne({
    $or: [
      { email: leaderEmail },
      { "members.email": leaderEmail, "members.isLeader": true },
    ],
  });
  if (!team) {
    return res
      .status(404)
      .json({ success: false, message: "Leader team not found" });
  }

  // Persist analysis
  team.pptSubmission.analysisResults = analysis;
  team.pptSubmission.analysisStatus = "completed";
  team.pptSubmission.analysisDate = new Date();
  team.pptSubmission.analysisError = undefined;
  await team.save();

  // Delete Cloudinary asset
  const meta = pendingJobs.get(team._id.toString());
  const publicId =
    meta?.cloudinaryPublicId || team.pptSubmission?.pptFile?.storedName;
  if (publicId) {
    await deleteFromCloudinary(publicId);
  }
  pendingJobs.delete(team._id.toString());

  return res.status(200).json({ success: true });
});

// Resend sweep for stuck jobs
const initResendSweep = () => {
  const intervalMs = Number(process.env.PPT_RESEND_SWEEP_MS || 60 * 1000); // every 60s
  const processingMaxMs = Number(
    process.env.PPT_PROCESSING_MAX_MS || 15 * 60 * 1000,
  ); // 15 min

  setInterval(async () => {
    try {
      const teams = await Team.find({
        "pptSubmission.analysisStatus": "processing",
      });
      const now = Date.now();
      for (const t of teams) {
        const teamId = t._id.toString();
        const meta = pendingJobs.get(teamId);
        const startedAt =
          meta?.startedAt ||
          t.pptSubmission?.pptFile?.uploadDate?.getTime() ||
          now;
        if (now - startedAt > processingMaxMs) {
          // Re-dispatch job
          const leaderEmail =
            t.members?.find((m) => m.isLeader)?.email || t.email;
          const fileUrl = t.pptSubmission?.pptFile?.filePath;
          const publicId = t.pptSubmission?.pptFile?.storedName;

          const job = {
            teamId,
            retries: 0,
            run: async () => {
              const payload = {
                fileUrl,
                leaderEmail,
                callbackUrl: WEBHOOK_CALLBACK_URL,
                signature: WEBHOOK_SECRET,
              };
              await axios.post(EXTERNAL_API_URL, payload, { timeout: 30000 });
              pendingJobs.set(teamId, {
                cloudinaryPublicId: publicId,
                startedAt: Date.now(),
              });
            },
            onFail: async (err) => {
              const tt = await Team.findById(teamId);
              if (tt) {
                tt.pptSubmission.analysisStatus = "failed";
                tt.pptSubmission.analysisError = `Resend failed: ${err.message}`;
                await tt.save();
              }
            },
          };
          enqueueJob(job);
        }
      }
    } catch (e) {
      console.error("Resend sweep error:", e.message);
    }
  }, intervalMs);
};

export {
  submitPPT,
  getPPTAnalysis,
  getTeamPPTByTeamName,
  receiveEvaluationWebhook,
  initResendSweep,
};
